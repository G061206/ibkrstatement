import { parseIbkrReport } from "./parser.js";

const app = document.querySelector("#app");
const resetButton = document.querySelector("#resetButton");
const privacyPill = document.querySelector("#privacyPill");
const resetLabel = document.querySelector("#resetLabel");
const languageSwitcher = document.querySelector("#languageSwitcher");

let currentData = null;
let activeTab = "overview";
let currentLanguage = localStorage.getItem("ibkr-report-language") || "zh";

const translations = {
  zh: {
    htmlLang: "zh-CN",
    privacy: "仅本地",
    reset: "重置",
    eyebrow: "IBKR Activity Statement",
    homeTitle: "IBKR报表解析",
    homeIntro: "上传 CSV 或 TXT 后直接生成账户视图，文件只在当前浏览器中处理。",
    previewAlt: "IBKR 报表仪表盘预览",
    chooseFile: "选择报表文件",
    pasteLabel: "粘贴 CSV 内容",
    noFile: "尚未选择文件",
    parse: "解析",
    fileReadError: "读取文件失败，请重新选择报表。",
    emptyContent: "没有可解析的内容。",
    noSections: "没有识别到 IBKR CSV 区块。",
    parseFailed: "解析失败。",
    loadingEyebrow: "Parsing",
    loadingTitle: "正在解析",
    loadingBody: "读取报表结构中",
    footerNote: "解析在本地浏览器完成。导出的 JSON 仅包含汇总后的结构化数据。",
    unknownAccount: "未识别账户",
    unknownPeriod: "未识别周期",
    accountView: "账户视图",
    sections: "sections",
    exportJson: "导出 JSON",
    replaceFile: "更换文件",
    tabOverview: "总览",
    tabPositions: "持仓",
    tabPerformance: "收益",
    tabData: "数据",
    tradeOrders: "交易订单",
    currentPositions: "当前持仓",
    assetClasses: "类资产",
    recognizedSections: "识别区块",
    monthlyNetContribution: "月度净贡献",
    monthlyNetContributionKicker: "净月度贡献",
    assetAllocation: "资产配置",
    assetAllocationKicker: "按持仓市值统计",
    navChange: "NAV 变化",
    navBridge: "报表周期桥接",
    notices: "提示",
    parserDiagnostics: "解析诊断",
    endingNav: "期末净值",
    cash: "现金",
    totalPL: "总盈亏",
    realized: "已实现",
    unrealizedPL: "未实现盈亏",
    realizedUnrealized: "已实现与未实现",
    timeWeightedReturn: "时间加权收益",
    optionPremium: "期权权利金",
    optionOrders: "期权订单",
    commissionFees: "佣金费用",
    allOrderTrades: "全部订单交易",
    stockPL: "股票盈亏",
    optionPL: "期权盈亏",
    noMonthlyData: "暂无月度数据",
    noPositionMarketValue: "暂无持仓市值",
    noNavDetails: "暂无 NAV 明细",
    dataNormal: "数据结构正常",
    rows: "rows",
    searchSymbol: "搜索标的",
    symbol: "标的",
    asset: "资产",
    side: "方向",
    quantity: "数量",
    marketValue: "市值",
    cost: "成本",
    unrealized: "未实现",
    currency: "币种",
    noPositions: "暂无持仓数据",
    plDistribution: "盈亏分布",
    plDistributionKicker: "已实现与未实现盈亏",
    tickerContribution: "Ticker 贡献",
    closedPositions: "已平仓持仓",
    monthlyDetails: "月度明细",
    incomeCosts: "收入与成本",
    realizedTrades: "已实现交易",
    topAbsPL: "按绝对盈亏排序",
    category: "类别",
    total: "合计",
    noTickerContribution: "暂无已平仓贡献",
    month: "月份",
    options: "期权",
    stocks: "股票",
    forex: "外汇",
    interest: "利息",
    commissions: "佣金",
    net: "净额",
    noMonthlyDetails: "暂无月度明细",
    date: "日期",
    noRealizedTrades: "暂无已实现交易",
    sectionRecognition: "区块识别",
    parsedSections: "已解析 CSV 区块",
    exchangeRates: "汇率",
    baseCurrencyConversion: "基础货币换算",
    currencyExposure: "币种敞口",
    openPositionExposure: "持仓敞口",
    diagnostics: "诊断",
    warnings: "警告",
    noTradeRange: "暂无交易区间",
    long: "多头",
    short: "空头",
    navStartingValue: "期初净值",
    navMarkToMarket: "盯市变化",
    navDepositsAndWithdrawals: "出入金",
    navInterest: "利息",
    navChangeInInterestAccruals: "应计利息",
    navOtherFees: "其他费用",
    navCommissions: "佣金",
    navSalesTax: "销售税",
    navOtherFXTranslations: "汇兑折算",
    navEndingValue: "期末净值"
  },
  en: {
    htmlLang: "en",
    privacy: "Local only",
    reset: "Reset",
    eyebrow: "IBKR Activity Statement",
    homeTitle: "IBKR Statement Parser",
    homeIntro: "Upload a CSV or TXT file to generate an account view. Processing stays in this browser.",
    previewAlt: "IBKR dashboard preview",
    chooseFile: "Select statement file",
    pasteLabel: "Paste CSV content",
    noFile: "No file selected",
    parse: "Parse",
    fileReadError: "Could not read the file. Please choose the statement again.",
    emptyContent: "There is no content to parse.",
    noSections: "No IBKR CSV sections were recognized.",
    parseFailed: "Parsing failed.",
    loadingEyebrow: "Parsing",
    loadingTitle: "Parsing statement",
    loadingBody: "Reading report structure",
    footerNote: "Parsing runs locally in your browser. Exported JSON contains only summarized structured data.",
    unknownAccount: "Unknown account",
    unknownPeriod: "Unknown period",
    accountView: "Account view",
    sections: "sections",
    exportJson: "Export JSON",
    replaceFile: "Replace file",
    tabOverview: "Overview",
    tabPositions: "Positions",
    tabPerformance: "Performance",
    tabData: "Data",
    tradeOrders: "Trade orders",
    currentPositions: "Current positions",
    assetClasses: "asset classes",
    recognizedSections: "Recognized sections",
    monthlyNetContribution: "Monthly net contribution",
    monthlyNetContributionKicker: "Net monthly contribution",
    assetAllocation: "Asset allocation",
    assetAllocationKicker: "Open positions by market value",
    navChange: "NAV change",
    navBridge: "Statement period bridge",
    notices: "Notices",
    parserDiagnostics: "Parser diagnostics",
    endingNav: "Ending NAV",
    cash: "Cash",
    totalPL: "Total P/L",
    realized: "Realized",
    unrealizedPL: "Unrealized P/L",
    realizedUnrealized: "Realized & unrealized",
    timeWeightedReturn: "Time weighted return",
    optionPremium: "Option premium",
    optionOrders: "option orders",
    commissionFees: "Commissions & fees",
    allOrderTrades: "All order trades",
    stockPL: "Stock P/L",
    optionPL: "Option P/L",
    noMonthlyData: "No monthly data",
    noPositionMarketValue: "No position market value",
    noNavDetails: "No NAV details",
    dataNormal: "Data structure looks normal",
    rows: "rows",
    searchSymbol: "Search symbol",
    symbol: "Symbol",
    asset: "Asset",
    side: "Side",
    quantity: "Quantity",
    marketValue: "Market value",
    cost: "Cost",
    unrealized: "Unrealized",
    currency: "Currency",
    noPositions: "No position data",
    plDistribution: "P/L distribution",
    plDistributionKicker: "Realized and unrealized P/L",
    tickerContribution: "Ticker contribution",
    closedPositions: "Closed positions",
    monthlyDetails: "Monthly details",
    incomeCosts: "Income and costs",
    realizedTrades: "Realized trades",
    topAbsPL: "Top absolute P/L",
    category: "Category",
    total: "Total",
    noTickerContribution: "No closed-position contribution",
    month: "Month",
    options: "Options",
    stocks: "Stocks",
    forex: "Forex",
    interest: "Interest",
    commissions: "Commissions",
    net: "Net",
    noMonthlyDetails: "No monthly details",
    date: "Date",
    noRealizedTrades: "No realized trades",
    sectionRecognition: "Section recognition",
    parsedSections: "Parsed CSV sections",
    exchangeRates: "Exchange rates",
    baseCurrencyConversion: "Base currency conversion",
    currencyExposure: "Currency exposure",
    openPositionExposure: "Open position exposure",
    diagnostics: "Diagnostics",
    warnings: "Warnings",
    noTradeRange: "No trade range",
    long: "Long",
    short: "Short",
    navStartingValue: "Starting value",
    navMarkToMarket: "Mark-to-market",
    navDepositsAndWithdrawals: "Deposits & withdrawals",
    navInterest: "Interest",
    navChangeInInterestAccruals: "Change in interest accruals",
    navOtherFees: "Other fees",
    navCommissions: "Commissions",
    navSalesTax: "Sales tax",
    navOtherFXTranslations: "Other FX translations",
    navEndingValue: "Ending value"
  }
};

