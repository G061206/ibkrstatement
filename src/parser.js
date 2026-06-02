const OPTION_ASSET = "Equity and Index Options";
const SECTION_ALIASES = {
  账户信息: "Account Information",
  净资产值: "Net Asset Value",
  净资产值变更: "Change in NAV",
  按市值计算的表现总结: "Mark-to-Market Performance Summary",
  已实现和未实现的表现总结: "Realized & Unrealized Performance Summary",
  现金报告: "Cash Report",
  未平仓持仓: "Open Positions",
  外汇结余: "Forex Balances",
  净股票持仓总结: "Net Stock Position Summary",
  交易: "Trades",
  股票赠与活动: "Grant Activity",
  存款和取款: "Deposits & Withdrawals",
  股息: "Dividends",
  代扣税: "Withholding Tax",
  利息: "Interest",
  费用: "Fees",
  应计利息: "Interest Accruals",
  应计股息的变化: "Change in Dividend Accruals",
  金融产品信息: "Financial Instrument Information",
  代码: "Codes",
  "注释/法律注释": "Notes/Legal Notes"
};

const HEADER_ALIASES = {
  域名称: "Field Name",
  域值: "Field Value",
  名称: "Name",
  账户: "Account",
  账户类型: "Account Type",
  客户类型: "Customer Type",
  账户能力: "Account Capabilities",
  基础货币: "Base Currency",
  资产类型: "Asset Class",
  资产分类: "Asset Category",
  之前合计: "Prior Total",
  当前多头: "Current Long",
  当前空头: "Current Short",
  当前合计: "Current Total",
  变更: "Change",
  时间加权的收益率: "Time Weighted Rate of Return",
  代码: "Symbol",
  "先前 数量": "Prior Quantity",
  "当前 数量": "Current Quantity",
  "先前 价格": "Prior Price",
  "当前 价格": "Current Price",
  "按市值计盈亏 持仓": "Mark-to-Market P/L Position",
  "按市值计盈亏 交易": "Mark-to-Market P/L Transaction",
  "按市值计盈亏 佣金": "Mark-to-Market P/L Commissions",
  "按市值计盈亏 其它": "Mark-to-Market P/L Other",
  "按市值计盈亏 总数": "Mark-to-Market P/L Total",
  费用调整: "Cost Adj.",
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
  总数: "Total",
  货币总结: "Currency Summary",
  货币: "Currency",
  证券: "Securities",
  期货: "Futures",
  开盘: "Open",
  数量: "Quantity",
  合约乘数: "Mult",
  成本价格: "Cost Price",
  成本基础: "Cost Basis",
  "成本基础 USD": "Cost Basis in USD",
  收盘价格: "Close Price",
  价值: "Value",
  "价值 USD": "Value in USD",
  未实现的损益: "Unrealized P/L",
  "未实现盈亏 USD": "Unrealized P/L in USD",
  描述: "Description",
  在IB的股份: "Shares at IB",
  借入的股份: "Shares Borrowed",
  借出的股份: "Shares Lent",
  净股份: "Net Shares",
  "日期/时间": "Date/Time",
  交易价格: "T. Price",
  收益: "Proceeds",
  "佣金/税": "Comm/Fee",
  "佣金 USD": "Comm in USD",
  基础: "Basis",
  已实现的损益: "Realized P/L",
  按市值计算的损益: "MTM P/L",
  "以市值计（MTM） USD": "MTM in USD",
  报告日期: "Report Date",
  奖励日期: "Award Date",
  股票兑现日期: "Vesting Date",
  价格: "Price",
  结算日期: "Settle Date",
  日期: "Date",
  金额: "Amount",
  除息日: "Ex Date",
  支付日期: "Pay Date",
  税: "Tax",
  费用: "Fee",
  总股息率: "Gross Rate",
  总额: "Gross Amount",
  净额: "Net Amount",
  合约编号: "Conid",
  证券号码: "Security ID",
  底层: "Underlying",
  上市交易所: "Listing Exch",
  乘数: "Multiplier",
  类型: "Type",
  意思: "Meaning",
  "代码 （继续）": "Code (Cont.)",
  "意思 （继续）": "Meaning (Cont.)",
  注: "Note"
};

const FIELD_VALUE_ALIASES = {
  名称: "Name",
  账户: "Account",
  账户类型: "Account Type",
  客户类型: "Customer Type",
  账户能力: "Account Capabilities",
  基础货币: "Base Currency",
  开始价值: "Starting Value",
  按市值计价: "Mark-to-Market",
  存款和取款: "Deposits & Withdrawals",
  股票赠与活动: "Grant Activity",
  股息: "Dividends",
  代扣税款: "Withholding Tax",
  应计股息的变化: "Change in Dividend Accruals",
  利息: "Interest",
  应计利息变更: "Change in Interest Accruals",
  佣金: "Commissions",
  其它外汇换算: "Other FX Translations",
  结束价值: "Ending Value"
};

