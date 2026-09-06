const OPTION_ASSET = "Equity and Index Options";

export class ReportError extends Error {
  constructor(code, currency = "") {
    super(code);
    this.name = "ReportError";
    this.code = code;
    this.currency = currency;
  }
}

function currencyCode(value, fallback = "USD") {
  const currency = String(value || fallback).trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new ReportError("invalidCurrency");
  return currency;
}

function getRate(rates, currency) {
  const code = currencyCode(currency);
  if (!Object.hasOwn(rates, code) || !Number.isFinite(rates[code]) || rates[code] <= 0) {
    throw new ReportError("missingExchangeRate", code);
  }
  return rates[code];
}

export function parseIbkrReport(csvText) {
  const sections = collectSections(csvText);
  const accountInfo = parseAccountInfo(sections);
  const exchangeRates = parseExchangeRates(sections, accountInfo.baseCurrency);
  const dividendIncome = parseDividendIncome(sections, exchangeRates);
  const positions = applyPositionDividends(
    parseOpenPositions(sections["Open Positions"], exchangeRates),
    dividendIncome
  );
  const tradeSummary = analyzeTrades(sections.Trades, exchangeRates);
  const tradeDetails = parseTradeDetails(sections.Trades, exchangeRates);
  const { plSummary, closedPositions } = parsePlSummary(
    sections["Realized & Unrealized Performance Summary"],
    sections.Trades
  );
  const monthlySummary = analyzeMonthlySummary(sections, exchangeRates);
  const dailyTradeStats = analyzeDailyTrades(sections.Trades, exchangeRates);
  const tickerPL = analyzeTickerPL(closedPositions);
  const nav = parseNetAssetValue(sections["Net Asset Value"], accountInfo.baseCurrency);
  const navChange = parseNavChange(sections["Change in NAV"]);
  const assetAllocation = summarizePositions(positions, "assetCategory");
  const currencyExposure = summarizePositions(positions, "currency");
  const warnings = buildWarnings(sections, nav, positions, tradeSummary);

  return {
    accountInfo,
    baseCurrency: accountInfo.baseCurrency,
    exchangeRates,
    nav,
    navChange,
    plSummary,
    dividendIncome,
    positions,
    closedPositions,
    monthlySummary,
    dailyTradeStats,
    tickerPL,
    assetAllocation,
    currencyExposure,
    tradeSummary,
    tradeDetails,
    sectionStats: Object.fromEntries(
      Object.entries(sections).map(([name, rows]) => [name, rows.length])
    ),
    warnings,
    generatedAt: new Date().toISOString()
  };
}

function collectSections(csvText) {
  const rows = splitCsvRows(csvText)
    .map(parseCsvLine)
    .filter((row) => row.some((cell) => cell.trim() !== ""));

  const blocks = [];
  let currentBlock = null;

  for (const rawColumns of rows) {
    const columns = rawColumns.map((cell, index) => {
      const clean = String(cell ?? "").trim();
      return index === 0 ? clean.replace(/^\uFEFF/, "") : clean;
    });

    if (columns.length < 2) continue;

    const sectionName = columns[0];
    const rowType = columns[1];

    if (rowType === "Header") {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        section: sectionName,
        headers: columns,
        rows: []
      };
      continue;
    }

    if (rowType === "Data" && currentBlock) {
      currentBlock.rows.push(columns);
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  return blocks.reduce((sections, block) => {
    if (!sections[block.section]) sections[block.section] = [];

    for (const dataRow of block.rows) {
      const row = {};
      block.headers.forEach((header, index) => {
        if (header) row[header] = (dataRow[index] ?? "").trim();
      });
      sections[block.section].push(row);
    }

    return sections;
  }, {});
}

function splitCsvRows(text) {
  const rows = [];
  let row = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      row += char + next;
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      row += char;
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (row.trim()) rows.push(row);
      row = "";
      if (char === "\r" && next === "\n") index += 1;
      continue;
    }

    row += char;
  }

  if (row.trim()) rows.push(row);
  return rows;
}

