import test from "node:test";
import assert from "node:assert/strict";

import { parseIbkrReport } from "../src/parser.js";

const englishReport = `Statement,Header,Field Name,Field Value
Statement,Data,Title,Activity Statement
Statement,Data,Period,"January 1, 2026 - May 29, 2026"
Account Information,Header,Field Name,Field Value
Account Information,Data,Name,Sample User
Account Information,Data,Account,U00000000
Account Information,Data,Base Currency,USD
Net Asset Value,Header,Asset Class,Prior Total,Current Long,Current Short,Current Total,Change
Net Asset Value,Data,Cash,100,200,0,200,100
Net Asset Value,Data,Stock,300,600,0,600,300
Net Asset Value,Data,Total,400,800,0,800,400
Net Asset Value,Header,Time Weighted Rate of Return
Net Asset Value,Data,12.5%
Change in NAV,Header,Field Name,Field Value
Change in NAV,Data,Starting Value,400
Change in NAV,Data,Ending Value,800
Mark-to-Market Performance Summary,Header,Asset Category,Symbol,Prior Quantity,Current Quantity,Prior Price,Current Price,Mark-to-Market P/L Position,Mark-to-Market P/L Transaction,Mark-to-Market P/L Commissions,Mark-to-Market P/L Other,Mark-to-Market P/L Total,Code
Mark-to-Market Performance Summary,Data,Forex,USD,0,100,1,1,0,0,0,0,0,
Realized & Unrealized Performance Summary,Header,Asset Category,Symbol,Cost Adj.,Realized S/T Profit,Realized S/T Loss,Realized L/T Profit,Realized L/T Loss,Realized Total,Unrealized S/T Profit,Unrealized S/T Loss,Unrealized L/T Profit,Unrealized L/T Loss,Unrealized Total,Total,Code
Realized & Unrealized Performance Summary,Data,Stocks,AAPL,0,10,0,0,0,10,20,0,0,0,20,30,
Realized & Unrealized Performance Summary,Data,Total,,0,10,0,0,0,10,20,0,0,0,20,30,
Realized & Unrealized Performance Summary,Data,Total (All Assets),,0,10,0,0,0,10,20,0,0,0,20,30,
Open Positions,Header,DataDiscriminator,Asset Category,Currency,Symbol,Open,Quantity,Mult,Cost Price,Cost Basis,Close Price,Value,Unrealized P/L,Code
Open Positions,Data,Summary,Stocks,USD,AAPL,-,2,1,150,300,200,400,100,
Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code
Trades,Data,Order,Stocks,USD,AAPL,"2026-05-01, 09:30:00",2,150,200,-300,-1,300,10,20,O
Dividends,Header,Currency,Date,Description,Amount
Dividends,Data,USD,2026-05-02,AAPL(US0378331005) Cash Dividend USD 1.00 per Share,2
Interest,Header,Currency,Date,Description,Amount
Interest,Data,USD,2026-05-03,USD Credit Interest,1
Fees,Header,Currency,Date,Description,Amount
Fees,Data,USD,2026-05-04,Monthly Fee,-3`;