const VALUE_ALIASES = {
  现金: "Cash",
  股票: "Stocks",
  期权: OPTION_ASSET,
  外汇: "Forex",
  总数: "Total",
  "总计（全部资产）": "Total (All Assets)",
  基础货币总结: "Base Currency Summary"
};

export function parseIbkrReport(csvText) {
  const sections = collectSections(csvText);
  const accountInfo = parseAccountInfo(sections);
  const exchangeRates = parseExchangeRates(sections, accountInfo.baseCurrency);
  const dividendIncome = parseDividendIncome(sections, exchangeRates);
  const positions = applyPositionDividends(
    parseOpenPositions(sections["Open Positions"], exchangeRates),
    dividendIncome.bySymbol
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

    const sectionName = normalizeSectionName(columns[0]);
    const rowType = columns[1];

    if (rowType === "Header") {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        section: sectionName,
        headers: normalizeHeaders(columns),
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
        if (header) row[header] = normalizeCellValue(header, dataRow[index]);
      });
      sections[block.section].push(row);
    }

    return sections;
  }, {});
}

function normalizeSectionName(sectionName) {
  return SECTION_ALIASES[sectionName] || sectionName;
}

function normalizeHeaders(columns) {
  const seen = new Map();
  return columns.map((header, index) => {
    const normalized = index < 2 ? header : HEADER_ALIASES[header] || header;
    if (!normalized) return normalized;

    const count = seen.get(normalized) || 0;
    seen.set(normalized, count + 1);
    if (count === 0) return normalized;
    return `${normalized} ${count + 1}`;
  });
}

function normalizeCellValue(header, value) {
  const clean = String(value ?? "").trim();
  if (header === "Field Name") return FIELD_VALUE_ALIASES[clean] || clean;
  if (header === "Asset Class" || header === "Asset Category" || header === "Currency Summary") {
    return VALUE_ALIASES[clean] || clean;
  }
  return clean;
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
    baseCurrency: infoMap.get("Base Currency") || "USD",
    period: statementMap.get("Period") || infoMap.get("Period") || ""
  };
}