const icons = {
  upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>`,
  file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v5a2 2 0 0 0 2 2h5"/><path d="M7 3h8l6 6v12H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"/></svg>`,
  parse: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/><path d="M4 20h16"/></svg>`,
  download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="7"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65"/><path d="M4 4v5h5"/></svg>`
};

bindLanguageSwitcher();
updateLanguageChrome();
renderUpload();

resetButton.addEventListener("click", () => {
  currentData = null;
  activeTab = "overview";
  renderUpload();
});

function t(key) {
  return translations[currentLanguage]?.[key] ?? translations.zh[key] ?? key;
}

function bindLanguageSwitcher() {
  languageSwitcher?.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      currentLanguage = button.dataset.language || "zh";
      localStorage.setItem("ibkr-report-language", currentLanguage);
      updateLanguageChrome();
      if (currentData) {
        renderDashboard();
      } else {
        renderUpload();
      }
    });
  });
}

function updateLanguageChrome() {
  document.documentElement.lang = t("htmlLang");
  privacyPill.textContent = t("privacy");
  resetLabel.textContent = t("reset");

  languageSwitcher?.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderUpload(errorMessage = "") {
  resetButton.classList.add("hidden");
  document.title = "IBKR Report Studio";
  app.innerHTML = `
    <section class="upload-stage">
      <div class="upload-copy">
        <p class="eyebrow">${t("eyebrow")}</p>
        <h1>${t("homeTitle")}</h1>
        <p>${t("homeIntro")}</p>
        <img class="preview-asset" src="./assets/statement-preview.svg" alt="${t("previewAlt")}" />
      </div>

      <div class="upload-panel">
        ${errorMessage ? renderErrorBanner(errorMessage) : ""}
        <label class="dropzone" id="dropzone">
          <input id="fileInput" type="file" accept=".csv,.txt,text/csv,text/plain" />
          <span class="dropzone-inner">
            <span class="upload-symbol">${icons.upload}</span>
            <span>
              <span class="dropzone-title">${t("chooseFile")}</span>
              <span class="dropzone-meta">CSV / TXT</span>
            </span>
          </span>
        </label>

        <div class="paste-box">
          <label for="csvText">${t("pasteLabel")}</label>
          <textarea id="csvText" spellcheck="false" placeholder="Statement,Header,..."></textarea>
        </div>

        <div class="upload-actions">
          <span class="file-name" id="selectedFile">${t("noFile")}</span>
          <button class="primary-button" id="parseTextButton" type="button">
            ${icons.parse}
            <span>${t("parse")}</span>
          </button>
        </div>
      </div>
    </section>
  `;

  bindUploadEvents();
}

function bindUploadEvents() {
  const dropzone = document.querySelector("#dropzone");
  const fileInput = document.querySelector("#fileInput");
  const selectedFile = document.querySelector("#selectedFile");
  const parseTextButton = document.querySelector("#parseTextButton");
  const csvText = document.querySelector("#csvText");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    selectedFile.textContent = file.name;
    readFile(file);
  });

  for (const eventName of ["dragenter", "dragover"]) {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    });
  }

  for (const eventName of ["dragleave", "drop"]) {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
    });
  }

  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    selectedFile.textContent = file.name;
    readFile(file);
  });

  parseTextButton.addEventListener("click", () => {
    parseText(csvText.value, "pasted-statement.csv");
  });
}