export function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  cells.push(value);
  return cells;
}

function parseAccountInfo(sections) {
  const infoRows = sections["Account Information"] || [];
  const statementRows = sections.Statement || [];
  const infoMap = new Map(
    infoRows.map((row) => [row["Field Name"], row["Field Value"]])
  );
  const statementMap = new Map(
    statementRows.map((row) => [row["Field Name"], row["Field Value"]])
  );

  return {
    account: infoMap.get("Account") || "",
    name: infoMap.get("Name") || "",
    baseCurrency: currencyCode(infoMap.get("Base Currency")),
    period: statementMap.get("Period") || infoMap.get("Period") || ""
  };
}

function parseExchangeRates(sections, baseCurrency) {
  const rates = { [baseCurrency || "USD"]: 1 };
  const mtmRows = sections["Mark-to-Market Performance Summary"] || [];

  for (const row of mtmRows) {
    if (row["Asset Category"] !== "Forex") continue;

    const currency = currencyCode(row.Symbol);
    const rate = toNumber(row["Current Price"]);
    if (currency && currency !== baseCurrency && rate > 0) {
      rates[currency] = rate;
    }
  }

  // Explicit conversion rates take precedence over the MTM fallback.
  // Repeated dated entries use the latest report date, regardless of row order.
  const datedRates = new Map();
  for (const row of sections["Base Currency Exchange Rate"] || []) {
    if (!row.Currency || row.Currency.startsWith("Total")) continue;
    const currency = currencyCode(row.Currency);
    const rate = toNumber(readValue(row, ["Rate", "Exchange Rate"]));
    const date = parseDate(row.Date)?.getTime() ?? 0;
    if (currency !== baseCurrency && rate > 0 && date >= (datedRates.get(currency) ?? -1)) {
      rates[currency] = rate;
      datedRates.set(currency, date);
    }
  }

  return rates;
}

function parseNetAssetValue(rows = [], baseCurrency) {
  const cashRow = rows.find((row) => row["Asset Class"] === "Cash");
  const totalRow = rows.find((row) => row["Asset Class"] === "Total");
  const returnRow = rows.find((row) => row["Time Weighted Rate of Return"]);

  return {
    cash: toNumber(readValue(cashRow, ["Current Total", "Total"])),
    total: toNumber(readValue(totalRow, ["Current Total", "Total"])),
    rateOfReturn: toNumber(readValue(returnRow, ["Time Weighted Rate of Return"])),
    baseCurrency
  };
}

function parseNavChange(rows = []) {
  const map = new Map(rows.map((row) => [row["Field Name"], row["Field Value"]]));
  const fields = [
    ["startingValue", "期初净值", "Starting Value"],
    ["markToMarket", "盯市变化", "Mark-to-Market"],
    ["depositsAndWithdrawals", "出入金", "Deposits & Withdrawals"],
    ["interest", "利息", "Interest"],
    ["changeInInterestAccruals", "应计利息", "Change in Interest Accruals"],
    ["otherFees", "其他费用", "Other Fees"],
    ["commissions", "佣金", "Commissions"],
    ["salesTax", "销售税", "Sales Tax"],
    ["otherFXTranslations", "汇兑折算", "Other FX Translations"],
    ["endingValue", "期末净值", "Ending Value"]
  ];

  return fields.map(([key, label, source]) => ({
    key,
    label,
    value: toNumber(map.get(source))
  }));
}

