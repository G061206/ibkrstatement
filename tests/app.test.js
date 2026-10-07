import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseIbkrReport, parseIbkrReports } from '../src/parser.js';
import { isChineseIbkrReport } from '../src/reportLanguage.js';
import { decodeReportFile } from '../src/encoding.js';
import { translate } from '../src/i18n.js';
import { account, stockRoundTrip, rates, forex, completeReport, chineseReport } from './fixtures.js';
import { january, february } from './merge-fixtures.js';

// Exercise the actual render functions without adding a DOM dependency.
// Browser checks cover real event handling and layout separately.
function appHarness(language = 'en') {
  const root = { innerHTML: '' };
  const document = {
    documentElement: { dataset: {}, lang: '' },
    querySelector: selector => selector === '#app' ? root : null,
    querySelectorAll: () => []
  };
  const sandbox = vm.createContext({
    document, URLSearchParams, Intl,
    window: { location: { search: '' } },
    localStorage: { getItem: key => key === 'ibkr-analytics-language' ? language : null, setItem() {} },
    requestAnimationFrame() {},
    Image: class { set src(value) { this.onload(); } },
    parseIbkrReport, parseIbkrReports, isChineseIbkrReport, decodeReportFile, translate
  });
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/^import .+;\r?$/gm, '');
  vm.runInContext(source, sandbox);
  const api = vm.runInContext('({ state, render, parseText, importSources, readFiles, removeStatement, resetReport, applyLanguage, drawShareImage, formatMoney, formatPercent, signedMoney, safePercent, displayError, displayWarning, renderPositionsTable, renderDailyTradeTable })', sandbox);
  return { ...api, root };
}

function assertEnglish(html) {
  const withoutLanguageButton = html.replace(/<button[^>]*data-language="zh"[^>]*>中<\/button>/g, '');
  assert.doesNotMatch(withoutLanguageButton, /\p{Script=Han}/u);
}

test('multiple file import, append, removal and reset update the real dashboard state', async () => {
  const app = appHarness();
  assert.match(app.root.innerHTML, /type="file" multiple/);
  const file = (text, name) => ({ name, arrayBuffer: async () => new TextEncoder().encode(text).buffer });
  await app.readFiles([file(february, 'feb.csv'), file(january, 'jan.csv')]);
  assert.equal(app.state.data.mergeInfo.statementCount, 2);
  assert.equal(app.state.data.nav.total, 3000);
  assertEnglish(app.root.innerHTML);
  assert.match(app.root.innerHTML, /Add statements/);
  app.removeStatement(app.state.sources.findIndex(source => source.name === 'feb.csv'));
  assert.equal(app.state.data.nav.total, 2000);
  assert.equal(app.state.sources.length, 1);
  await app.readFiles([file(february, 'feb.csv')], true);
  assert.equal(app.state.data.tradeSummary.orderCount, 2);
  await app.readFiles([file(january, 'same.csv')], true);
  assert.equal(app.state.sources.length, 2);
  assert.match(app.root.innerHTML, /Skipped duplicate statements/);
  app.resetReport();
  assert.equal(app.state.data, null);
  assert.equal(app.state.sources.length, 0);
});

test('failed append preserves existing data and displays localized merge errors', () => {
  const app = appHarness();
  app.parseText(january, 'jan.csv');
  const original = app.state.data;
  app.importSources([{ text: february.replace('Account,U123', 'Account,U456'), name: '<bad>.csv' }], true);
  assert.equal(app.state.data, original);
  assert.equal(app.state.sources.length, 1);
  assert.match(app.root.innerHTML, /same account/);
  assertEnglish(app.root.innerHTML);
  app.state.language = 'zh';
  app.render();
  assert.match(app.root.innerHTML, /只能合并同一账户/);
  for (const code of ['mergeMissingAccount', 'mergeCurrencyMismatch', 'mergeInvalidPeriod', 'mergeOverlappingPeriods', 'mergeDateOutsidePeriod']) {
    app.state.language = 'en';
    assert.doesNotMatch(app.displayError({ code }), /\p{Script=Han}/u);
  }
});

