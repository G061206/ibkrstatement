import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIbkrReport, parseIbkrReports } from '../src/parser.js';
import { mergeStatement, january, february } from './merge-fixtures.js';

const source = (text, name = 'statement.csv') => ({ text, name });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('sorts periods, combines flows and P/L, and uses only the latest snapshot', () => {
  const data = parseIbkrReports([source(february, 'feb.csv'), source(january, 'jan.csv')]);
  assert.equal(data.accountInfo.period, '2026-01-01 - 2026-02-28');
  assert.equal(data.nav.total, 3000);
  assert.equal(data.nav.cash, 2000);
  near(data.nav.rateOfReturn, 4.5);
  assert.equal(data.positions.length, 1);
  assert.equal(data.positions[0].baseValue, 200);
  assert.equal(data.positions[0].baseDividends, 3);
  assert.deepEqual(data.plSummary.total, { realized: 30, unrealized: 200, total: 230 });
  assert.equal(data.navChange.find(row => row.key === 'startingValue').value, 1000);
  assert.equal(data.navChange.find(row => row.key === 'endingValue').value, 3000);
  assert.equal(data.navChange.find(row => row.key === 'depositsAndWithdrawals').value, 1000);
  assert.equal(data.closedPositions.length, 1);
  assert.equal(data.closedPositions[0].realizedPL, 30);
  assert.equal(data.tickerPL[0].realizedPL, 30);
  assert.equal(data.mergeInfo.snapshotSource, 'feb.csv');
  assert.deepEqual(data.mergeInfo.sources.map(s => s.name), ['jan.csv', 'feb.csv']);
  assert.equal(data.sectionStats.Trades, 2);
  assert.doesNotMatch(JSON.stringify(data), /Statement,Header|Account Information,Data/);
});

test('each period keeps its own FX conversion in trades, daily, monthly and income', () => {
  const data = parseIbkrReports([source(january), source(february)]);
  assert.equal(data.tradeSummary.orderCount, 2);
  assert.equal(data.tradeSummary.realizedPL, 30);
  assert.equal(data.tradeSummary.totalCommissions, 2);
  assert.deepEqual(data.tradeDetails.map(row => row.baseGrossValue), [100, 200]);
  assert.deepEqual(data.dailyTradeStats.map(row => row.realizedPL), [10, 20]);
  assert.deepEqual(data.monthlySummary.map(row => row.net), [10, 20]);
  assert.deepEqual(data.monthlySummary.map(row => row.interest), [0.1, 0.2]);
  assert.equal(data.dividendIncome.total, 3);
  assert.equal(data.exchangeRates.HKD, 0.2);
  assert.deepEqual(data.mergeInfo.sources.map(row => row.exchangeRates.HKD), [0.1, 0.2]);
});

test('skips duplicate statements while preserving repeated fills within a statement', () => {
  const duplicate = '\uFEFF' + january.replaceAll('\n', '\r\n');
  const data = parseIbkrReports([source(january, 'one.csv'), source(duplicate, 'copy.csv'), source(february, 'two.csv')]);
  assert.equal(data.tradeSummary.orderCount, 2);
  assert.deepEqual(data.mergeInfo.duplicates, ['copy.csv']);
  assert.equal(data.mergeInfo.statementCount, 2);
  const tradeLine = january.split('\n').find(line => line.startsWith('Trades,Data'));
  const repeated = january.replace(tradeLine, tradeLine + '\n' + tradeLine);
  assert.equal(parseIbkrReports([source(repeated), source(february)]).tradeSummary.orderCount, 3);
});

test('duplicate-only import keeps single-statement values unchanged', () => {
  const data = parseIbkrReports([source(january), source(january, 'copy.csv')]);
  const single = parseIbkrReport(january);
  assert.deepEqual(data.plSummary, single.plSummary);
  assert.deepEqual(data.nav, single.nav);
  assert.equal(data.mergeInfo.statementCount, 1);
  assert.equal(data.mergeInfo.duplicates.length, 1);
});