function readFile(file) {
  const reader = new FileReader();
  reader.onload = () => parseText(String(reader.result || ""), file.name);
  reader.onerror = () => renderUpload(t("fileReadError"));
  reader.readAsText(file, "utf-8");
}

function parseText(text, sourceName) {
  if (!text.trim()) {
    renderUpload(t("emptyContent"));
    return;
  }

  renderLoading(sourceName);

  window.requestAnimationFrame(() => {
    try {
      const data = parseIbkrReport(text);
      const sectionCount = Object.keys(data.sectionStats).length;
      if (!sectionCount) {
        throw new Error(t("noSections"));
      }

      currentData = data;
      activeTab = "overview";
      renderDashboard();
    } catch (error) {
      renderUpload(error instanceof Error ? error.message : t("parseFailed"));
    }
  });
}

function renderLoading(sourceName) {
  app.innerHTML = `
    <section class="upload-stage">
      <div class="upload-copy">
        <p class="eyebrow">${t("loadingEyebrow")}</p>
        <h1>${t("loadingTitle")}</h1>
        <p>${escapeHtml(sourceName)}</p>
      </div>
      <div class="upload-panel">
        <div class="empty-state">${t("loadingBody")}</div>
      </div>
    </section>
  `;
}

function renderDashboard() {
  if (!currentData) return renderUpload();

  resetButton.classList.remove("hidden");
  document.title = `IBKR Report Studio - ${currentData.accountInfo.period || "Dashboard"}`;

  app.innerHTML = `
    <section class="dashboard">
      ${renderWorkspaceHeader(currentData)}
      ${renderTabs()}
      <div class="panel ${activeTab === "overview" ? "is-active" : ""}" data-panel="overview">
        ${renderOverview(currentData)}
      </div>
      <div class="panel ${activeTab === "positions" ? "is-active" : ""}" data-panel="positions">
        ${renderPositions(currentData)}
      </div>
      <div class="panel ${activeTab === "performance" ? "is-active" : ""}" data-panel="performance">
        ${renderPerformance(currentData)}
      </div>
      <div class="panel ${activeTab === "data" ? "is-active" : ""}" data-panel="data">
        ${renderDataQuality(currentData)}
      </div>
      <p class="footer-note">${t("footerNote")}</p>
    </section>
  `;

  bindDashboardEvents();
}