function parsePlSummary(rows = [], trades = []) {
  const plSummary = {
    stocks: { realized: 0, unrealized: 0, total: 0 },
    options: { realized: 0, unrealized: 0, total: 0 },
    forex: { realized: 0, unrealized: 0, total: 0 },
    total: { realized: 0, unrealized: 0, total: 0 }
  };
  const closeDateBySymbol = latestCloseDateBySymbol(trades);
  const closedPositions = [];
  if (!rows.length) {
    for (const key of Object.keys(plSummary)) {
      plSummary[key] = { realized: null, unrealized: null, total: null };
    }
    return { plSummary, closedPositions };
  }
  plSummary.total = { realized: null, unrealized: null, total: null };
  let lastAssetCategory = "";

  for (const row of rows) {
    let assetCategory = row["Asset Category"] || "";
    if (assetCategory === OPTION_ASSET) assetCategory = "Options";

    const symbol = row.Symbol;

    if (assetCategory && !assetCategory.startsWith("Total")) {
      lastAssetCategory = assetCategory;
    }

    if (symbol && assetCategory && !assetCategory.startsWith("Total")) {
      const realizedPL = toNumber(row["Realized Total"]);
      if (realizedPL !== 0) {
        closedPositions.push({
          assetCategory,
          symbol,
          baseSymbol: parseOptionSymbol(symbol).baseSymbol,
          realizedPL,
          closeDate: closeDateBySymbol.get(symbol) || ""
        });
      }
    }

    if (assetCategory === "Total") {
      const summary = readPlNumbers(row);
      if (lastAssetCategory === "Stocks") plSummary.stocks = summary;
      if (lastAssetCategory === "Options") plSummary.options = summary;
      if (lastAssetCategory === "Forex") plSummary.forex = summary;
    }

    if (assetCategory === "Total (All Assets)") {
      plSummary.total = readPlNumbers(row);
    }
  }

  return { plSummary, closedPositions };
}

function latestCloseDateBySymbol(trades = []) {
  const map = new Map();
  const closingTrades = trades
    .filter((row) => row.DataDiscriminator === "Order" && toNumber(row["Realized P/L"]) !== 0)
    .map((row) => ({
      row,
      date: parseDate(row["Date/Time"])
    }))
    .filter((item) => item.date)
    .sort((a, b) => b.date - a.date);

  for (const item of closingTrades) {
    const symbol = item.row.Symbol;
    if (symbol && !map.has(symbol)) {
      map.set(symbol, item.date.toISOString());
    }
  }

  return map;
}

function readPlNumbers(row) {
  return {
    realized: toNumber(row["Realized Total"]),
    unrealized: toNumber(row["Unrealized Total"]),
    total: toNumber(row.Total)
  };
}

function parseOpenPositions(rows = [], exchangeRates) {
  return rows
    .filter((row) => row.DataDiscriminator === "Summary" && row.Symbol)
    .map((row) => {
      let assetCategory = row["Asset Category"] || "Other";
      if (assetCategory === OPTION_ASSET) assetCategory = "Options";

      const currency = currencyCode(row.Currency);
      const rate = getRate(exchangeRates, currency);
      const option = parseOptionSymbol(row.Symbol);
      const quantity = toNumber(row.Quantity);
      const costBasis = toNumber(row["Cost Basis"]);
      const value = toNumber(row.Value);
      const unrealizedPL = toNumber(row["Unrealized P/L"]);

      return {
        assetCategory,
        symbol: row.Symbol,
        baseSymbol: option.baseSymbol,
        quantity,
        side: quantity < 0 ? "Short" : "Long",
        multiplier: toNumber(row.Mult),
        costBasis,
        closePrice: toNumber(row["Close Price"]),
        value,
        dividends: 0,
        unrealizedPL,
        baseCostBasis: costBasis * rate,
        baseValue: value * rate,
        baseDividends: 0,
        baseUnrealizedPL: unrealizedPL * rate,
        exchangeRate: rate,
        currency,
        isOption: option.isOption,
        optionType: option.optionType || "",
        strikePrice: option.strikePrice || 0,
        expiry: option.expiry || ""
      };
    })
    .sort((a, b) => Math.abs(b.baseValue ?? b.value) - Math.abs(a.baseValue ?? a.value));
}