test('safely rejects account, currency, missing period, overlapping period and invalid file conflicts', () => {
  for (const [second, code] of [
    [february.replace('Account,U123', 'Account,U456'), 'mergeAccountMismatch'],
    [february.replace('Account,U123', 'Account,'), 'mergeMissingAccount'],
    [february.replaceAll('USD', 'EUR'), 'mergeCurrencyMismatch'],
    [february.replace('Account Information,Data,Base Currency,USD', ''), 'mergeMissingBaseCurrency'],
    [february.replace('February 2026', 'unknown'), 'mergeInvalidPeriod'],
    [mergeStatement({ period: 'January 15, 2026 - February 28, 2026', date: '2026-02-10' }), 'mergeOverlappingPeriods'],
    [february.replace('February 2026', '2026-02-30'), 'mergeInvalidPeriod'],
    [february.replace('2026-02-10', '2026-01-10'), 'mergeDateOutsidePeriod'],
    ['not a statement', 'invalidStatement']
  ]) assert.throws(() => parseIbkrReports([source(january), source(second)]), { code });
  assert.throws(() => parseIbkrReports([]), { code: 'emptyStatements' });
  // Different exports of the same period are not blindly added together.
  assert.throws(() => parseIbkrReports([source(january), source(january.replace('Investor', 'Changed name'))]), { code: 'mergeOverlappingPeriods' });
});

test('gaps and missing TWR suppress compounded return while a real zero stays zero', () => {
  const march = mergeStatement({ period: 'March 2026', date: '2026-03-10' });
  const gapped = parseIbkrReports([source(january), source(march)]);
  assert.equal(gapped.nav.rateOfReturn, null);
  assert.ok(gapped.warnings.includes('mergePeriodGaps'));
  const missing = parseIbkrReports([source(january), source(february.replace('Net Asset Value,Data,-5%', 'Net Asset Value,Data,--'))]);
  assert.equal(missing.nav.rateOfReturn, null);
  assert.ok(missing.warnings.includes('mergeReturnUnavailable'));
  const zero = parseIbkrReports([source(january.replace('Data,10%', 'Data,0%')), source(february.replace('Data,-5%', 'Data,0%'))]);
  assert.equal(zero.nav.rateOfReturn, 0);
});

test('unknown P/L propagates, and latest empty holdings do not resurrect old positions', () => {
  const noPl = january.split('\n').filter(line => !line.startsWith('Realized & Unrealized')).join('\n');
  const latest = february.split('\n').filter(line => !line.startsWith('Open Positions,Data')).join('\n');
  const data = parseIbkrReports([source(noPl), source(latest)]);
  assert.equal(data.plSummary.total.realized, null);
  assert.equal(data.plSummary.total.total, null);
  assert.equal(data.plSummary.total.unrealized, 200);
  assert.deepEqual(data.positions, []);
  assert.deepEqual(data.assetAllocation, []);
});

test('adjacent sub-month periods combine into one monthly bucket', () => {
  const first = mergeStatement({ period: '2026-01-01 - 2026-01-15' });
  const second = mergeStatement({ period: '2026年1月16日至2026年1月31日', date: '2026-01-20', realized: 20 });
  const data = parseIbkrReports([source(second), source(first)]);
  assert.equal(data.monthlySummary.length, 1);
  assert.equal(data.monthlySummary[0].stocksPL, 30);
  assert.equal(data.monthlySummary[0].commissions, 2);
  assert.equal(data.monthlySummary[0].net, 30);
  assert.equal(data.mergeInfo.hasGaps, false);
});

test('supports year and numeric month periods without depending on trade dates', () => {
  const first = mergeStatement({ period: '2025', date: '2025-12-10' });
  const data = parseIbkrReports([source(first), source(mergeStatement({ period: '2026-01' }))]);
  assert.equal(data.accountInfo.period, '2025-01-01 - 2026-01-31');
  assert.equal(data.mergeInfo.hasGaps, false);
});
