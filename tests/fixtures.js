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
