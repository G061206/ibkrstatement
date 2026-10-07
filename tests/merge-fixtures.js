import { positionsHeader, plHeader } from './fixtures.js';

export function mergeStatement({ period = 'January 2026', date = '2026-01-10', rate = 0.1,
  ending = 2000, starting = 1000, realized = 10, unrealized = 100, twr = '10%' } = {}) {
  return [
    'Statement,Header,Field Name,Field Value',
    `Statement,Data,Period,"${period}"`,
    'Account Information,Header,Field Name,Field Value',
    'Account Information,Data,Account,U123',
    'Account Information,Data,Name,Investor',
    'Account Information,Data,Base Currency,USD',
    'Base Currency Exchange Rate,Header,Currency,Rate',
    `Base Currency Exchange Rate,Data,HKD,${rate}`,
    'Net Asset Value,Header,Asset Class,Current Total',
    `Net Asset Value,Data,Cash,${ending - 1000}`,
    `Net Asset Value,Data,Total,${ending}`,
    'Net Asset Value,Header,Time Weighted Rate of Return',
    `Net Asset Value,Data,${twr}`,
    'Change in NAV,Header,Field Name,Field Value',
    `Change in NAV,Data,Starting Value,${starting}`,
    `Change in NAV,Data,Ending Value,${ending}`,
    'Change in NAV,Data,Deposits & Withdrawals,500',
    'Change in NAV,Data,Commissions,-1',
    positionsHeader.trim(),
    `Open Positions,Data,Summary,Stocks,HKD,ABC,10,1,900,100,1000,${unrealized / rate}`,
    'Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price,Proceeds,Comm in USD,Basis,Realized P/L,MTM in USD,Code',
    `Trades,Data,Order,Stocks,HKD,ABC,"${date}, 12:00:00",-10,100,1000,-1,-900,${realized / rate},2,C`,
    plHeader.trim(),
    `Realized & Unrealized Performance Summary,Data,Stocks,ABC,${realized},${unrealized},${realized + unrealized}`,
    `Realized & Unrealized Performance Summary,Data,Total,,${realized},${unrealized},${realized + unrealized}`,
    `Realized & Unrealized Performance Summary,Data,Total (All Assets),,${realized},${unrealized},${realized + unrealized}`,
    'Dividends,Header,Currency,Date,Description,Amount',
    `Dividends,Data,HKD,${date},ABC(US0000000000) Cash Dividend,10`,
    'Interest,Header,Currency,Date,Description,Amount',
    `Interest,Data,HKD,${date},Interest,1`,
    'Fees,Header,Currency,Date,Description,Amount',
    `Fees,Data,HKD,${date},Fee,-1`
  ].join('\n') + '\n';
}

export const january = mergeStatement();
export const february = mergeStatement({ period: 'February 2026', date: '2026-02-10', rate: 0.2,
  ending: 3000, starting: 2000, realized: 20, unrealized: 200, twr: '-5%' });