function renderWorkspaceHeader(data) {
  const account = data.accountInfo.account ? maskAccount(data.accountInfo.account) : t("unknownAccount");
  const period = data.accountInfo.period || t("unknownPeriod");
  const name = data.accountInfo.name || t("accountView");

  return `
    <div class="workspace-header">
      <div>
        <span class="status-pill">${escapeHtml(data.baseCurrency)} Base</span>
        <h1>${escapeHtml(name)}</h1>
        <div class="workspace-meta">
          <span class="privacy-pill">${escapeHtml(account)}</span>
          <span class="privacy-pill">${escapeHtml(period)}</span>
          <span class="privacy-pill">${Object.keys(data.sectionStats).length} ${t("sections")}</span>
        </div>
      </div>
      <div class="workspace-actions">
        <button class="quiet-button" id="downloadJsonButton" type="button">
          ${icons.download}
          <span>${t("exportJson")}</span>
        </button>
        <button class="ghost-button" id="replaceFileButton" type="button">
          ${icons.refresh}
          <span>${t("replaceFile")}</span>
        </button>
      </div>
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    ["overview", t("tabOverview")],
    ["positions", t("tabPositions")],
    ["performance", t("tabPerformance")],
    ["data", t("tabData")]
  ];

  return `
    <div class="tabbar" role="tablist" aria-label="Dashboard views">
      ${tabs
        .map(
          ([key, label]) => `
            <button class="tab-button ${activeTab === key ? "is-active" : ""}" data-tab="${key}" type="button" role="tab" aria-selected="${activeTab === key}">
              ${label}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderOverview(data) {
  return `
    ${renderKpis(data)}
    <div class="insight-strip">
      ${renderMiniStat(t("tradeOrders"), formatNumber(data.tradeSummary.orderCount), renderDateRange(data.tradeSummary))}
      ${renderMiniStat(t("currentPositions"), formatNumber(data.positions.length), `${data.assetAllocation.length} ${t("assetClasses")}`)}
      ${renderMiniStat(t("recognizedSections"), formatNumber(Object.keys(data.sectionStats).length), "IBKR CSV")}
    </div>
    <div class="content-grid">
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("monthlyNetContribution")}</h2>
            <div class="card-kicker">${t("monthlyNetContributionKicker")}</div>
          </div>
        </div>
        ${renderMonthlyChart(data.monthlySummary, data.baseCurrency)}
      </article>
      <div class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("assetAllocation")}</h2>
            <div class="card-kicker">${t("assetAllocationKicker")}</div>
          </div>
        </div>
        ${renderAllocation(data.assetAllocation, data.baseCurrency)}
      </div>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("navChange")}</h2>
            <div class="card-kicker">${t("navBridge")}</div>
          </div>
        </div>
        ${renderNavChange(data.navChange, data.baseCurrency)}
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("notices")}</h2>
            <div class="card-kicker">${t("parserDiagnostics")}</div>
          </div>
        </div>
        ${renderWarnings(data.warnings)}
      </article>
    </div>
  `;
}

function renderKpis(data) {
  const total = data.plSummary.total;
  const cards = [
    [t("endingNav"), formatMoney(data.nav.total, data.baseCurrency), `${t("cash")} ${formatMoney(data.nav.cash, data.baseCurrency)}`, data.nav.total],
    [t("totalPL"), formatMoney(total.total, data.baseCurrency), `${t("realized")} ${formatMoney(total.realized, data.baseCurrency)}`, total.total],
    [t("unrealizedPL"), formatMoney(total.unrealized, data.baseCurrency), t("realizedUnrealized"), total.unrealized],
    ["TWR", formatPercent(data.nav.rateOfReturn), t("timeWeightedReturn"), data.nav.rateOfReturn],
    [t("optionPremium"), formatMoney(data.tradeSummary.optionPremium, data.baseCurrency), `${formatNumber(data.tradeSummary.optionOrders)} ${t("optionOrders")}`, data.tradeSummary.optionPremium],
    [t("commissionFees"), formatMoney(data.tradeSummary.totalCommissions, data.baseCurrency), t("allOrderTrades"), -data.tradeSummary.totalCommissions],
    [t("stockPL"), formatMoney(data.plSummary.stocks.total, data.baseCurrency), t("stocks"), data.plSummary.stocks.total],
    [t("optionPL"), formatMoney(data.plSummary.options.total, data.baseCurrency), t("options"), data.plSummary.options.total]
  ];

  return `
    <div class="kpi-grid">
      ${cards
        .map(
          ([label, value, foot, tone]) => `
            <div class="metric-card">
              <div class="metric-label">${label}</div>
              <div class="metric-value ${valueTone(tone)}">${value}</div>
              <div class="metric-foot">${escapeHtml(foot)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMiniStat(label, value, foot) {
  return `
    <div class="mini-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(foot)}</span>
    </div>
  `;
}

function renderMonthlyChart(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noMonthlyData")}</div>`;

  const visibleRows = rows.slice(-12);
  const maxValue = Math.max(...visibleRows.map((row) => Math.abs(row.net)), 1);

  return `
    <div class="bar-chart">
      ${visibleRows
        .map((row) => {
          const width = Math.max(2, Math.min(50, (Math.abs(row.net) / maxValue) * 50));
          const negative = row.net < 0;
          return `
            <div class="bar-row">
              <span class="bar-label">${escapeHtml(row.month.slice(5))}</span>
              <span class="bar-track" title="${escapeHtml(formatMoney(row.net, currency))}">
                <span class="bar-zero"></span>
                <span class="bar-fill ${negative ? "negative-fill" : ""}" style="width:${width}%"></span>
              </span>
              <span class="bar-value ${valueTone(row.net)}">${formatMoney(row.net, currency)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderAllocation(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noPositionMarketValue")}</div>`;

  return `
    <div class="allocation-list">
      ${rows
        .map(
          (row) => `
            <div class="allocation-row">
              <div class="allocation-top">
                <span>${escapeHtml(displayGroupName(row.name))}</span>
                <strong>${formatPercent(row.weight * 100)}</strong>
              </div>
              <div class="allocation-track">
                <div class="allocation-fill" style="width:${Math.max(2, row.weight * 100)}%"></div>
              </div>
              <div class="card-kicker">${formatMoney(row.value, currency)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderNavChange(rows, currency) {
  const visibleRows = rows.filter((row) => row.value !== 0 || row.key === "startingValue" || row.key === "endingValue");
  if (!visibleRows.length) return `<div class="empty-state">${t("noNavDetails")}</div>`;

  return `
    <div class="nav-list">
      ${visibleRows
        .map(
          (row) => `
            <div class="nav-row">
              <span class="nav-label">${escapeHtml(displayNavLabel(row))}</span>
              <span class="nav-amount ${valueTone(row.value)}">${formatMoney(row.value, currency)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderWarnings(warnings) {
  if (!warnings.length) return `<div class="empty-state">${t("dataNormal")}</div>`;
  return `<ul class="warning-list">${warnings.map((warning) => `<li>${escapeHtml(displayWarning(warning))}</li>`).join("")}</ul>`;
}

function renderPositions(data) {
  return `
    <div class="data-card">
      <div class="table-tools">
        <div>
          <h2 class="card-title">${t("currentPositions")}</h2>
          <div class="card-kicker">${formatNumber(data.positions.length)} ${t("rows")}</div>
        </div>
        <label class="search-box">
          ${icons.search}
          <input id="positionSearch" type="search" placeholder="${t("searchSymbol")}" />
        </label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${t("symbol")}</th>
              <th>${t("asset")}</th>
              <th>${t("side")}</th>
              <th class="numeric">${t("quantity")}</th>
              <th class="numeric">${t("marketValue")}</th>
              <th class="numeric">${t("cost")}</th>
              <th class="numeric">${t("unrealized")}</th>
              <th>${t("currency")}</th>
            </tr>
          </thead>
          <tbody id="positionsTableBody">
            ${renderPositionRows(data.positions, data.baseCurrency)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPositionRows(positions, currency) {
  if (!positions.length) {
    return `<tr><td colspan="8">${t("noPositions")}</td></tr>`;
  }

  return positions
    .map(
      (position) => `
        <tr>
          <td>
            <span class="symbol-cell">${escapeHtml(position.symbol)}</span>
            ${position.isOption ? `<span class="tag">${escapeHtml(position.optionType)} ${escapeHtml(String(position.strikePrice))}</span>` : ""}
          </td>
          <td>${escapeHtml(displayGroupName(position.assetCategory))}</td>
          <td><span class="tag">${escapeHtml(displaySide(position.side))}</span></td>
          <td class="numeric">${formatNumber(position.quantity)}</td>
          <td class="numeric">${formatMoney(position.value, currency)}</td>
          <td class="numeric">${formatMoney(position.costBasis, currency)}</td>
          <td class="numeric ${valueTone(position.unrealizedPL)}">${formatMoney(position.unrealizedPL, currency)}</td>
          <td>${escapeHtml(position.currency)}</td>
        </tr>
      `
    )
    .join("");
}

function renderPerformance(data) {
  return `
    <div class="content-grid">
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("plDistribution")}</h2>
            <div class="card-kicker">${t("plDistributionKicker")}</div>
          </div>
        </div>
        ${renderPlTable(data)}
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("tickerContribution")}</h2>
            <div class="card-kicker">${t("closedPositions")}</div>
          </div>
        </div>
        ${renderTickerTable(data.tickerPL, data.baseCurrency)}
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("monthlyDetails")}</h2>
            <div class="card-kicker">${t("incomeCosts")}</div>
          </div>
        </div>
        ${renderMonthlyTable(data.monthlySummary, data.baseCurrency)}
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("realizedTrades")}</h2>
            <div class="card-kicker">${t("topAbsPL")}</div>
          </div>
        </div>
        ${renderRealizedTrades(data.tradeSummary.topRealizedTrades, data.baseCurrency)}
      </article>
    </div>
  `;
}

function renderPlTable(data) {
  const rows = [
    [t("stocks"), data.plSummary.stocks],
    [t("options"), data.plSummary.options],
    [t("forex"), data.plSummary.forex],
    [t("total"), data.plSummary.total]
  ];

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("category")}</th>
            <th class="numeric">${t("realized")}</th>
            <th class="numeric">${t("unrealized")}</th>
            <th class="numeric">${t("total")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td class="symbol-cell">${label}</td>
                  <td class="numeric ${valueTone(value.realized)}">${formatMoney(value.realized, data.baseCurrency)}</td>
                  <td class="numeric ${valueTone(value.unrealized)}">${formatMoney(value.unrealized, data.baseCurrency)}</td>
                  <td class="numeric ${valueTone(value.total)}">${formatMoney(value.total, data.baseCurrency)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTickerTable(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noTickerContribution")}</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th class="numeric">${t("realized")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .slice(0, 12)
            .map(
              (row) => `
                <tr>
                  <td class="symbol-cell">${escapeHtml(row.ticker)}</td>
                  <td class="numeric ${valueTone(row.realizedPL)}">${formatMoney(row.realizedPL, currency)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMonthlyTable(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noMonthlyDetails")}</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("month")}</th>
            <th class="numeric">${t("options")}</th>
            <th class="numeric">${t("stocks")}</th>
            <th class="numeric">${t("forex")}</th>
            <th class="numeric">${t("interest")}</th>
            <th class="numeric">${t("commissions")}</th>
            <th class="numeric">${t("net")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .slice()
            .reverse()
            .map(
              (row) => `
                <tr>
                  <td class="symbol-cell">${escapeHtml(row.month)}</td>
                  <td class="numeric ${valueTone(row.optionsPL)}">${formatMoney(row.optionsPL, currency)}</td>
                  <td class="numeric ${valueTone(row.stocksPL)}">${formatMoney(row.stocksPL, currency)}</td>
                  <td class="numeric ${valueTone(row.forexPL)}">${formatMoney(row.forexPL, currency)}</td>
                  <td class="numeric ${valueTone(row.interest + row.syepIncome)}">${formatMoney(row.interest + row.syepIncome, currency)}</td>
                  <td class="numeric negative">${formatMoney(row.commissions + row.fees, currency)}</td>
                  <td class="numeric ${valueTone(row.net)}">${formatMoney(row.net, currency)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRealizedTrades(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noRealizedTrades")}</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("date")}</th>
            <th>${t("symbol")}</th>
            <th>${t("category")}</th>
            <th class="numeric">P/L</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${formatDate(row.date)}</td>
                  <td class="symbol-cell">${escapeHtml(row.symbol)}</td>
                  <td>${escapeHtml(displayGroupName(row.category || ""))}</td>
                  <td class="numeric ${valueTone(row.realizedPL)}">${formatMoney(row.realizedPL, currency)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDataQuality(data) {
  const rateRows = Object.entries(data.exchangeRates).sort(([a], [b]) => a.localeCompare(b));
  const sectionRows = Object.entries(data.sectionStats).sort(([a], [b]) => a.localeCompare(b));

  return `
    <div class="content-grid">
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("sectionRecognition")}</h2>
            <div class="card-kicker">${t("parsedSections")}</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th class="numeric">${t("rows")}</th>
              </tr>
            </thead>
            <tbody>
              ${sectionRows
                .map(
                  ([name, count]) => `
                    <tr>
                      <td class="symbol-cell">${escapeHtml(name)}</td>
                      <td class="numeric">${formatNumber(count)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("exchangeRates")}</h2>
            <div class="card-kicker">${t("baseCurrencyConversion")}</div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>${t("currency")}</th>
                <th class="numeric">Rate</th>
              </tr>
            </thead>
            <tbody>
              ${rateRows
                .map(
                  ([currency, rate]) => `
                    <tr>
                      <td class="symbol-cell">${escapeHtml(currency)}</td>
                      <td class="numeric">${formatNumber(rate, 5)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("currencyExposure")}</h2>
            <div class="card-kicker">${t("openPositionExposure")}</div>
          </div>
        </div>
        ${renderAllocation(data.currencyExposure, data.baseCurrency)}
      </article>
      <article class="data-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">${t("diagnostics")}</h2>
            <div class="card-kicker">${t("warnings")}</div>
          </div>
        </div>
        ${renderWarnings(data.warnings)}
      </article>
    </div>
  `;
}

function bindDashboardEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      renderDashboard();
    });
  });

  document.querySelector("#downloadJsonButton")?.addEventListener("click", () => {
    downloadJson(currentData);
  });

  document.querySelector("#replaceFileButton")?.addEventListener("click", () => {
    currentData = null;
    renderUpload();
  });

  const searchInput = document.querySelector("#positionSearch");
  const tableBody = document.querySelector("#positionsTableBody");
  if (searchInput && tableBody) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const filtered = currentData.positions.filter((position) => {
        return [position.symbol, position.baseSymbol, position.assetCategory, position.currency]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
      tableBody.innerHTML = renderPositionRows(filtered, currentData.baseCurrency);
    });
  }
}

function displayGroupName(name) {
  const labels = {
    Stocks: t("stocks"),
    Options: t("options"),
    Forex: t("forex"),
    "Equity and Index Options": t("options"),
    Total: t("total")
  };

  return labels[name] || name;
}

function displaySide(side) {
  if (side === "Long") return t("long");
  if (side === "Short") return t("short");
  return side;
}

function displayNavLabel(row) {
  const labels = {
    startingValue: t("navStartingValue"),
    markToMarket: t("navMarkToMarket"),
    depositsAndWithdrawals: t("navDepositsAndWithdrawals"),
    interest: t("navInterest"),
    changeInInterestAccruals: t("navChangeInInterestAccruals"),
    otherFees: t("navOtherFees"),
    commissions: t("navCommissions"),
    salesTax: t("navSalesTax"),
    otherFXTranslations: t("navOtherFXTranslations"),
    endingValue: t("navEndingValue")
  };

  return labels[row.key] || row.label;
}

function displayWarning(warning) {
  if (currentLanguage !== "en") return warning;

  const warnings = {
    "未找到 Account Information 区块。": "Account Information section was not found.",
    "未找到 Net Asset Value 区块。": "Net Asset Value section was not found.",
    "未找到 Trades 区块，交易分析会为空。": "Trades section was not found, so trade analysis will be empty.",
    "未找到 Open Positions 区块，持仓列表会为空。": "Open Positions section was not found, so the positions table will be empty.",
    "文件结构不像标准 IBKR Activity Statement CSV。": "The file structure does not look like a standard IBKR Activity Statement CSV."
  };

  return warnings[warning] || warning;
}

function downloadJson(data) {
  const safeAccount = (data.accountInfo.account || "ibkr").replace(/[^\w.-]+/g, "_");
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeAccount}-report-summary.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function renderDateRange(summary) {
  if (!summary.firstTradeDate || !summary.lastTradeDate) return t("noTradeRange");
  return `${formatDate(summary.firstTradeDate)} - ${formatDate(summary.lastTradeDate)}`;
}

function renderErrorBanner(message) {
  return `<div class="error-banner">${icons.alert}<span>${escapeHtml(message)}</span></div>`;
}

function formatMoney(value, currency = "USD") {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(numberLocale(), {
      style: "currency",
      currency,
      maximumFractionDigits: Math.abs(amount) >= 1000 ? 0 : 2
    }).format(amount);
  } catch {
    return `${currency} ${formatNumber(amount, Math.abs(amount) >= 1000 ? 0 : 2)}`;
  }
}

function formatNumber(value, digits = 0) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(numberLocale(), {
    maximumFractionDigits: digits
  }).format(amount);
}

function formatPercent(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${formatNumber(amount, 2)}%`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(numberLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function numberLocale() {
  return currentLanguage === "en" ? "en-US" : "zh-CN";
}

function valueTone(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function maskAccount(account) {
  if (account.length <= 4) return account;
  return `${account.slice(0, 2)}••••${account.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