function parseDividendIncome(sections, exchangeRates) {
  const bySymbol = {};
  const bySymbolBase = {};
  let total = 0;

  for (const row of sections.Dividends || []) {
    if (row.Currency === "Total") continue;

    const symbol = parseDividendSymbol(row);
    if (!symbol) continue;

    const currency = currencyCode(row.Currency);
    const value = toNumber(row.Amount);
    if (!value) continue;
    const baseValue = value * getRate(exchangeRates, currency);

    bySymbol[symbol] = (bySymbol[symbol] || 0) + value;
    bySymbolBase[symbol] = (bySymbolBase[symbol] || 0) + baseValue;
    total += baseValue;
  }

  return {
    bySymbol,
    bySymbolBase,
    total
  };
}

function applyPositionDividends(positions, dividendIncome) {
  const dividendBySymbol = dividendIncome?.bySymbol || {};
  const baseDividendBySymbol = dividendIncome?.bySymbolBase || {};

  return positions.map((position) => {
    // A stock dividend belongs to the stock, never to derivatives of that stock.
    if (position.assetCategory !== "Stocks" || position.isOption) return position;
    const dividends = dividendBySymbol[position.symbol] || 0;
    const baseDividends = baseDividendBySymbol[position.symbol] || 0;
    return {
      ...position,
      dividends,
      baseDividends
    };
  });
}

function analyzeTrades(rows = [], exchangeRates) {
  const orderTrades = rows.filter((row) => row.DataDiscriminator === "Order");
  let totalCommissions = 0;
  let optionPremium = 0;
  let realizedPL = 0;
  let stockOrders = 0;
  let optionOrders = 0;
  let forexOrders = 0;
  const dates = [];
  const topRealizedTrades = [];

  for (const row of orderTrades) {
    const date = parseDate(row["Date/Time"]);
    if (date) dates.push(date);

    const category = row["Asset Category"];
    if (category === "Stocks") stockOrders += 1;
    if (category === OPTION_ASSET) optionOrders += 1;
    if (category === "Forex") forexOrders += 1;

    const currency = currencyCode(row.Currency);
    const rate = getRate(exchangeRates, currency);
    const rawRealizedPL = toNumber(row["Realized P/L"]);
    const commission = convertTradeField(row, exchangeRates, "commission");
    const tradeRealized = rawRealizedPL * rate;
    totalCommissions += Math.abs(commission);
    realizedPL += tradeRealized;

    if (category === OPTION_ASSET && row.Code?.includes("O") && toNumber(row.Quantity) < 0) {
      optionPremium += toNumber(row.Proceeds) * rate + commission;
    }

    if (rawRealizedPL !== 0) {
      topRealizedTrades.push({
        date: date ? date.toISOString() : "",
        symbol: row.Symbol || "",
        category,
        realizedPL: rawRealizedPL,
        baseRealizedPL: tradeRealized,
        exchangeRate: rate,
        currency
      });
    }
  }

  topRealizedTrades.sort((a, b) => Math.abs(b.baseRealizedPL ?? b.realizedPL) - Math.abs(a.baseRealizedPL ?? a.realizedPL));

  return {
    orderCount: orderTrades.length,
    stockOrders,
    optionOrders,
    forexOrders,
    totalCommissions,
    optionPremium,
    realizedPL,
    firstTradeDate: dates.length ? new Date(Math.min(...dates)).toISOString() : "",
    lastTradeDate: dates.length ? new Date(Math.max(...dates)).toISOString() : "",
    topRealizedTrades: topRealizedTrades.slice(0, 10)
  };
}