test('same filenames remain individually removable and source names are escaped', () => {
  const app = appHarness();
  app.importSources([{ text: january, name: '<img>.csv' }, { text: february, name: '<img>.csv' }]);
  assert.equal(app.state.sources[1].name, '<img>.csv (2)');
  assert.match(app.root.innerHTML, /&lt;img&gt;\.csv/);
  assert.doesNotMatch(app.root.innerHTML, /<img>\.csv/);
  app.removeStatement(1);
  assert.equal(app.state.data.nav.total, 2000);
});

test('merged reports render in all tabs and share controls with localized warnings', () => {
  const app = appHarness();
  app.importSources([{ text: january, name: 'jan.csv' }, { text: february, name: 'feb.csv' }]);
  for (const tab of ['overview', 'performance', 'positions', 'daily', 'data']) {
    app.state.activeTab = tab;
    app.render();
    assertEnglish(app.root.innerHTML);
    assert.match(app.root.innerHTML, /2026-01-01 - 2026-02-28/);
  }
  app.state.shareOpen = true;
  app.render();
  assertEnglish(app.root.innerHTML);
  app.state.shareOpen = false;
  app.importSources([{ text: january, name: 'jan.csv' }, {
    text: february.replace('February 2026', 'March 2026').replaceAll('2026-02-10', '2026-03-10'), name: 'mar.csv'
  }]);
  app.state.activeTab = 'data';
  app.render();
  assertEnglish(app.root.innerHTML);
  assert.match(app.root.innerHTML, /There are gaps/);
  assert.match(app.root.innerHTML, /time-weighted return is shown as —/);
});

test('reset cancels a pending import and a failed read leaves append data intact', async () => {
  const app = appHarness();
  let resolve;
  const pending = app.readFiles([{ name: 'jan.csv', arrayBuffer: () => new Promise(done => { resolve = done; }) }]);
  assert.equal(app.state.importing, true);
  app.resetReport();
  resolve(new TextEncoder().encode(january).buffer);
  await pending;
  assert.equal(app.state.data, null);
  app.parseText(january, 'jan.csv');
  const original = app.state.data;
  await app.readFiles([{ name: 'unreadable.csv', arrayBuffer: async () => { throw new Error('failed read'); } }], true);
  assert.equal(app.state.data, original);
  assert.match(app.root.innerHTML, /Unable to read/);
  assert.equal(app.state.importing, false);
});

test('all five dashboards, upload and share controls are fully English', () => {
  const app = appHarness();
  assertEnglish(app.root.innerHTML);
  app.parseText(completeReport, 'test.csv');
  for (const tab of ['overview', 'performance', 'positions', 'daily', 'data']) {
    app.state.activeTab = tab;
    app.render();
    assertEnglish(app.root.innerHTML);
  }
  app.state.shareOpen = true;
  app.render();
  assertEnglish(app.root.innerHTML);
  assert.match(app.root.innerHTML, /Share image preview/);
});

test('empty pages and missing P/L diagnostics are English with unknown values', () => {
  const app = appHarness();
  app.parseText(account, 'empty.csv');
  for (const tab of ['overview', 'performance', 'positions', 'daily', 'data']) {
    app.state.activeTab = tab;
    app.render();
    assertEnglish(app.root.innerHTML);
  }
  app.state.activeTab = 'performance';
  app.render();
  assert.match(app.root.innerHTML, /P\/L summary data is missing/);
  assert.match(app.root.innerHTML, /—/);
  assert.doesNotMatch(app.root.innerHTML, /Return.*0\.00%/);
  assert.equal(app.formatMoney(null), '—');
  assert.equal(app.signedMoney(null), '—');
  assert.equal(app.formatPercent(app.safePercent(null, 100)), '—');
  assert.equal(app.formatMoney(0), '$0.00');
});

