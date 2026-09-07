const OPTION_ASSET = "Equity and Index Options";

const SECTION_ALIASES = Object.freeze({
  "账户信息": "Account Information",
  "帐户信息": "Account Information",
  "净资产值": "Net Asset Value",
  "净资产价值": "Net Asset Value",
  "净资产值变更": "Change in NAV",
  "按市值计算的表现总结": "Mark-to-Market Performance Summary",
  "已实现和未实现的表现总结": "Realized & Unrealized Performance Summary",
  "现金报告": "Cash Report",
  "未平仓持仓": "Open Positions",
  "交易": "Trades",
  "存款和取款": "Deposits & Withdrawals",
  "费用": "Fees",
  "股息": "Dividends",
  "代扣税": "Withholding Tax",
  "利息": "Interest",
  "应计利息": "Interest Accruals",
  "应计股息的变化": "Change in Dividend Accruals",
  "金融产品信息": "Financial Instrument Information",
  "代码": "Codes",
  "注释/法律注释": "Notes/Legal Notes",
  "账单期间的总损益": "Total P/L for Statement Period"
});

const ROW_TYPE_ALIASES = Object.freeze({
  "标题": "Header",
  "表头": "Header",
  "数据": "Data",
  "资料": "Data",
  "明细": "Data"
});

const HEADER_ALIASES = Object.freeze({
  "域名称": "Field Name",
  "域值": "Field Value",
  "资产类型": "Asset Class",
  "之前合计": "Prior Total",
  "当前多头": "Current Long",
  "当前空头": "Current Short",
  "当前合计": "Current Total",
  "变更": "Change",
  "时间加权的收益率": "Time Weighted Rate of Return",
  "资产分类": "Asset Category",
  "先前 数量": "Prior Quantity",
  "当前 数量": "Current Quantity",
  "先前 价格": "Prior Price",
  "当前 价格": "Current Price",
  "按市值计盈亏 持仓": "Mark-to-Market P/L Position",
  "按市值计盈亏 交易": "Mark-to-Market P/L Transaction",
  "按市值计盈亏 佣金": "Mark-to-Market P/L Commissions",
  "按市值计盈亏 其它": "Mark-to-Market P/L Other",
  "按市值计盈亏 总数": "Mark-to-Market P/L Total",
  "费用调整": "Cost Adj.",
  "已实现的 短期利润": "Realized S/T Profit",
  "已实现的 短期损失": "Realized S/T Loss",
  "已实现的 长期利润": "Realized L/T Profit",
  "已实现的 长期损失": "Realized L/T Loss",
  "已实现的 总数": "Realized Total",
  "未实现的 短期利润": "Unrealized S/T Profit",
  "未实现的 短期损失": "Unrealized S/T Loss",
  "未实现的 长期利润": "Unrealized L/T Profit",
  "未实现的 长期损失": "Unrealized L/T Loss",
  "未实现的 总数": "Unrealized Total",
  "货币总结": "Currency Summary",
  "货币": "Currency",
  "总数": "Total",
  "证券": "Securities",
  "期货": "Futures",
  "数量": "Quantity",
  "合约乘数": "Mult",
  "成本价格": "Cost Price",
  "成本基础": "Cost Basis",
  "收盘价格": "Close Price",
  "价值": "Value",
  "未实现的损益": "Unrealized P/L",
  "日期/时间": "Date/Time",
  "交易价格": "T. Price",
  "收益": "Proceeds",
  "佣金/税": "Comm/Fee",
  "基础": "Basis",
  "已实现的损益": "Realized P/L",
  "按市值计算的损益": "MTM P/L",
  "佣金 USD": "Comm in USD",
  "以市值计（MTM） USD": "MTM in USD",
  "结算日期": "Settle Date",
  "描述": "Description",
  "金额": "Amount",
  "日期": "Date",
  "除息日": "Ex Date",
  "支付日期": "Pay Date",
  "税": "Tax",
  "费用": "Fee",
  "总股息率": "Gross Rate",
  "总额": "Gross Amount",
  "净额": "Net Amount",
  "合约编号": "Conid",
  "证券号码": "Security ID",
  "底层": "Underlying",
  "上市交易所": "Listing Exch",
  "乘数": "Multiplier",
  "类型": "Type",
  "意思": "Meaning",
  "代码 （继续）": "Code (Cont.)",
  "意思 （继续）": "Meaning (Cont.)",
  "注": "Note"
});

const FIELD_NAME_ALIASES = Object.freeze({
  "名称": "Name",
  "账户": "Account",
  "账户类型": "Account Type",
  "客户类型": "Customer Type",
  "账户能力": "Account Capabilities",
  "基础货币": "Base Currency",
  "开始价值": "Starting Value",
  "按市值计价": "Mark-to-Market",
  "存款和取款": "Deposits & Withdrawals",
  "股息": "Dividends",
  "代扣税款": "Withholding Tax",
  "利息": "Interest",
  "其它费用": "Other Fees",
  "佣金": "Commissions",
  "结束价值": "Ending Value",
  "期初应计余额": "Starting Accrual Balance",
  "应计利息": "Interest Accrued",
  "应计转回": "Accrual Reversal",
  "期末应计余额": "Ending Accrual Balance",
  "销售税": "Sales Tax",
  "其它外汇换算": "Other FX Translations"
});

const ASSET_CATEGORY_ALIASES = Object.freeze({
  "股票": "Stocks",
  "股票和指数期权": OPTION_ASSET,
  "期权": OPTION_ASSET,
  "外汇": "Forex",
  "总数": "Total",
  "总计（全部资产）": "Total (All Assets)",
  "支付和收到的经纪商利息": "Broker Interest Paid and Received",
  "其它费用": "Other Fees",
  "期初应计股息USD": "Starting Dividend Accruals in USD",
  "期末应计股息USD": "Ending Dividend Accruals in USD"
});