function parseExchangeRates(sections, baseCurrency) {
  const rates = { [baseCurrency || "USD"]: 1 };
  const mtmRows = sections["Mark-to-Market Performance Summary"] || [];

  for (const row of mtmRows) {
    if (row["Asset Category"] !== "Forex") continue;

    const currency = row.Symbol;
    const rate = toNumber(row["Current Price"]);
    if (currency && currency !== baseCurrency && rate > 0) {
      rates[currency] = rate;
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

      const currency = row.Currency || "USD";
      const rate = exchangeRates[currency] || 1;
      const option = parseOptionSymbol(row.Symbol);
      const quantity = toNumber(row.Quantity);

      return {
        assetCategory,
        symbol: row.Symbol,
        baseSymbol: option.baseSymbol,
        quantity,
        side: quantity < 0 ? "Short" : "Long",
        multiplier: toNumber(row.Mult),
        costBasis: toNumber(row["Cost Basis"]) * rate,
        closePrice: toNumber(row["Close Price"]),
        value: toNumber(row.Value) * rate,
        dividends: 0,
        unrealizedPL: toNumber(row["Unrealized P/L"]) * rate,
        currency,
        isOption: option.isOption,
        optionType: option.optionType || "",
        strikePrice: option.strikePrice || 0,
        expiry: option.expiry || ""
      };
    })
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function parseDividendIncome(sections, exchangeRates) {
  const bySymbol = {};
  let total = 0;

  for (const row of sections.Dividends || []) {
    if (row.Currency === "Total") continue;

    const symbol = parseDividendSymbol(row);
    if (!symbol) continue;

    const currency = row.Currency || "USD";
    const value = toNumber(row.Amount) * (exchangeRates[currency] || 1);
    if (!value) continue;

    bySymbol[symbol] = (bySymbol[symbol] || 0) + value;
    total += value;
  }

  return {
    bySymbol,
    total
  };
}

function applyPositionDividends(positions, dividendBySymbol) {
  return positions.map((position) => {
    const symbols = new Set([
      position.symbol,
      position.baseSymbol,
      parseOptionSymbol(position.symbol).baseSymbol
    ].filter(Boolean));
    const dividends = Array.from(symbols).reduce((sum, symbol) => sum + (dividendBySymbol[symbol] || 0), 0);
    return {
      ...position,
      dividends
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

    const currency = row.Currency || "USD";
    const rate = exchangeRates[currency] || 1;
    const commission = toNumber(readCommission(row)) * rate;
    const tradeRealized = toNumber(row["Realized P/L"]) * rate;
    totalCommissions += Math.abs(commission);
    realizedPL += tradeRealized;

    if (category === OPTION_ASSET && row.Code?.includes("O") && toNumber(row.Quantity) < 0) {
      optionPremium += (toNumber(row.Proceeds) + toNumber(readCommission(row))) * rate;
    }

    if (tradeRealized !== 0) {
      topRealizedTrades.push({
        date: date ? date.toISOString() : "",
        symbol: row.Symbol || "",
        category,
        realizedPL: tradeRealized,
        currency
      });
    }
  }

  topRealizedTrades.sort((a, b) => Math.abs(b.realizedPL) - Math.abs(a.realizedPL));

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
      const currency = row.Currency || "USD";
      const rate = exchangeRates[currency] || 1;
      const quantity = toNumber(row.Quantity);
      const price = toNumber(row["T. Price"]);
      const proceeds = toNumber(row.Proceeds) * rate;
      const commission = toNumber(readCommission(row)) * rate;
      const realizedPL = toNumber(row["Realized P/L"]) * rate;
      const mtmPL = toNumber(row["MTM P/L"]) * rate;

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
        realizedPL,
        mtmPL,
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

    const currency = trade.Currency || "USD";
    const rate = exchangeRates[currency] || 1;
    const row = ensureDay(date);
    const symbol = trade.Symbol || "";

    row.tradeCount += 1;
    row.realizedPL += toNumber(trade["Realized P/L"]) * rate;
    row.mtmPL += toNumber(trade["MTM P/L"]) * rate;
    row.grossTradeValue += Math.abs(toNumber(trade.Proceeds) * rate);
    row.commissions += Math.abs(toNumber(readCommission(trade)) * rate);
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
    const currency = trade.Currency || "USD";
    const rate = exchangeRates[currency] || 1;
    const category = trade["Asset Category"];
    const realized = toNumber(trade["Realized P/L"]) * rate;
    const commission = toNumber(readCommission(trade)) * rate;

    row.commissions += Math.abs(commission);

    if (category === OPTION_ASSET) {
      row.optionsPL += realized;
      if (trade.Code?.includes("O") && toNumber(trade.Quantity) < 0) {
        row.optionsPremium += (toNumber(trade.Proceeds) + toNumber(readCommission(trade))) * rate;
      }
    } else if (category === "Stocks") {
      row.stocksPL += realized;
    } else if (category === "Forex") {
      row.forexPL += toNumber(trade["MTM P/L"]) * rate || realized;
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
    const currency = row.Currency || "USD";
    ensureMonth(date).syepIncome += toNumber(row["Interest Paid to Customer"]) * (exchangeRates[currency] || 1);
  }

  for (const row of sections.Interest || []) {
    const date = parseDate(row.Date);
    if (!date) continue;
    const currency = row.Currency || "USD";
    ensureMonth(date).interest += toNumber(row.Amount) * (exchangeRates[currency] || 1);
  }

  for (const row of sections.Fees || []) {
    const date = parseDate(row.Date);
    if (!date) continue;
    const currency = row.Currency || "USD";
    ensureMonth(date).fees += Math.abs(toNumber(row.Amount) * (exchangeRates[currency] || 1));
  }

  return Array.from(monthly.values())
    .map((row) => ({
      ...row,
      net:
        row.optionsPL +
        row.stocksPL +
        row.forexPL +
        row.syepIncome +
        row.interest -
        row.commissions -
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
    map.set(name, (map.get(name) || 0) + Math.abs(position.value));
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

  if (!sections["Account Information"]) warnings.push("未找到 Account Information 区块。");
  if (!sections["Net Asset Value"]) warnings.push("未找到 Net Asset Value 区块。");
  if (!sections.Trades) warnings.push("未找到 Trades 区块，交易分析会为空。");
  if (!sections["Open Positions"]) warnings.push("未找到 Open Positions 区块，持仓列表会为空。");
  if (!nav.total && positions.length === 0 && tradeSummary.orderCount === 0) {
    warnings.push("文件结构不像标准 IBKR Activity Statement CSV。");
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
  return (
    row["Comm/Fee"] ??
    row["Commission"] ??
    Object.entries(row).find(([key]) => key.toLowerCase().startsWith("comm"))?.[1] ??
    "0"
  );
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