const chineseReport = `Statement,Header,域名称,域值
Statement,Data,Title,活动账单
Statement,Data,Period,"一月 1, 2026 - 五月 29, 2026"
账户信息,Header,域名称,域值
账户信息,Data,名称,Sample User
账户信息,Data,账户,U00000000
账户信息,Data,基础货币,USD
净资产值,Header,资产类型,之前合计,当前多头,当前空头,当前合计,变更
净资产值,Data,现金,100,200,0,200,100
净资产值,Data,股票,300,600,0,600,300
净资产值,Data,总数,400,800,0,800,400
净资产值,Header,时间加权的收益率
净资产值,Data,12.5%
净资产值变更,Header,域名称,域值
净资产值变更,Data,开始价值,400
净资产值变更,Data,结束价值,800
按市值计算的表现总结,Header,资产分类,代码,先前 数量,当前 数量,先前 价格,当前 价格,按市值计盈亏 持仓,按市值计盈亏 交易,按市值计盈亏 佣金,按市值计盈亏 其它,按市值计盈亏 总数,代码
按市值计算的表现总结,Data,外汇,USD,0,100,1,1,0,0,0,0,0,
已实现和未实现的表现总结,Header,资产分类,代码,费用调整,已实现的 短期利润,已实现的 短期损失,已实现的 长期利润,已实现的 长期损失,已实现的 总数,未实现的 短期利润,未实现的 短期损失,未实现的 长期利润,未实现的 长期损失,未实现的 总数,总数,代码
已实现和未实现的表现总结,Data,股票,AAPL,0,10,0,0,0,10,20,0,0,0,20,30,
已实现和未实现的表现总结,Data,总数,,0,10,0,0,0,10,20,0,0,0,20,30,
已实现和未实现的表现总结,Data,总计（全部资产）,,0,10,0,0,0,10,20,0,0,0,20,30,
未平仓持仓,Header,DataDiscriminator,资产分类,货币,代码,开盘,数量,合约乘数,成本价格,成本基础,收盘价格,价值,未实现的损益,代码
未平仓持仓,Data,Summary,股票,USD,AAPL,-,2,1,150,300,200,400,100,
交易,Header,DataDiscriminator,资产分类,货币,代码,日期/时间,数量,交易价格,收盘价格,收益,佣金/税,基础,已实现的损益,按市值计算的损益,代码
交易,Data,Order,股票,USD,AAPL,"2026-05-01, 09:30:00",2,150,200,-300,-1,300,10,20,O
股息,Header,货币,日期,描述,金额
股息,Data,USD,2026-05-02,AAPL(US0378331005) 现金红利 USD 1.00 每股,2
利息,Header,货币,日期,描述,金额
利息,Data,USD,2026-05-03,USD 贷方利息,1
费用,Header,货币,日期,描述,金额
费用,Data,USD,2026-05-04,Monthly Fee,-3`;

test("parses English IBKR activity statement sections", () => {
  const parsed = parseIbkrReport(englishReport);

  assert.equal(parsed.accountInfo.account, "U00000000");
  assert.equal(parsed.accountInfo.baseCurrency, "USD");
  assert.equal(parsed.nav.total, 800);
  assert.equal(parsed.nav.cash, 200);
  assert.equal(parsed.positions.length, 1);
  assert.equal(parsed.tradeSummary.orderCount, 1);
  assert.equal(parsed.dailyTradeStats.length, 1);
  assert.equal(parsed.monthlySummary.length, 1);
  assert.equal(parsed.dividendIncome.total, 2);
  assert.deepEqual(parsed.warnings, []);
});

test("normalizes Chinese IBKR activity statement sections to the English parser schema", () => {
  const parsed = parseIbkrReport(chineseReport);

  assert.equal(parsed.accountInfo.account, "U00000000");
  assert.equal(parsed.accountInfo.name, "Sample User");
  assert.equal(parsed.accountInfo.baseCurrency, "USD");
  assert.equal(parsed.nav.total, 800);
  assert.equal(parsed.nav.cash, 200);
  assert.equal(parsed.nav.rateOfReturn, 12.5);
  assert.equal(parsed.navChange.find((row) => row.key === "startingValue")?.value, 400);
  assert.equal(parsed.navChange.find((row) => row.key === "endingValue")?.value, 800);
  assert.equal(parsed.positions.length, 1);
  assert.equal(parsed.positions[0].assetCategory, "Stocks");
  assert.equal(parsed.positions[0].symbol, "AAPL");
  assert.equal(parsed.positions[0].value, 400);
  assert.equal(parsed.positions[0].unrealizedPL, 100);
  assert.equal(parsed.tradeSummary.orderCount, 1);
  assert.equal(parsed.tradeSummary.stockOrders, 1);
  assert.equal(parsed.tradeSummary.totalCommissions, 1);
  assert.equal(parsed.tradeSummary.realizedPL, 10);
  assert.equal(parsed.tradeDetails[0].price, 150);
  assert.equal(parsed.tradeDetails[0].grossValue, 300);
  assert.equal(parsed.dailyTradeStats.length, 1);
  assert.equal(parsed.monthlySummary.length, 1);
  assert.equal(parsed.monthlySummary[0].stocksPL, 10);
  assert.equal(parsed.monthlySummary[0].interest, 1);
  assert.equal(parsed.monthlySummary[0].fees, 3);
  assert.equal(parsed.dividendIncome.total, 2);
  assert.equal(parsed.sectionStats["Account Information"], 3);
  assert.equal(parsed.sectionStats["Net Asset Value"], 4);
  assert.equal(parsed.sectionStats.Trades, 1);
  assert.deepEqual(parsed.warnings, []);
});