function parseTradeDetails(rows = [], exchangeRates) {
  return (rows || [])
    .filter((row) => row.DataDiscriminator === "Order")
    .map((row) => {
      const date = parseDate(row["Date/Time"]);
      const currency = currencyCode(row.Currency);
      const rate = getRate(exchangeRates, currency);
      const quantity = toNumber(row.Quantity);
      const price = toNumber(row["T. Price"]);
      const proceeds = toNumber(row.Proceeds);
      const commission = toNumber(readCommission(row));
      const realizedPL = toNumber(row["Realized P/L"]);
      const mtmPL = readTradeField(row, "mtm").amount;

      return {
        date: date ? dateKey(date) : "",
        dateTime: date ? date.toISOString() : "",
        month: date ? monthKey(date) : "",
        symbol: row.Symbol || "",
        baseSymbol: parseOptionSymbol(row.Symbol || "").baseSymbol || row.Symbol || "",
        assetCategory: row["Asset Category"] || "",
        currency,
        side: quantity < 0 ? "Sell" : "Buy",
        quantity,
        price,
        proceeds,
        grossValue: Math.abs(proceeds),
        commission,
        commissionCurrency: readTradeField(row, "commission").currency,
        realizedPL,
        mtmPL,
        mtmCurrency: readTradeField(row, "mtm").currency,
        baseProceeds: proceeds * rate,
        baseGrossValue: Math.abs(proceeds * rate),
        baseCommission: convertTradeField(row, exchangeRates, "commission"),
        baseRealizedPL: realizedPL * rate,
        baseMtmPL: convertTradeField(row, exchangeRates, "mtm"),
        exchangeRate: rate,
        code: row.Code || ""
      };
    })
    .filter((row) => row.date)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
}

