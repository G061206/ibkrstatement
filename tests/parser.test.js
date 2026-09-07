import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseIbkrReport } from '../src/parser.js';
import { account, positionsHeader, tradesHeader, stockRoundTrip, rates, forex, plHeader, completeReport } from './fixtures.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, actual + ' != ' + expected);

test('rejects HTML in base, position, and explicit field currencies', () => {
  const payload = '<img src=x onerror=alert(1)>';
  for (const csv of [
    account.replace(',USD', ',' + payload),
    account + positionsHeader + 'Open Positions,Data,Summary,Stocks,' + payload + ',ABC,1,1,1,1,1,0\n',
    account + rates + forex.replace('Comm in USD', 'Comm in ' + payload),
    account + rates + forex.replace('MTM in USD', 'MTM in ' + payload)
  ]) assert.throws(() => parseIbkrReport(csv), { code: 'invalidCurrency' });
});

test('stock and option net does not deduct capitalized commissions twice', () => {
  for (const trades of [stockRoundTrip, stockRoundTrip.replaceAll('Stocks', 'Equity and Index Options')]) {
    const data = parseIbkrReport(account + trades);
    near(data.monthlySummary[0].net, 18);
    near(data.monthlySummary[0].commissions, 2);
    near(data.tradeSummary.realizedPL, 18);
  }
});

test('opening stock commission is capitalized, with no realized monthly loss', () => {
  const data = parseIbkrReport(account + stockRoundTrip.split('\n').slice(0, 2).join('\n'));
  assert.equal(data.monthlySummary[0].net, 0);
  assert.equal(data.monthlySummary[0].commissions, 1);
});

test('explicit USD commission and MTM remain USD in every aggregation', () => {
  const data = parseIbkrReport(account + rates + forex);
  near(data.tradeDetails[0].baseCommission, -0.35);
  near(data.tradeDetails[0].baseMtmPL, 2.1);
  assert.equal(data.tradeDetails[0].commissionCurrency, 'USD');
  assert.equal(data.tradeDetails[0].mtmCurrency, 'USD');
  near(data.tradeSummary.totalCommissions, 0.35);
  near(data.dailyTradeStats[0].commissions, 0.35);
  near(data.dailyTradeStats[0].mtmPL, 2.1);
  near(data.monthlySummary[0].commissions, 0.35);
  near(data.monthlySummary[0].forexPL, 2.1);
  near(data.monthlySummary[0].net, 1.75);
});

test('explicit field currency converts correctly with a non-USD base', () => {
  const data = parseIbkrReport(account.replace(',USD', ',EUR') +
    'Base Currency Exchange Rate,Header,Currency,Exchange Rate\nBase Currency Exchange Rate,Data,HKD,0.12\nBase Currency Exchange Rate,Data,USD,0.9\n' + forex);
  near(data.tradeDetails[0].baseCommission, -0.315);
  near(data.tradeDetails[0].baseMtmPL, 1.89);
});

test('zero Forex MTM remains zero instead of falling back to realized P/L', () => {
  const data = parseIbkrReport(account +
    'Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,Proceeds,Comm/Fee,Realized P/L,MTM P/L\n' +
    'Trades,Data,Order,Forex,USD,EUR.USD,2026-01-03,1,-1,-0.35,2,0\n');
  near(data.monthlySummary[0].forexPL, 0);
  near(data.monthlySummary[0].net, -0.35);
});

test('Forex realized-only reports do not deduct their commission twice', () => {
  const data = parseIbkrReport(account +
    'Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,Proceeds,Comm/Fee,Realized P/L\n' +
    'Trades,Data,Order,Forex,USD,EUR.USD,2026-01-03,1,-1,-0.35,2\n');
  near(data.monthlySummary[0].net, 2);
  near(data.monthlySummary[0].commissions, 0.35);
});

test('Comm/Fee and MTM P/L use the trade currency', () => {
  const data = parseIbkrReport(account + rates + tradesHeader +
    'Trades,Data,Order,Stocks,HKD,0700,"2026-01-03, 12:00:00",1,100,-100,-1,101,0,2,O\n');
  near(data.tradeDetails[0].baseCommission, -0.128);
  near(data.tradeDetails[0].baseMtmPL, 0.256);
});