test('switching languages preserves report and filters; translates existing errors', () => {
  const app = appHarness();
  app.parseText(completeReport, 'report.csv');
  const report = app.state.data;
  app.state.search = 'ABC';
  app.state.dailyMonth = '2026-01';
  app.state.language = 'zh';
  app.applyLanguage();
  app.render();
  assert.match(app.root.innerHTML, /已实现盈亏/);
  app.state.language = 'en';
  app.applyLanguage();
  app.render();
  assertEnglish(app.root.innerHTML);
  assert.equal(app.state.data, report);
  assert.equal(app.state.search, 'ABC');
  assert.equal(app.state.dailyMonth, '2026-01');
  app.parseText('', '');
  assert.match(app.root.innerHTML, /There is no content to parse/);
  app.state.language = 'zh';
  app.applyLanguage();
  app.state.data = null;
  app.render();
  assert.match(app.root.innerHTML, /没有可解析的内容/);
});

test('Chinese Activity Statement uploads render the dashboard instead of an export-language error', () => {
  const app = appHarness('zh');
  app.parseText(chineseReport, '中文活动账单.csv');
  assert.ok(app.state.data);
  assert.equal(app.state.sourceName, '中文活动账单.csv');
  assert.equal(app.state.activeTab, 'performance');
  assert.equal(app.state.error, '');
  assert.match(app.root.innerHTML, /已实现盈亏/);
  assert.doesNotMatch(app.root.innerHTML, /请将 Language 设置为 English/);
});

test('invalid currency fails safely and leaves no injected HTML or stale report', () => {
  const app = appHarness();
  app.parseText(completeReport, 'valid.csv');
  app.parseText(account.replace(',USD', ',<img src=x onerror=alert(1)>'), 'bad.csv');
  assert.equal(app.state.data, null);
  assert.match(app.root.innerHTML, /invalid currency code/);
  assert.doesNotMatch(app.root.innerHTML, /onerror|<img src=x/);
});

test('missing exchange rate shows a localized actionable error', () => {
  const app = appHarness();
  app.parseText(account + forex, 'missing-rate.csv');
  assert.equal(app.state.data, null);
  assert.match(app.root.innerHTML, /Missing base currency exchange rate: HKD/);
  assertEnglish(app.root.innerHTML);
  app.state.language = 'zh';
  app.applyLanguage();
  app.render();
  assert.match(app.root.innerHTML, /缺少基础货币换算汇率：HKD/);
});

test('formatted report values remain escaped in HTML tables', () => {
  const app = appHarness();
  const data = parseIbkrReport(completeReport);
  const payload = '<img src=x onerror=alert(1)>';
  const position = { ...data.positions[0], currency: payload, symbol: payload };
  const trade = { ...data.tradeDetails[0], currency: payload, commissionCurrency: payload, baseSymbol: payload };
  for (const html of [app.renderPositionsTable([position], 'USD'), app.renderDailyTradeTable([trade], 'USD')]) {
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /&lt;img/);
  }
});

test('Forex commission table labels the original USD amount correctly', () => {
  const app = appHarness();
  const data = parseIbkrReport(account + rates + forex);
  const html = app.renderDailyTradeTable(data.tradeDetails, 'USD');
  assert.match(html, /-\$0\.35/);
  assert.doesNotMatch(html, /HK\$0\.35/);
});

test('landscape and portrait share text use the selected language and preserve user names', async () => {
  const app = appHarness();
  const data = parseIbkrReport(completeReport);
  const texts = [];
  const ctx = new Proxy({
    fillText: text => texts.push(text),
    measureText: text => ({ width: String(text).length * 7 })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  const canvas = { getContext: () => ctx };
  for (const format of ['landscape', 'portrait']) {
    texts.length = 0;
    await app.drawShareImage(canvas, data, format);
    assert.doesNotMatch(texts.join('\n'), /\p{Script=Han}/u);
    assert.ok(texts.includes('Ending NAV'));
    assert.ok(texts.includes('Total P/L'));
  }
  app.state.language = 'zh';
  app.applyLanguage();
  texts.length = 0;
  await app.drawShareImage(canvas, data, 'portrait');
  assert.ok(texts.includes('期末净值'));
  app.state.language = 'en';
  app.applyLanguage();
  app.state.shareName = '投资者 & <Alice>';
  texts.length = 0;
  await app.drawShareImage(canvas, data, 'landscape');
  assert.ok(texts.includes('投资者 & <Alice>'));
});