function analyzeDailyTrades(rows = [], exchangeRates) {
  const daily = new Map();
  const ensureDay = (date) => {
    const key = dateKey(date);
    if (!daily.has(key)) {
      daily.set(key, {
        date: key,
        month: monthKey(date),
        day: date.getDate(),
        tradeCount: 0,
        realizedPL: 0,
        mtmPL: 0,
        grossTradeValue: 0,
        commissions: 0,
        symbols: new Set()
      });
    }
    return daily.get(key);
  };

  for (const trade of rows || []) {
    if (trade.DataDiscriminator !== "Order") continue;

    const date = parseDate(trade["Date/Time"]);
    if (!date) continue;

    const currency = currencyCode(trade.Currency);
    const rate = getRate(exchangeRates, currency);
    const row = ensureDay(date);
    const symbol = trade.Symbol || "";

    row.tradeCount += 1;
    row.realizedPL += toNumber(trade["Realized P/L"]) * rate;
    row.mtmPL += convertTradeField(trade, exchangeRates, "mtm");
    row.grossTradeValue += Math.abs(toNumber(trade.Proceeds) * rate);
    row.commissions += Math.abs(convertTradeField(trade, exchangeRates, "commission"));
    if (symbol) row.symbols.add(symbol);
  }

  return Array.from(daily.values())
    .map((row) => ({
      ...row,
      symbolCount: row.symbols.size,
      symbols: Array.from(row.symbols).sort()
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function analyzeMonthlySummary(sections, exchangeRates) {
  const monthly = new Map();
  const ensureMonth = (date) => {
    const key = monthKey(date);
    if (!monthly.has(key)) {
      monthly.set(key, {
        month: key,
        optionsPL: 0,
        optionsPremium: 0,
        stocksPL: 0,
        forexPL: 0,
        syepIncome: 0,
        interest: 0,
        commissions: 0,
        forexCommissions: 0,
        fees: 0,
        net: 0
      });
    }
    return monthly.get(key);
  };

  for (const trade of sections.Trades || []) {
    if (trade.DataDiscriminator !== "Order") continue;

    const date = parseDate(trade["Date/Time"]);
    if (!date) continue;

    const row = ensureMonth(date);
    const currency = currencyCode(trade.Currency);
    const rate = getRate(exchangeRates, currency);
    const category = trade["Asset Category"];
    const realized = toNumber(trade["Realized P/L"]) * rate;
    const commission = convertTradeField(trade, exchangeRates, "commission");

    row.commissions += Math.abs(commission);

    if (category === OPTION_ASSET) {
      row.optionsPL += realized;
      if (trade.Code?.includes("O") && toNumber(trade.Quantity) < 0) {
        row.optionsPremium += toNumber(trade.Proceeds) * rate + commission;
      }
    } else if (category === "Stocks") {
      row.stocksPL += realized;
    } else if (category === "Forex") {
      const mtm = readTradeField(trade, "mtm");
      row.forexPL += mtm.present ? convertTradeField(trade, exchangeRates, "mtm") : realized;
      if (mtm.present) row.forexCommissions += commission;
    }
  }

  for (const row of sections["Forex P/L Details"] || []) {
    const date = parseDate(row.Date);
    if (!date) continue;
    ensureMonth(date).forexPL += toNumber(row["Realized P/L"]);
  }

  for (const row of sections["Stock Yield Enhancement Program Securities Lent Interest Details"] || []) {
    const date = parseDate(row["Value Date"]);
    if (!date) continue;
    const currency = currencyCode(row.Currency);
    ensureMonth(date).syepIncome += toNumber(row["Interest Paid to Customer"]) * getRate(exchangeRates, currency);
  }

  for (const row of sections.Interest || []) {
    const date = parseDate(row.Date);
    if (!date) continue;
    const currency = currencyCode(row.Currency);
    ensureMonth(date).interest += toNumber(row.Amount) * getRate(exchangeRates, currency);
  }

  for (const row of sections.Fees || []) {
    const date = parseDate(row.Date);
    if (!date) continue;
    const currency = currencyCode(row.Currency);
    ensureMonth(date).fees += Math.abs(toNumber(row.Amount) * getRate(exchangeRates, currency));
  }

  return Array.from(monthly.values())
    .map((row) => ({
      ...row,
      net:
        row.optionsPL +
        row.stocksPL +
        row.forexPL +
        row.syepIncome +
        row.interest +
        // Stock/option Realized P/L already includes commissions. Forex MTM does not.
        row.forexCommissions -
        row.fees
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function analyzeTickerPL(closedPositions) {
  const map = new Map();

  for (const position of closedPositions) {
    const key = position.baseSymbol || position.symbol;
    map.set(key, (map.get(key) || 0) + position.realizedPL);
  }

  return Array.from(map.entries())
    .map(([ticker, realizedPL]) => ({ ticker, realizedPL }))
    .sort((a, b) => Math.abs(b.realizedPL) - Math.abs(a.realizedPL));
}

function summarizePositions(positions, key) {
  const map = new Map();

  for (const position of positions) {
    const name = position[key] || "Other";
    const value = position.baseValue ?? position.value;
    map.set(name, (map.get(name) || 0) + Math.abs(value));
  }

  const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);
  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      value,
      weight: total > 0 ? value / total : 0
    }))
    .sort((a, b) => b.value - a.value);
}

function buildWarnings(sections, nav, positions, tradeSummary) {
  const warnings = [];

  if (!sections["Account Information"]?.length) warnings.push("missingAccountInfo");
  if (!sections["Net Asset Value"]?.length) warnings.push("missingNetAssetValue");
  if (!sections.Trades?.length) warnings.push("missingTrades");
  if (!sections["Open Positions"]?.length) warnings.push("missingPositions");
  if (!sections["Realized & Unrealized Performance Summary"]?.length) {
    warnings.push("missingPlSummary");
  } else if (!sections["Realized & Unrealized Performance Summary"].some(row => row["Asset Category"] === "Total (All Assets)")) {
    warnings.push("missingPlTotal");
  }
  if (!nav.total && positions.length === 0 && tradeSummary.orderCount === 0) {
    warnings.push("sparseReport");
  }

  return warnings;
}

function parseOptionSymbol(symbol) {
  if (!symbol) return { isOption: false, baseSymbol: "" };

  const parts = symbol.trim().split(/\s+/);
  const baseSymbol = parts[0] || "";
  if (parts.length < 4) return { isOption: false, baseSymbol };

  const optionType = parts[parts.length - 1];
  const strikePrice = toNumber(parts[parts.length - 2]);
  const expiry = parts[parts.length - 3];

  if ((optionType === "P" || optionType === "C") && strikePrice > 0) {
    return {
      isOption: true,
      optionType,
      strikePrice,
      expiry,
      baseSymbol
    };
  }

  return { isOption: false, baseSymbol };
}

function parseDividendSymbol(row = {}) {
  const explicitSymbol = String(row.Symbol || "").trim();
  if (explicitSymbol && explicitSymbol !== "Total") {
    return parseOptionSymbol(explicitSymbol).baseSymbol || explicitSymbol;
  }

  const description = String(row.Description || "").trim();
  const parenMatch = description.match(/^([A-Z][A-Z0-9.\-]{0,12})\s*\(/);
  if (parenMatch) return parenMatch[1];

  const textMatch = description.match(/\b([A-Z][A-Z0-9.\-]{0,12})\b(?=.*\b(?:Cash Dividend|Dividend|Payment in Lieu)\b)/i);
  return textMatch ? textMatch[1] : "";
}

function readCommission(row) {
  return readTradeField(row, "commission").amount;
}

function readTradeField(row, kind) {
  const keys = kind === "commission" ? ["Comm/Fee", "Commission"] : ["MTM P/L"];
  const prefix = kind === "commission" ? /^Comm in (.+)$/i : /^MTM in (.+)$/i;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") {
      return { amount: toNumber(row[key]), currency: currencyCode(row.Currency), present: true };
    }
  }
  const entry = Object.entries(row).find(([key]) => prefix.test(key));
  if (entry) {
    return { amount: toNumber(entry[1]), currency: currencyCode(entry[0].match(prefix)[1]), present: entry[1] !== "" };
  }
  return { amount: 0, currency: currencyCode(row.Currency), present: false };
}

function convertTradeField(row, rates, kind) {
  const field = readTradeField(row, kind);
  return field.amount === 0 ? 0 : field.amount * getRate(rates, field.currency);
}

function readValue(row, keys) {
  if (!row) return "";
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") return row[key];
  }
  return "";
}

function toNumber(value) {
  if (value === undefined || value === null) return 0;
  const raw = String(value).trim();
  if (!raw || raw === "--") return 0;

  const negative = raw.startsWith("(") && raw.endsWith(")");
  const cleaned = raw.replace(/[,$%\s()]/g, "");
  const number = Number.parseFloat(cleaned);
  if (Number.isNaN(number)) return 0;
  return negative ? -number : number;
}

function parseDate(value) {
  if (!value) return null;
  const normalized = String(value).trim().replace(/\s+/g, " ");

  const isoLike = normalized.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[,\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (isoLike) {
    return buildLocalDate(isoLike[1], isoLike[2], isoLike[3], isoLike[4], isoLike[5], isoLike[6]);
  }

  const slashDate = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (slashDate) {
    return buildLocalDate(slashDate[3], slashDate[1], slashDate[2], slashDate[4], slashDate[5], slashDate[6]);
  }

  const date = new Date(normalized.replace(/,/g, " "));
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildLocalDate(year, month, day, hour = 0, minute = 0, second = 0) {
  const values = [year, month, day, hour || 0, minute || 0, second || 0].map(Number);
  if (values.some((part) => !Number.isFinite(part))) return null;

  const date = new Date(values[0], values[1] - 1, values[2], values[3], values[4], values[5]);
  if (
    date.getFullYear() !== values[0] ||
    date.getMonth() !== values[1] - 1 ||
    date.getDate() !== values[2]
  ) {
    return null;
  }
  return date;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