test('explicit FX rates take precedence; latest dated rate wins', () => {
  const data = parseIbkrReport(account +
    'Mark-to-Market Performance Summary,Header,Asset Category,Symbol,Current Price\nMark-to-Market Performance Summary,Data,Forex,HKD,0.13\n' +
    'Base Currency Exchange Rate,Header,Currency,Date,Exchange Rate\nBase Currency Exchange Rate,Data,HKD,2026-01-31,0.128\nBase Currency Exchange Rate,Data,HKD,2026-01-01,0.125\n' +
    positionsHeader + 'Open Positions,Data,Summary,Stocks,HKD,0700,10,1,780,100,1000,220\n');
  near(data.positions[0].baseValue, 128);
  near(data.exchangeRates.HKD, 0.128);
  assert.equal(data.exchangeRates.USD, 1);
});

test('MTM forex rate remains a supported fallback', () => {
  const data = parseIbkrReport(account +
    'Mark-to-Market Performance Summary,Header,Asset Category,Symbol,Current Price\nMark-to-Market Performance Summary,Data,Forex,HKD,0.13\n' + forex);
  near(data.exchangeRates.HKD, 0.13);
});

test('missing, zero, or negative exchange rates stop conversion instead of using 1', () => {
  for (const rate of ['', rates.replace('0.128', '0'), rates.replace('0.128', '-1')]) {
    assert.throws(() => parseIbkrReport(account + rate + forex), { code: 'missingExchangeRate', currency: 'HKD' });
  }
});

test('stock dividends never duplicate onto calls or puts, including option-only holdings', () => {
  const stock = 'Open Positions,Data,Summary,Stocks,USD,AAPL,10,1,900,100,1000,100\n';
  const options = 'Open Positions,Data,Summary,Equity and Index Options,USD,AAPL 19JUN26 100 C,1,100,90,1,100,10\n' +
    'Open Positions,Data,Summary,Equity and Index Options,USD,AAPL 19JUN26 100 P,-1,100,-90,1,-100,-10\n';
  const dividend = 'Dividends,Header,Currency,Date,Description,Amount\nDividends,Data,USD,2026-01-02,AAPL(US000000) Cash Dividend USD 1 per Share,10\n';
  for (const holding of [stock + options, options]) {
    const data = parseIbkrReport(account + positionsHeader + holding + dividend);
    assert.equal(data.dividendIncome.total, 10);
    for (const position of data.positions) {
      assert.equal(position.dividends, position.assetCategory === 'Stocks' ? 10 : 0);
      assert.equal(position.baseDividends, position.assetCategory === 'Stocks' ? 10 : 0);
    }
  }
});

test('missing P/L section and missing all-assets total are unknown, not zero', () => {
  const missing = parseIbkrReport(account + stockRoundTrip);
  assert.equal(missing.plSummary.total.realized, null);
  assert.ok(missing.warnings.includes('missingPlSummary'));
  assert.equal(missing.tradeSummary.realizedPL, 18);
  const partial = parseIbkrReport(account + plHeader + 'Realized & Unrealized Performance Summary,Data,Stocks,ABC,18,0,18\n');
  assert.equal(partial.plSummary.total.total, null);
  assert.ok(partial.warnings.includes('missingPlTotal'));
  const zero = parseIbkrReport(account + plHeader + 'Realized & Unrealized Performance Summary,Data,Total (All Assets),,0,0,0\n');
  assert.equal(zero.plSummary.total.total, 0);
  assert.ok(!zero.warnings.includes('missingPlTotal'));
});

test('complete synthetic report reconciles trade commission totals', () => {
  const data = parseIbkrReport(completeReport);
  near(data.tradeSummary.totalCommissions, 2.35);
  near(data.monthlySummary[0].net, 19.75);
  near(data.dailyTradeStats.reduce((sum, row) => sum + row.commissions, 0), 2.35);
  assert.deepEqual(data.warnings, []);
});

test('bundled reports still parse', () => {
  for (const file of ['ibkr-sample-demo.csv', 'ibkr-sample-9999.csv']) {
    const data = parseIbkrReport(readFileSync(new URL('../samples/' + file, import.meta.url), 'utf8'));
    assert.equal(data.positions.length, 10);
    assert.equal(data.tradeSummary.orderCount, 109);
  }
});
