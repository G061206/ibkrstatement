import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseIbkrReport } from '../src/parser.js';
import { isChineseIbkrReport } from '../src/reportLanguage.js';
import { decodeReportFile } from '../src/encoding.js';
import { translate } from '../src/i18n.js';
import { account, stockRoundTrip, rates, forex, completeReport, chineseReport } from './fixtures.js';

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
    parseIbkrReport, isChineseIbkrReport, decodeReportFile, translate
  });
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/^import .+;\r?$/gm, '');
  vm.runInContext(source, sandbox);
  const api = vm.runInContext('({ state, render, parseText, applyLanguage, drawShareImage, formatMoney, formatPercent, signedMoney, safePercent, displayError, displayWarning, renderPositionsTable, renderDailyTradeTable })', sandbox);
  return { ...api, root };
}

function assertEnglish(html) {
  const withoutLanguageButton = html.replace(/<button[^>]*data-language="zh"[^>]*>中<\/button>/g, '');
  assert.doesNotMatch(withoutLanguageButton, /\p{Script=Han}/u);
}

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
