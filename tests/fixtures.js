export const account = 'Account Information,Header,Field Name,Field Value\nAccount Information,Data,Base Currency,USD\n';
export const positionsHeader = 'Open Positions,Header,DataDiscriminator,Asset Category,Currency,Symbol,Quantity,Mult,Cost Basis,Close Price,Value,Unrealized P/L\n';
export const tradesHeader = 'Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code\n';
export const stockRoundTrip = tradesHeader +
  'Trades,Data,Order,Stocks,USD,ABC,"2026-01-02, 12:00:00",10,10,-100,-1,101,0,0,O\n' +
  'Trades,Data,Order,Stocks,USD,ABC,"2026-01-03, 12:00:00",-10,12,120,-1,-101,18,0,C\n';
export const rates = 'Base Currency Exchange Rate,Header,Currency,Rate\nBase Currency Exchange Rate,Data,HKD,0.128\n';
export const forex = 'Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,Proceeds,Comm in USD,MTM in USD,Code\n' +
  'Trades,Data,Order,Forex,HKD,USD.HKD,"2026-01-03, 12:00:00",100,7.8,-780,-0.35,2.1,O\n';
export const plHeader = 'Realized & Unrealized Performance Summary,Header,Asset Category,Symbol,Realized Total,Unrealized Total,Total\n';
export const completeReport = account + rates +
  'Statement,Header,Field Name,Field Value\nStatement,Data,Period,January 2026\n' +
  'Net Asset Value,Header,Asset Class,Current Total\nNet Asset Value,Data,Cash,900\nNet Asset Value,Data,Total,2000\n' +
  positionsHeader + 'Open Positions,Data,Summary,Stocks,USD,ABC,10,1,1000,110,1100,100\n' +
  stockRoundTrip + forex + plHeader +
  'Realized & Unrealized Performance Summary,Data,Stocks,ABC,18,100,118\n' +
  'Realized & Unrealized Performance Summary,Data,Total,,18,100,118\n' +
  'Realized & Unrealized Performance Summary,Data,Total (All Assets),,18,100,118\n';

export const chineseReport = [
  'Statement,标题,域名称,域值',
  'Statement,数据,Period,January 2026',
  '账户信息,Header,域名称,域值',
  '账户信息,Data,名称,测试用户',
  '账户信息,Data,账户,U00000000',
  '账户信息,Data,基础货币,USD',
  '净资产值,Header,资产类型,当前合计',
  '净资产值,Data,现金,900',
  '净资产值,Data,总数,2000',
  '净资产值,Header,时间加权的收益率',
  '净资产值,Data,10%',
  '净资产值变更,Header,域名称,域值',
  '净资产值变更,Data,开始价值,1000',
  '净资产值变更,Data,股票赠与活动,5',
  '净资产值变更,Data,股息,10',
  '净资产值变更,Data,代扣税款,-1',
  '净资产值变更,Data,应计股息的变化,2',
  '净资产值变更,Data,结束价值,2000',
  '按市值计算的表现总结,Header,资产分类,代码,当前 价格,代码',
  '按市值计算的表现总结,Data,外汇,HKD,0.128,',
  '未平仓持仓,Header,DataDiscriminator,资产分类,货币,代码,数量,合约乘数,成本基础,收盘价格,价值,未实现的损益,代码',
  '未平仓持仓,Data,汇总,股票,USD,ABC,10,1,1000,110,1100,100,',
  '交易,Header,DataDiscriminator,资产分类,货币,代码,日期/时间,数量,交易价格,收益,佣金/税,基础,已实现的损益,按市值计算的损益,代码',
  '交易,Data,订单,股票,USD,ABC,"2026-01-03, 12:00:00",-10,12,120,-1,-101,18,0,C',
  '交易,Header,DataDiscriminator,资产分类,货币,代码,日期/时间,数量,交易价格,,收益,佣金 USD,,,以市值计（MTM） USD,代码',
  '交易,Data,成交,外汇,HKD,USD.HKD,"2026-01-04, 12:00:00",100,7.8,,-780,-0.35,,,2.1,O',
  '已实现和未实现的表现总结,Header,资产分类,代码,已实现的 总数,未实现的 总数,总数,代码',
  '已实现和未实现的表现总结,Data,股票,ABC,18,100,118,',
  '已实现和未实现的表现总结,Data,总数,,18,100,118,',
  '已实现和未实现的表现总结,Data,总计（全部资产）,,18,100,118,',
  '股息,Header,货币,日期,描述,金额',
  '股息,Data,USD,2026-01-05,ABC(US0000000000) 现金红利 USD 1 每股,10',
  '费用,Header,Subtitle,货币,日期,描述,金额',
  '费用,Data,其它费用,USD,2026-01-06,测试费用,-0.04',
  '利息,Header,货币,日期,描述,金额',
  '利息,Data,USD,2026-01-07,测试利息,0.05',
  '股票收益提升计划证券出借赚取费用详情,Header,货币,起息日,代码,股票收益提升计划费用 客户赚取的,代码',
  '股票收益提升计划证券出借赚取费用详情,Data,USD,2026-01-08,ABC,0.01,Po'
].join('\n') + '\n';