const ASSET_CLASS_ALIASES = Object.freeze({
  "现金": "Cash",
  "股票": "Stock",
  "总数": "Total"
});

const CURRENCY_ALIASES = Object.freeze({
  "基础货币总结": "Base Currency Summary",
  "总数": "Total",
  "总数 USD": "Total in USD",
  "总数 存款和取款 在 USD": "Total Deposits & Withdrawals in USD"
});

const CASH_ACTIVITY_ALIASES = Object.freeze({
  "存款": "Deposits",
  "取款": "Withdrawals"
});

const VALUE_ALIASES = Object.freeze({
  "Field Name": FIELD_NAME_ALIASES,
  "Asset Category": ASSET_CATEGORY_ALIASES,
  "Asset Class": ASSET_CLASS_ALIASES,
  "Currency": CURRENCY_ALIASES,
  "Currency Summary": CASH_ACTIVITY_ALIASES
});
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
  const periodPerformance = parsePeriodPerformance(
    sections["Cash Report"],
    navChange,
    nav,
    parseReportedPeriodProfitLoss(csvText)
  );
  const assetAllocation = summarizePositions(positions, "assetCategory");
  const currencyExposure = summarizePositions(positions, "currency");
  const warnings = buildWarnings(sections, nav, positions, tradeSummary);

  return {
    accountInfo,
    baseCurrency: accountInfo.baseCurrency,
    exchangeRates,
    nav,
    navChange,
    periodPerformance,
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

    const sectionName = normalizeSectionName(columns[0]);
    const rowType = normalizeRowType(columns[1]);

    if (rowType === "Header") {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        section: sectionName,
        headers: columns.map((header, index) =>
          normalizeHeader(sectionName, header, index, columns.length)
        ),
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
        if (header) {
          const value = (dataRow[index] ?? "").trim();
          row[header] = normalizeValue(header, value);
        }
      });
      sections[block.section].push(row);
    }

    return sections;
  }, {});
}

function normalizeSectionName(value) {
  return SECTION_ALIASES[value] || value;
}

function normalizeRowType(value) {
  return ROW_TYPE_ALIASES[value] || value;
}

function normalizeHeader(sectionName, value, index, columnCount) {
  if (value === "代码") {
    if (sectionName === "Codes" || index === columnCount - 1) return "Code";
    return "Symbol";
  }
  return HEADER_ALIASES[value] || value;
}

function normalizeValue(header, value) {
  return VALUE_ALIASES[header]?.[value] || value;
}

function parseReportedPeriodProfitLoss(csvText) {
  const rows = splitCsvRows(csvText).map(parseCsvLine);
  for (const row of rows) {
    const sectionName = normalizeSectionName(String(row[0] ?? "").trim().replace(/^\uFEFF/, ""));
    if (sectionName !== "Total P/L for Statement Period") continue;

    for (let index = row.length - 1; index > 0; index -= 1) {
      const value = String(row[index] ?? "").trim();
      if (value) return toNumber(value);
    }
  }
  return null;
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
    ["dividends", "股息", "Dividends"],
    ["withholdingTax", "代扣税", "Withholding Tax"],
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

function parsePeriodPerformance(cashRows = [], navChange = [], nav = {}, reportedProfitLoss = null) {
  const navFields = new Map(navChange.map((row) => [row.key, row.value]));
  const baseCashRows = cashRows.filter((row) => row.Currency === "Base Currency Summary");
  const deposits = sumCashActivity(baseCashRows, "Deposits");
  const rawWithdrawals = sumCashActivity(baseCashRows, "Withdrawals");
  const hasCashFlowBreakdown = baseCashRows.some((row) =>
    row["Currency Summary"] === "Deposits" || row["Currency Summary"] === "Withdrawals"
  );
  const fallbackNetCashFlow = navFields.get("depositsAndWithdrawals") || 0;
  const netCashFlow = hasCashFlowBreakdown ? deposits + rawWithdrawals : fallbackNetCashFlow;
  const startingValue = navFields.get("startingValue") || 0;
  const endingValue = navFields.get("endingValue") || nav.total || 0;
  const calculatedProfitLoss = endingValue - startingValue - netCashFlow;

  return {
    startingValue,
    endingValue,
    deposits,
    withdrawals: Math.abs(rawWithdrawals),
    netCashFlow,
    navChange: endingValue - startingValue,
    calculatedProfitLoss,
    profitLoss: reportedProfitLoss ?? calculatedProfitLoss,
    timeWeightedReturn: nav.rateOfReturn || 0,
    source: reportedProfitLoss === null ? "calculated" : "statement"
  };
}

function sumCashActivity(rows, activity) {
  return rows
    .filter((row) => row["Currency Summary"] === activity)
    .reduce((sum, row) => sum + toNumber(row.Total), 0);
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
  const grossRealizedProfit =
    toNumber(row["Realized S/T Profit"]) + toNumber(row["Realized L/T Profit"]);
  const grossRealizedLoss = Math.abs(
    toNumber(row["Realized S/T Loss"]) + toNumber(row["Realized L/T Loss"])
  );

  return {
    realized: toNumber(row["Realized Total"]),
    unrealized: toNumber(row["Unrealized Total"]),
    total: toNumber(row.Total),
    grossRealizedProfit,
    grossRealizedLoss,
    realizedProfitLossRatio: grossRealizedLoss > 0 ? grossRealizedProfit / grossRealizedLoss : null
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
