import { decodeReportFile } from "./encoding.js?v=2.1.1";
import { isChineseIbkrReport } from "./reportLanguage.js?v=2.1.1";
import { parseIbkrReport } from "./parser.js?v=2.1.1";

const app = document.querySelector("#app");

const tabs = [
  { id: "overview", labelKey: "tabOverview", titleKey: "overviewTitle", icon: "dashboard" },
  { id: "positions", labelKey: "tabPositions", titleKey: "positionsTitle", icon: "wallet" },
  { id: "performance", labelKey: "tabPerformance", titleKey: "performanceTitle", icon: "chart" },
  { id: "daily", labelKey: "tabDaily", titleKey: "dailyTitle", icon: "calendar" },
  { id: "data", labelKey: "tabData", titleKey: "dataTitle", icon: "database" }
];

const copy = {
  zh: {
    activityStatement: "Activity Statement",
    tabOverview: "总览",
    tabPositions: "持仓",
    tabPerformance: "收益",
    tabDaily: "每日",
    tabData: "数据",
    overviewTitle: "账户总览",
    positionsTitle: "持仓明细",
    performanceTitle: "绩效概览",
    dailyTitle: "每日统计",
    dataTitle: "数据质量",
    switchTheme: "切换主题",
    mainNav: "主导航",
    uploadEyebrow: "IBKR Activity Statement",
    uploadTitle: "上传活动报表",
    uploadIntro: "拖放您的 Interactive Brokers CSV/TXT 报表，生成本地化账户、持仓与绩效分析。",
    privacyLabel: "隐私说明",
    localOnly: "仅限本地处理",
    privacyBody: "文件只在当前浏览器中读取和解析，不上传服务器，不写入数据库。导出的 JSON 只包含汇总后的结构化结果。",
    dropTitle: "拖放 CSV 文件",
    dropBody: "或点击从您的电脑中浏览。建议导出英文 Activity Statement。",
    chooseFile: "选择文件",
    loadSample: "载入示例",
    pasteCsv: "或者粘贴 CSV 文本",
    parseText: "处理文本",
    exportGuide: "如何从 IBKR 导出",
    guideStep1: "登录 IBKR Client Portal。",
    guideStep2: "进入 Performance & Reports → Statements。",
    guideStep3: "选择 Activity Statement 并点击 Run。",
    guideStep4: "将语言设为 English，格式设为 CSV。",
    guideStep5: "下载文件后回到这里上传或粘贴内容。",
    supportedSections: "支持的数据板块",
    localReport: "本地报表",
    reportNav: "报表导航",
    mobileReportNav: "移动端报表导航",
    exportJson: "导出 JSON",
    shareImage: "生成分享图",
    security: "安全",
    settings: "设置",
    replaceFile: "更换文件",
    searchPlaceholder: "搜索代码或标签...",
    baseCurrency: "基础货币",
    account: "账户",
    unknownAccount: "未识别账户",
    unknownPeriod: "未识别周期",
    overviewHeading: "账户总览",
    overviewSubtitle: "从 NAV、现金、持仓与交易数量快速判断账户状态。",
    performanceHeading: "绩效概览",
    performanceSubtitle: "按报表实际周期汇总已实现、未实现、资产类别和月度净额。",
    dailyHeading: "每日统计",
    dailySubtitle: "按交易日期查看每日已实现盈亏、交易笔数和成交金额。",
    positionsHeading: "持仓明细",
    positionsSubtitle: "按标的、资产类别、方向和币种查看当前 Open Positions。",
    dataHeading: "数据质量",
    dataSubtitle: "核对解析区块、汇率和诊断信息，适合排查报表字段缺失。",
    shareDialogTitle: "生成社交分享图",
    shareSize: "分享图尺寸",
    landscape: "横版",
    portrait: "竖版",
    downloadPng: "下载 PNG",
    close: "关闭",
    plDistribution: "盈亏分布",
    plDistributionKicker: "已实现与未实现盈亏",
    total: "合计",
    realized: "已实现",
    unrealized: "未实现",
    stocks: "股票",
    options: "期权",
    forex: "外汇",
    returnRate: "收益率"
  },
  en: {
    activityStatement: "Activity Statement",
    tabOverview: "Overview",
    tabPositions: "Positions",
    tabPerformance: "Performance",
    tabDaily: "Daily",
    tabData: "Data",
    overviewTitle: "Account Overview",
    positionsTitle: "Positions",
    performanceTitle: "Performance",
    dailyTitle: "Daily Stats",
    dataTitle: "Data Quality",
    switchTheme: "Toggle theme",
    mainNav: "Primary navigation",
    uploadEyebrow: "IBKR Activity Statement",
    uploadTitle: "Upload Activity Statement",
    uploadIntro: "Drop an Interactive Brokers CSV/TXT statement to generate local account, position, and performance analytics.",
    privacyLabel: "Privacy note",
    localOnly: "Local processing only",
    privacyBody: "Files are read and parsed in this browser only. Nothing is uploaded or stored in a database. Exported JSON contains summarized structured results.",
    dropTitle: "Drop CSV file",
    dropBody: "Or browse from your computer. English Activity Statement exports are recommended.",
    chooseFile: "Choose file",
    loadSample: "Load sample",
    pasteCsv: "Or paste CSV text",
    parseText: "Process text",
    exportGuide: "How to export from IBKR",
    guideStep1: "Log in to IBKR Client Portal.",
    guideStep2: "Go to Performance & Reports → Statements.",
    guideStep3: "Choose Activity Statement and click Run.",
    guideStep4: "Set Language to English and Format to CSV.",
    guideStep5: "Download the file, then upload or paste it here.",
    supportedSections: "Supported sections",
    localReport: "Local report",
    reportNav: "Report navigation",
    mobileReportNav: "Mobile report navigation",
    exportJson: "Export JSON",
    shareImage: "Share image",
    security: "Security",
    settings: "Settings",
    replaceFile: "Replace file",
    searchPlaceholder: "Search symbols or tags...",
    baseCurrency: "Base currency",
    account: "Account",
    unknownAccount: "Unknown account",
    unknownPeriod: "Unknown period",
    overviewHeading: "Account Overview",
    overviewSubtitle: "Quickly inspect NAV, cash, positions, and trading activity.",
    performanceHeading: "Performance Overview",
    performanceSubtitle: "Summarize realized, unrealized, asset class, and monthly net contribution for the statement period.",
    dailyHeading: "Daily Stats",
    dailySubtitle: "Review daily realized P/L, trade count, and gross trading value by trade date.",
    positionsHeading: "Positions",
    positionsSubtitle: "Review current Open Positions by symbol, asset class, direction, and currency.",
    dataHeading: "Data Quality",
    dataSubtitle: "Check parsed sections, rates, and diagnostics for missing statement fields.",
    shareDialogTitle: "Generate Social Share Image",
    shareSize: "Share image size",
    landscape: "Landscape",
    portrait: "Portrait",
    downloadPng: "Download PNG",
    close: "Close",
    plDistribution: "P/L Distribution",
    plDistributionKicker: "Realized and unrealized P/L",
    total: "Total",
    realized: "Realized",
    unrealized: "Unrealized",
    stocks: "Stocks",
    options: "Options",
    forex: "Forex",
    returnRate: "Return"
  }
};

const icons = {
  analytics: '<path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15l3-4 3 2 4-7" /><path d="M17 6h1.8v1.8" />',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />',
  upload: '<path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 20h14" />',
  paste: '<path d="M9 4h6l1 2h3v14H5V6h3l1-2Z" /><path d="M9 11h6" /><path d="M9 15h6" />',
  help: '<circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 2-2.4 2.1-2.4 4" /><path d="M12 17h.01" />',
  moon: '<path d="M20.3 15.2A8.5 8.5 0 0 1 8.8 3.7 8.5 8.5 0 1 0 20.3 15.2Z" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" /><path d="m6.3 17.7-1.4 1.4" />',
  language: '<path d="M4 5h9" /><path d="M9 3v2" /><path d="M6 10c2.6 0 4.6-1.7 5.6-5" /><path d="M4 15l5-5" /><path d="M14 21l4-10 4 10" /><path d="M15.5 17h5" />',
  dashboard: '<rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />',
  wallet: '<path d="M4 7h16v12H4z" /><path d="M4 9l3-4h10l3 4" /><path d="M16 13h4" />',
  chart: '<path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-4" /><path d="M12 16V8" /><path d="M16 16v-6" />',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M4 10h16" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 17h.01" /><path d="M12 17h.01" />',
  database: '<ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" /><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />',
  reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7" /><path d="M4 4v5h5" />',
  download: '<path d="M12 4v10" /><path d="m7 9 5 5 5-5" /><path d="M5 20h14" />',
  share: '<circle cx="7" cy="8" r="3" /><circle cx="17" cy="12" r="3" /><circle cx="7" cy="18" r="3" /><path d="m9.7 9.2 4.6 1.8" /><path d="m14.3 13.2-4.6 2.7" />',
  close: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  arrowUp: '<path d="M12 19V5" /><path d="m6 11 6-6 6 6" />',
  arrowDown: '<path d="M12 5v14" /><path d="m6 13 6 6 6-6" />',
  shield: '<path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.4-.2-.1a1.8 1.8 0 0 0-2 .4 1.8 1.8 0 0 0-.6 1.2H9a1.8 1.8 0 0 0-.6-1.2 1.8 1.8 0 0 0-2-.4l-.2.1-2-3.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.1-1V10a1.8 1.8 0 0 0 1.1-1 1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.4.2.1a1.8 1.8 0 0 0 2-.4A1.8 1.8 0 0 0 9 2h6a1.8 1.8 0 0 0 .6 1.2 1.8 1.8 0 0 0 2 .4l.2-.1 2 3.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.1 1v4a1.8 1.8 0 0 0-1 1Z" />'
};

const SHARE_IMAGE_SIZES = {
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1728 }
};

const SHARE_LOGO_SRC = "./assets/ibkr-logo.svg?v=3";
const SHARE_IMAGE_COLORS = ["#e31937", "#5f6368", "#a41124", "#2b2f35", "#f15b61", "#878d96"];
const PIE_COLORS = ["#3186f6", "#0b6b5d", "#b57936", "#7c6ee6", "#d85d5d", "#2aa6a1"];
const POSITION_PIE_COLORS = ["#3186f6", "#0b6b5d", "#b57936", "#7c6ee6", "#d85d5d", "#2aa6a1", "#69a64d", "#bd6aa8"];
const SHARE_IMAGE_FONT = 'Inter, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif';

let shareLogoImagePromise = null;

const state = {
  data: null,
  activeTab: "performance",
  error: "",
  search: "",
  sourceName: "",
  dailyMonth: "",
  autoSampleStarted: false,
  shareOpen: false,
  shareFormat: "landscape",
  language: localStorage.getItem("ibkr-analytics-language") === "en" ? "en" : "zh",
  theme: localStorage.getItem("ibkr-analytics-theme") === "dark" ? "dark" : "light"
};

applyTheme();
applyLanguage();
render();

function render() {
  if (!state.data) {
    renderUpload();
    return;
  }
  renderDashboard();
}

function renderUpload() {
  app.innerHTML = `
    <div class="app-shell">
      <header class="top-nav">
        <div class="top-nav-inner">
          ${renderBrand("IBKR Analytics Studio", t("activityStatement"))}
          <div class="top-actions">
            ${renderLanguageSwitch()}
            <button class="icon-button" id="themeToggle" type="button" title="${t("switchTheme")}" aria-label="${t("switchTheme")}">${icon(state.theme === "dark" ? "sun" : "moon")}</button>
          </div>
        </div>
      </header>
      <main class="app-main upload-layout">
        <section class="upload-hero">
          <p class="eyebrow">${t("uploadEyebrow")}</p>
          <h1>${t("uploadTitle")}</h1>
          <p>${t("uploadIntro")}</p>
        </section>
        <section class="privacy-banner" aria-label="${t("privacyLabel")}">
          <span class="dropzone-icon" aria-hidden="true">${icon("lock")}</span>
          <div>
            <strong>${t("localOnly")}</strong>
            <p>${t("privacyBody")}</p>
          </div>
        </section>
        ${state.error ? `<div class="error-banner">${escapeHtml(state.error)}</div>` : ""}
        <section class="upload-grid">
          <div class="upload-stack">
            <label class="dropzone" id="dropzone" for="fileInput">
              <input class="file-input" id="fileInput" type="file" accept=".csv,.txt,text/csv,text/plain" />
              <span class="dropzone-icon" aria-hidden="true">${icon("upload")}</span>
              <span>
                <h2>${t("dropTitle")}</h2>
                <p>${t("dropBody")}</p>
                <span class="button-row">
                  <span class="primary-button" id="chooseFileButton">${icon("upload")}${t("chooseFile")}</span>
                  <button class="secondary-button" id="sampleButton" type="button">${icon("database")}${t("loadSample")}</button>
                </span>
              </span>
            </label>
            <details class="paste-panel">
              <summary>
                <span class="button-row">${icon("paste")} ${t("pasteCsv")}</span>
                <span aria-hidden="true">⌄</span>
              </summary>
              <div class="paste-body">
                <textarea id="pasteInput" placeholder="Statement,Header,..."></textarea>
                <div class="button-row">
                  <button class="secondary-button" id="parseTextButton" type="button">${icon("chart")}${t("parseText")}</button>
                </div>
              </div>
            </details>
          </div>
          <aside class="side-stack">
            <section class="info-card">
              <h3>${icon("help")}${t("exportGuide")}</h3>
              <ol>
                <li>${t("guideStep1")}</li>
                <li>${t("guideStep2")}</li>
                <li>${t("guideStep3")}</li>
                <li>${t("guideStep4")}</li>
                <li>${t("guideStep5")}</li>
              </ol>
            </section>
            <section class="info-card">
              <h3>${icon("database")}${t("supportedSections")}</h3>
              <div class="tag-list">
                ${["Net Asset Value", "Open Positions", "Trades", "P/L Summary", "Interest", "Fees", "Forex P/L", "SYEP", "MTM Performance"].map((label) => `<span class="tag">${label}</span>`).join("")}
              </div>
            </section>
          </aside>
        </section>
      </main>
      ${renderFooter()}
    </div>
  `;

  bindThemeToggle();
  bindLanguageSwitch();
  bindUploadEvents();
  maybeAutoLoadSample();
}

function renderDashboard() {
  const active = tabs.find((tab) => tab.id === state.activeTab) || tabs[0];
  app.innerHTML = `
    <div class="dashboard-shell">
      ${renderSideNav()}
      <main class="dashboard-main">
        ${renderMobileBar()}
        <header class="app-bar">
          <div class="app-bar-title">${t(active.titleKey)}</div>
          <div class="app-bar-actions">
            <label class="search-wrap">
              ${icon("search")}
              <input class="search-input" id="globalSearch" type="search" value="${escapeAttribute(state.search)}" placeholder="${t("searchPlaceholder")}" />
            </label>
            ${renderLanguageSwitch()}
            <button class="icon-button" id="themeToggle" type="button" title="${t("switchTheme")}" aria-label="${t("switchTheme")}">${icon(state.theme === "dark" ? "sun" : "moon")}</button>
          </div>
        </header>
        <section class="dashboard-content">
          ${renderActiveTab()}
        </section>
        ${state.shareOpen ? renderShareDialog() : ""}
      </main>
    </div>
  `;

  bindDashboardEvents();
  if (state.shareOpen) {
    requestAnimationFrame(renderShareImagePreview);
  }
}

function renderSideNav() {
  return `
    <aside class="side-nav">
      <div class="side-brand">
        ${renderBrand("IBKR Analytics", "Version 2.1")}
      </div>
      <nav class="side-nav-list" aria-label="${t("reportNav")}">
        ${tabs.map((tab) => renderNavButton(tab)).join("")}
      </nav>
      <div class="side-spacer"></div>
      <div class="side-nav-list">
        <button class="primary-button" id="exportJsonButton" type="button">${icon("download")}${t("exportJson")}</button>
        <button class="secondary-button" id="shareImageButton" type="button">${icon("share")}${t("shareImage")}</button>
        <button class="nav-button" type="button" disabled>${icon("shield")}${t("security")}</button>
        <button class="nav-button" type="button" disabled>${icon("settings")}${t("settings")}</button>
        <button class="secondary-button" id="resetButton" type="button">${icon("reset")}${t("replaceFile")}</button>
      </div>
    </aside>
  `;
}

function renderMobileBar() {
  return `
    <header class="mobile-bar">
      <div class="mobile-bar-main">
        ${renderBrand("IBKR Analytics", t("localReport"))}
        <div class="top-actions">
          ${renderLanguageSwitch()}
          <button class="icon-button" id="mobileExportButton" type="button" title="${t("exportJson")}" aria-label="${t("exportJson")}">${icon("download")}</button>
          <button class="icon-button" id="mobileShareButton" type="button" title="${t("shareImage")}" aria-label="${t("shareImage")}">${icon("share")}</button>
          <button class="icon-button" id="mobileThemeToggle" type="button" title="${t("switchTheme")}" aria-label="${t("switchTheme")}">${icon(state.theme === "dark" ? "sun" : "moon")}</button>
        </div>
      </div>
      <nav class="mobile-tabs" aria-label="${t("mobileReportNav")}">
        ${tabs.map((tab) => renderNavButton(tab)).join("")}
      </nav>
    </header>
  `;
}

function renderBrand(title, subtitle) {
  return `
    <a class="brand" href="./index.html" aria-label="${escapeAttribute(title)}">
      <span class="brand-mark" aria-hidden="true">
        <img src="./assets/ibkr-logo.svg?v=3" alt="" />
      </span>
      <span class="brand-copy">
        <span class="brand-title">${escapeHtml(title)}</span>
        <span class="brand-subtitle">${escapeHtml(subtitle)}</span>
      </span>
    </a>
  `;
}

function renderNavButton(tab) {
  const isActive = state.activeTab === tab.id ? " is-active" : "";
  return `<button class="nav-button tab-button${isActive}" type="button" data-tab="${tab.id}">${icon(tab.icon)}${t(tab.labelKey)}</button>`;
}

function renderLanguageSwitch() {
  return `
    <div class="language-toggle" role="group" aria-label="Language">
      <button class="language-option${state.language === "zh" ? " is-active" : ""}" type="button" data-language="zh">中</button>
      <button class="language-option${state.language === "en" ? " is-active" : ""}" type="button" data-language="en">EN</button>
    </div>
  `;
}

function renderShareDialog() {
  const size = SHARE_IMAGE_SIZES[state.shareFormat] || SHARE_IMAGE_SIZES.landscape;
  return `
    <div class="share-modal" role="dialog" aria-modal="true" aria-labelledby="shareDialogTitle">
      <button class="share-backdrop" type="button" data-share-close aria-label="${t("close")}"></button>
      <section class="share-panel">
        <header class="share-header">
          <div>
            <p class="eyebrow">Share Export</p>
            <h2 id="shareDialogTitle">${t("shareDialogTitle")}</h2>
          </div>
          <button class="icon-button" type="button" data-share-close aria-label="${t("close")}">${icon("close")}</button>
        </header>
        <div class="share-toolbar">
          <div class="segmented" role="group" aria-label="${t("shareSize")}">
            <button class="segment share-format${state.shareFormat === "landscape" ? " is-active" : ""}" type="button" data-share-format="landscape">${t("landscape")}</button>
            <button class="segment share-format${state.shareFormat === "portrait" ? " is-active" : ""}" type="button" data-share-format="portrait">${t("portrait")}</button>
          </div>
          <button class="primary-button" id="downloadShareImageButton" type="button">${icon("download")}${t("downloadPng")}</button>
        </div>
        <div class="share-preview">
          <canvas id="shareImageCanvas" width="${size.width}" height="${size.height}" aria-label="分享图预览"></canvas>
        </div>
      </section>
    </div>
  `;
}

function renderActiveTab() {
  if (state.activeTab === "positions") return renderPositions(state.data);
  if (state.activeTab === "daily") return renderDailyStats(state.data);
  if (state.activeTab === "data") return renderDataQuality(state.data);
  if (state.activeTab === "overview") return renderOverview(state.data);
  return renderPerformance(state.data);
}

function renderOverview(data) {
  const currency = data.baseCurrency || "USD";
  const totalPL = data.plSummary.total.total;
  const portfolioAllocation = buildPortfolioAllocation(data);
  return `
    <div class="content-stack">
      ${renderPageHeading(t("overviewHeading"), data, t("overviewSubtitle"))}
      <div class="grid-12">
        ${renderKpi("期末净值", formatMoney(data.nav.total, currency), renderDateRange(data), "span-3")}
        ${renderKpi("现金", formatMoney(data.nav.cash, currency), "Net Asset Value / Cash", "span-3")}
        ${renderKpi("总盈亏", formatMoney(totalPL, currency), "已实现 + 未实现", "span-3", totalPL)}
        ${renderKpi("时间加权收益", formatPercent(data.nav.rateOfReturn), "IBKR TWR", "span-3", data.nav.rateOfReturn)}
        ${renderKpi("交易订单", formatNumber(data.tradeSummary.orderCount), `${formatNumber(data.tradeSummary.stockOrders)} 股票 / ${formatNumber(data.tradeSummary.forexOrders)} 外汇`, "span-3")}
        ${renderKpi("当前持仓", formatNumber(data.positions.length), `${formatNumber(data.assetAllocation.length)} 个资产类别`, "span-3")}
        ${renderKpi("识别区块", formatNumber(Object.keys(data.sectionStats).length), "CSV sections", "span-3")}
        ${renderKpi("佣金费用", formatMoney(data.tradeSummary.totalCommissions, currency), "Trades summary", "span-3", -data.tradeSummary.totalCommissions)}
      </div>
      <div class="grid-12">
        <section class="dashboard-card span-6">
          <div class="card-header"><h2>资产配置</h2><span class="pill">${currency}</span></div>
          ${renderAllocation(portfolioAllocation, currency)}
        </section>
        <section class="dashboard-card span-6">
          <div class="card-header"><h2>币种敞口</h2><span class="pill">${currency}</span></div>
          ${renderAllocation(data.currencyExposure, currency)}
        </section>
        <section class="table-card span-7">
          <div class="table-header"><h2>NAV 变化</h2></div>
          ${renderSimpleTable(["项目", "金额"], data.navChange.map((row) => [row.label, signedMoney(row.value, currency)]), [false, true])}
        </section>
        <section class="dashboard-card span-5">
          <div class="card-header"><h2>资产配置占比</h2><span class="pill">${currency}</span></div>
          ${renderAllocationPie(portfolioAllocation, currency)}
        </section>
      </div>
    </div>
  `;
}

function renderPerformance(data) {
  const currency = data.baseCurrency || "USD";
  const pl = data.plSummary.total;

  return `
    <div class="content-stack">
      ${renderPageHeading(t("performanceHeading"), data, t("performanceSubtitle"))}
      <div class="grid-12">
        ${renderKpi("已实现盈亏", formatMoney(pl.realized, currency), "Realized P/L", "span-4 performance-kpi", pl.realized, {
          label: t("returnRate"),
          value: `${formatSignedPercent(safePercent(pl.realized, data.nav.total))} / NAV`,
          toneValue: pl.realized
        })}
        ${renderKpi("未实现盈亏", formatMoney(pl.unrealized, currency), "Unrealized P/L", "span-4 performance-kpi", pl.unrealized, {
          label: t("returnRate"),
          value: `${formatSignedPercent(safePercent(pl.unrealized, data.nav.total))} / NAV`,
          toneValue: pl.unrealized
        })}
        ${renderKpi("总盈亏", formatMoney(pl.total, currency), "Total P/L", "span-4 is-featured performance-kpi", pl.total, {
          label: t("returnRate"),
          value: `${formatSignedPercent(safePercent(pl.total, data.nav.total))} / NAV`,
          toneValue: pl.total
        })}
        <section class="dashboard-card span-6">
          <div class="card-header">
            <div>
              <h2>${t("plDistribution")}</h2>
              <p class="card-kicker">${t("plDistributionKicker")}</p>
            </div>
            <span class="pill">${currency}</span>
          </div>
          ${renderPlDistribution(data)}
        </section>
        <section class="table-card span-6">
          <div class="table-header"><h2>主要贡献者</h2><span class="pill">${formatNumber(data.tickerPL.length)} tickers</span></div>
          ${renderTopContributors(data, currency)}
        </section>
        <section class="dashboard-card chart-card span-12">
          <div class="card-header">
            <h2>月度收入与支出</h2>
            <span class="tag-list"><span class="pill">净额</span><span class="pill">费用</span></span>
          </div>
          ${renderMonthlyChart(data.monthlySummary, currency)}
        </section>
        <section class="table-card span-12">
          <div class="table-header"><h2>已实现交易排行</h2></div>
          ${renderRealizedTrades(data, currency)}
        </section>
      </div>
    </div>
  `;
}

function renderDailyStats(data) {
  const currency = data.baseCurrency || "USD";
  const rows = data.dailyTradeStats || [];
  const months = Array.from(new Set(rows.map((row) => row.month))).sort();
  const selectedMonth = months.includes(state.dailyMonth) ? state.dailyMonth : months.at(-1) || "";
  const monthRows = selectedMonth ? rows.filter((row) => row.month === selectedMonth) : [];
  const tradeRows = selectedMonth ? (data.tradeDetails || []).filter((row) => row.month === selectedMonth) : [];
  const totalTrades = monthRows.reduce((sum, row) => sum + row.tradeCount, 0);
  const totalGross = monthRows.reduce((sum, row) => sum + row.grossTradeValue, 0);
  const totalRealized = monthRows.reduce((sum, row) => sum + row.realizedPL, 0);
  const daysInMonth = selectedMonth ? getDaysInMonth(selectedMonth) : 0;
  const averageTrades = daysInMonth ? totalTrades / daysInMonth : 0;

  return `
    <div class="content-stack">
      ${renderPageHeading(t("dailyHeading"), data, t("dailySubtitle"))}
      <div class="daily-toolbar">
        <label class="month-select-label">
          <span>月份</span>
          <select class="month-select" id="dailyMonthSelect" ${months.length ? "" : "disabled"}>
            ${months.map((month) => `<option value="${escapeAttribute(month)}"${month === selectedMonth ? " selected" : ""}>${escapeHtml(formatMonthLabel(month))}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="grid-12">
        <section class="dashboard-card span-7 daily-calendar-card">
          <div class="card-header"><h2>盈亏日历</h2><span class="pill">${escapeHtml(selectedMonth || "-")}</span></div>
          ${renderProfitCalendar(monthRows, selectedMonth, currency)}
        </section>
        <section class="dashboard-card span-5 daily-trades-card">
          <div class="card-header"><h2>每日交易统计</h2><span class="pill">${formatNumber(totalTrades)} trades</span></div>
          ${renderDailyTradeChart(monthRows, selectedMonth)}
          <div class="daily-stat-grid">
            ${renderDailyStat("总交易笔数", formatNumber(totalTrades))}
            ${renderDailyStat("总成交额", formatMoney(totalGross, currency))}
            ${renderDailyStat("日均交易", formatNumber(averageTrades, 1))}
            ${renderDailyStat("已实现盈亏", signedMoney(totalRealized, currency), totalRealized)}
          </div>
        </section>
        <section class="table-card span-12">
          <div class="table-header"><h2>交易流水</h2><span class="pill">${formatNumber(tradeRows.length)} rows</span></div>
          ${renderDailyTradeTable(tradeRows, currency)}
        </section>
      </div>
    </div>
  `;
}

function renderPositions(data) {
  const currency = data.baseCurrency || "USD";
  const rows = data.positions.filter((position) => searchMatch([
    position.symbol,
    position.baseSymbol,
    position.assetCategory,
    position.currency,
    position.side
  ]));
  return `
    <div class="content-stack">
      ${renderPageHeading(t("positionsHeading"), data, t("positionsSubtitle"))}
      <div class="grid-12">
        <section class="dashboard-card span-4">
          <div class="card-header"><h2>持仓资产分布</h2><span class="pill">${formatNumber(rows.length)} rows</span></div>
          ${renderAllocation(summarizeVisiblePositions(rows, "assetCategory"), currency)}
        </section>
        <section class="dashboard-card span-4">
          <div class="card-header"><h2>方向</h2></div>
          ${renderAllocation(summarizeVisiblePositions(rows, "side"), currency)}
        </section>
        <section class="dashboard-card span-4">
          <div class="card-header"><h2>币种</h2></div>
          ${renderAllocation(summarizeVisiblePositions(rows, "currency"), currency)}
        </section>
        <section class="table-card span-12">
          <div class="table-header"><h2>Open Positions</h2><span class="pill">${formatNumber(rows.length)} / ${formatNumber(data.positions.length)}</span></div>
          ${rows.length ? renderPositionsTable(rows, currency) : renderEmpty("没有匹配的持仓。")}
        </section>
        <section class="dashboard-card span-12 position-chart-card">
          <div class="card-header">
            <div>
              <h2>持仓资产分布</h2>
              <p class="card-kicker">按标的市值统计</p>
            </div>
          </div>
          ${renderPositionAssetPie(rows, currency)}
        </section>
      </div>
    </div>
  `;
}

function renderDataQuality(data) {
  const sectionRows = Object.entries(data.sectionStats)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([section, count]) => [section, formatNumber(count)]);
  const rateRows = Object.entries(data.exchangeRates).map(([currency, rate]) => [currency, formatNumber(rate, 6)]);

  return `
    <div class="content-stack">
      ${renderPageHeading(t("dataHeading"), data, t("dataSubtitle"))}
      <div class="grid-12">
        <section class="table-card span-6">
          <div class="table-header"><h2>已解析 CSV 区块</h2><span class="pill">${formatNumber(sectionRows.length)}</span></div>
          ${renderSimpleTable(["区块", "行数"], sectionRows, [false, true])}
        </section>
        <section class="table-card span-6">
          <div class="table-header"><h2>基础货币换算</h2><span class="pill">${data.baseCurrency || "USD"}</span></div>
          ${renderSimpleTable(["币种", "汇率"], rateRows, [false, true])}
        </section>
        <section class="dashboard-card span-12">
          <div class="card-header"><h2>解析诊断</h2></div>
          ${renderWarnings(data.warnings)}
        </section>
      </div>
    </div>
  `;
}

function renderPageHeading(title, data, subtitle) {
  return `
    <div class="page-heading">
      <div class="page-title">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(renderDateRange(data))} · ${t("baseCurrency")}：${escapeHtml(data.baseCurrency || "USD")} · ${t("account")}：${escapeHtml(maskAccount(data.accountInfo.account))}</p>
        <p>${escapeHtml(subtitle)}</p>
      </div>
    </div>
  `;
}

function renderKpi(label, value, foot, className = "span-3", toneValue = null, sideMetric = null) {
  const toneClass = Number.isFinite(toneValue) && toneValue !== 0 ? (toneValue > 0 ? " positive" : " negative") : "";
  const sideToneClass = sideMetric && Number.isFinite(sideMetric.toneValue) && sideMetric.toneValue !== 0 ? ` ${valueClass(sideMetric.toneValue)}` : "";
  return `
    <section class="kpi-card ${className}">
      <div class="kpi-label">${escapeHtml(label)}</div>
      <div class="kpi-body">
        <div class="kpi-main">
          <div class="kpi-value${toneClass}">${escapeHtml(value)}</div>
          <div class="kpi-foot">${escapeHtml(foot || "")}</div>
        </div>
        ${sideMetric ? `
          <div class="kpi-side">
            <span>${escapeHtml(sideMetric.label || "")}</span>
            <strong class="${sideToneClass.trim()}">${escapeHtml(sideMetric.value || "")}</strong>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function renderPlDistribution(data) {
  const rows = [
    [t("stocks"), data.plSummary.stocks],
    [t("options"), data.plSummary.options],
    [t("forex"), data.plSummary.forex]
  ];
  const total = data.plSummary.total;
  const maxAbs = Math.max(
    ...rows.flatMap(([, value]) => [Math.abs(value.realized), Math.abs(value.unrealized), Math.abs(value.total)]),
    Math.abs(total.realized),
    Math.abs(total.unrealized),
    Math.abs(total.total),
    1
  );

  return `
    <div class="pl-distribution">
      <div class="pl-total-panel">
        <div>
          <span>${t("total")}</span>
          <strong class="${valueClass(total.total)}">${formatMoney(total.total, data.baseCurrency)}</strong>
        </div>
        <div class="pl-total-split">
          <span>${t("realized")} <b class="${valueClass(total.realized)}">${formatMoney(total.realized, data.baseCurrency)}</b></span>
          <span>${t("unrealized")} <b class="${valueClass(total.unrealized)}">${formatMoney(total.unrealized, data.baseCurrency)}</b></span>
        </div>
      </div>
      <div class="pl-category-grid">
        ${rows.map(([label, value]) => renderPlCategory(label, value, data.baseCurrency, maxAbs)).join("")}
      </div>
    </div>
  `;
}

function renderPlCategory(label, value, currency, maxAbs) {
  return `
    <div class="pl-category-card">
      <div class="pl-category-head">
        <span>${escapeHtml(label)}</span>
        <strong class="${valueClass(value.total)}">${formatMoney(value.total, currency)}</strong>
      </div>
      ${renderPlMetric(t("realized"), value.realized, currency, maxAbs)}
      ${renderPlMetric(t("unrealized"), value.unrealized, currency, maxAbs)}
    </div>
  `;
}

function renderPlMetric(label, value, currency, maxAbs) {
  const width = Math.max(3, Math.min(100, (Math.abs(value) / maxAbs) * 100));

  return `
    <div class="pl-metric">
      <div class="pl-metric-top">
        <span>${escapeHtml(label)}</span>
        <strong class="${valueClass(value)}">${formatMoney(value, currency)}</strong>
      </div>
      <div class="pl-metric-track" aria-hidden="true">
        <span class="pl-metric-fill ${value < 0 ? "is-negative" : "is-positive"}" style="width:${width}%"></span>
      </div>
    </div>
  `;
}

function renderTopContributors(data, currency) {
  const totalAbs = data.tickerPL.reduce((sum, row) => sum + Math.abs(row.realizedPL), 0) || 1;
  const rows = data.tickerPL
    .filter((row) => searchMatch([row.ticker]))
    .slice()
    .sort((a, b) => Math.abs(b.realizedPL) - Math.abs(a.realizedPL))
    .slice(0, 8)
    .map((row) => [
      `<strong>${escapeHtml(row.ticker)}</strong>`,
      `<span class="${valueClass(row.realizedPL)}">${signedMoney(row.realizedPL, currency)}</span>`,
      `${formatPercent((Math.abs(row.realizedPL) / totalAbs) * 100)}`
    ]);

  return rows.length ? renderSimpleTable(["代码", "总盈亏", "贡献百分比"], rows, [false, true, true], true) : renderEmpty("暂无 ticker 贡献数据。");
}

function renderRealizedTrades(data, currency) {
  const rows = (data.tradeSummary.topRealizedTrades || [])
    .filter((row) => searchMatch([row.symbol, row.category, row.currency]))
    .slice(0, 10)
    .map((row) => [
      formatDate(row.date),
      escapeHtml(row.symbol),
      escapeHtml(row.category),
      `<span class="${valueClass(row.realizedPL)}">${signedMoney(row.realizedPL, row.currency || currency)}</span>`
    ]);
  return rows.length ? renderSimpleTable(["日期", "代码", "类别", "已实现盈亏"], rows, [false, false, false, true], true) : renderEmpty("暂无已实现交易。");
}

function renderPositionsTable(rows, currency) {
  const tableRows = rows.map((row) => [
    `<strong>${escapeHtml(row.symbol || "-")}</strong>`,
    escapeHtml(row.assetCategory || "-"),
    sideLabel(row.side),
    formatNumber(row.quantity, 4),
    formatMoney(row.value, row.currency || currency),
    formatMoney(row.costBasis, row.currency || currency),
    `<span class="${valueClass(row.unrealizedPL)}">${signedMoney(row.unrealizedPL, row.currency || currency)}</span>`,
    escapeHtml(row.currency || currency)
  ]);
  return renderSimpleTable(["标的", "资产", "方向", "数量", "市值", "成本", "未实现", "币种"], tableRows, [false, false, false, true, true, true, true, false], true);
}

function buildPositionAssetAllocation(positions) {
  const map = new Map();

  for (const position of positions) {
    const value = Math.abs(position.value);
    if (!value) continue;

    const name = position.baseSymbol || position.symbol || "Other";
    map.set(name, (map.get(name) || 0) + value);
  }

  const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);
  if (!total) return [];

  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      value,
      weight: value / total
    }))
    .sort((a, b) => b.value - a.value);
}

function renderPositionAssetPie(positions, currency) {
  const rows = buildPositionAssetAllocation(positions);
  if (!rows.length) return renderEmpty("暂无持仓市值数据。");

  let cursor = 0;
  const gradient = rows
    .map((row, index) => {
      const start = cursor;
      const end = cursor + row.weight * 100;
      cursor = end;
      return `${POSITION_PIE_COLORS[index % POSITION_PIE_COLORS.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    })
    .join(", ");
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return `
    <div class="position-pie-layout">
      <div class="asset-pie" style="--position-pie-gradient:${gradient}" role="img" aria-label="持仓资产分布"></div>
      <div class="position-pie-legend">
        ${rows.map((row, index) => `
          <div class="position-pie-row">
            <span class="position-pie-label">
              <i style="background:${POSITION_PIE_COLORS[index % POSITION_PIE_COLORS.length]}"></i>
              ${escapeHtml(row.name)}
            </span>
            <span class="position-pie-value">
              <strong>${formatPercent(row.weight * 100)}</strong>
              <span>${formatMoney(row.value, currency)}</span>
            </span>
          </div>
        `).join("")}
        <div class="pie-total">${formatMoney(total, currency)}</div>
      </div>
    </div>
  `;
}

function renderProfitCalendar(rows, month, currency) {
  if (!month) return renderEmpty("暂无逐日交易数据。");

  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(month);
  const firstDay = new Date(year, monthNumber - 1, 1).getDay();
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const maxAbs = Math.max(1, ...rows.map((row) => Math.abs(row.realizedPL)));
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(`<div class="calendar-cell is-empty" aria-hidden="true"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const row = byDay.get(day);
    const value = row?.realizedPL || 0;
    const intensity = row ? Math.min(0.78, 0.16 + Math.abs(value) / maxAbs * 0.52) : 0;
    const tone = value > 0 ? "is-positive" : value < 0 ? "is-negative" : "";
    cells.push(`
      <div class="calendar-cell ${tone}" style="--heat-alpha:${intensity.toFixed(2)}" title="${escapeAttribute(`${month}-${String(day).padStart(2, "0")}: ${signedMoney(value, currency)} · ${formatNumber(row?.tradeCount || 0)} trades`)}">
        <span class="calendar-day">${day}</span>
        ${row ? `<strong class="${valueClass(value)}">${signedMoney(value, currency)}</strong>` : ""}
      </div>
    `);
  }

  while (cells.length % 7 !== 0) {
    cells.push(`<div class="calendar-cell is-empty" aria-hidden="true"></div>`);
  }

  return `
    <div class="calendar-weekdays">
      ${["日", "一", "二", "三", "四", "五", "六"].map((day) => `<span>${day}</span>`).join("")}
    </div>
    <div class="profit-calendar">
      ${cells.join("")}
    </div>
  `;
}

function renderDailyTradeChart(rows, month) {
  if (!month) return renderEmpty("暂无逐日交易数据。");
  const daysInMonth = getDaysInMonth(month);
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const maxCount = Math.max(1, ...rows.map((row) => row.tradeCount));
  const bars = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const row = byDay.get(day);
    const count = row?.tradeCount || 0;
    bars.push(`
      <div class="daily-bar-column" title="${escapeAttribute(`${month}-${String(day).padStart(2, "0")}: ${formatNumber(count)} trades`)}">
        <div class="daily-bar" style="height:${Math.max(count ? 8 : 2, count / maxCount * 150)}px"></div>
        <span>${String(day).padStart(2, "0")}</span>
      </div>
    `);
  }

  return `<div class="daily-trade-chart">${bars.join("")}</div>`;
}

function renderDailyStat(label, value, tone = null) {
  const className = typeof tone === "number" ? valueClass(tone) : "";
  return `
    <div class="daily-stat">
      <span>${escapeHtml(label)}</span>
      <strong class="${className}">${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderDailyTradeTable(rows, currency) {
  if (!rows.length) return renderEmpty("当前月份没有交易记录。");
  const tableRows = rows.map((row) => [
    formatDateTime(row.dateTime),
    `<strong>${escapeHtml(row.baseSymbol || row.symbol || "-")}</strong>`,
    sideBadge(row.side),
    escapeHtml(row.assetCategory || "-"),
    formatNumber(Math.abs(row.quantity), 4),
    formatMoney(row.price, row.currency || currency),
    formatMoney(row.grossValue, currency),
    formatMoney(row.commission, currency),
    `<span class="${valueClass(row.realizedPL)}">${signedMoney(row.realizedPL, currency)}</span>`
  ]);
  return renderSimpleTable(["成交时间", "股票代码", "方向", "资产", "数量", "成交价", "成交金额", "佣金", "已实现盈亏"], tableRows, [false, false, false, false, true, true, true, true, true], true);
}

function renderSimpleTable(headers, rows, numericColumns = [], allowHtml = false) {
  return `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>${headers.map((header, index) => `<th class="${numericColumns[index] ? "numeric" : ""}">${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${row.map((cell, index) => `<td class="${numericColumns[index] ? "numeric mono" : ""}">${allowHtml ? cell : escapeHtml(cell)}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAllocation(rows, currency) {
  if (!rows || !rows.length) return renderEmpty("暂无可展示的数据。");
  const max = Math.max(1, ...rows.map((row) => Math.abs(row.value)));
  return `
    <div class="allocation-grid">
      ${rows.slice(0, 8).map((row) => `
        <div class="allocation-row">
          <strong>${escapeHtml(displayGroup(row.name))}</strong>
          <div class="mini-track"><div class="mini-fill" style="width:${Math.max(2, Math.abs(row.value) / max * 100)}%"></div></div>
          <span class="numeric mono">${formatMoney(row.value, currency)} · ${formatPercent((row.weight || 0) * 100)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function buildPortfolioAllocation(data) {
  const rows = data.assetAllocation.map((row) => ({ ...row }));
  const cash = Math.max(0, data.nav.cash || 0);

  if (cash > 0) {
    rows.push({
      name: "Cash",
      value: cash,
      weight: 0
    });
  }

  const total = rows.reduce((sum, row) => sum + Math.abs(row.value), 0);
  if (!total) return rows;

  return rows
    .map((row) => ({
      ...row,
      value: Math.abs(row.value),
      weight: Math.abs(row.value) / total
    }))
    .sort((a, b) => b.value - a.value);
}

function renderAllocationPie(rows, currency) {
  if (!rows || !rows.length) return renderEmpty("暂无可展示的数据。");
  const sourceRows = rows.filter((row) => Math.abs(row.value) > 0);
  if (!sourceRows.length) return renderEmpty("暂无可展示的数据。");

  const total = sourceRows.reduce((sum, row) => sum + Math.abs(row.value), 0) || 1;
  const topRows = sourceRows.slice(0, 5);
  const otherValue = sourceRows.slice(5).reduce((sum, row) => sum + Math.abs(row.value), 0);
  const pieRows = otherValue > 0 ? [...topRows, { name: "其他", value: otherValue, weight: otherValue / total }] : topRows;
  let cursor = 0;
  const segments = pieRows.map((row, index) => {
    const percent = row.weight || Math.abs(row.value) / total;
    const start = cursor;
    const end = cursor + percent * 100;
    cursor = end;
    return `${PIE_COLORS[index % PIE_COLORS.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `
    <div class="allocation-pie">
      <div class="pie-visual" style="--pie-gradient:${segments.join(", ")};" aria-label="资产配置">
        <span>${formatPercent(100)}</span>
      </div>
      <div class="pie-legend">
        ${pieRows.map((row, index) => {
          const percent = (row.weight || Math.abs(row.value) / total) * 100;
          return `
            <div class="pie-legend-row">
              <span class="pie-label">
                <i style="background:${PIE_COLORS[index % PIE_COLORS.length]}"></i>
                ${escapeHtml(displayGroup(row.name))}
              </span>
              <span class="numeric mono">${formatPercent(percent)}</span>
            </div>
          `;
        }).join("")}
        <div class="pie-total">${formatMoney(total, currency)}</div>
      </div>
    </div>
  `;
}

function renderMonthlyChart(rows, currency) {
  if (!rows || !rows.length) return renderEmpty("暂无月度数据。");
  const max = Math.max(1, ...rows.map((row) => Math.max(Math.abs(row.net), row.commissions + row.fees)));
  return `
    <div class="monthly-chart" aria-label="月度净额图表">
      ${rows.slice(-12).map((row) => {
        const expense = Math.max(0, row.commissions + row.fees);
        return `
          <div class="chart-column" title="${escapeAttribute(`${row.month}: ${formatMoney(row.net, currency)}`)}">
            <div class="chart-bar" style="height:${Math.max(3, Math.abs(row.net) / max * 150)}px"></div>
            <div class="chart-bar expense" style="height:${Math.max(3, expense / max * 80)}px"></div>
            <div class="chart-label">${escapeHtml(shortMonth(row.month))}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderWarnings(warnings) {
  if (!warnings || !warnings.length) {
    return `<div class="empty-state"><span><strong>数据结构正常</strong><br />未发现关键区块缺失。</span></div>`;
  }
  return `<div class="warning-list">${warnings.map((warning) => `<div class="warning-item">${escapeHtml(displayWarning(warning))}</div>`).join("")}</div>`;
}

function renderEmpty(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-inner">
        <span>Github地址</span>
        <a href="https://github.com/G061206/ibkrstatement" target="_blank" rel="noopener noreferrer">G061206/ibkrstatement</a>
      </div>
    </footer>
  `;
}

function bindUploadEvents() {
  const fileInput = document.querySelector("#fileInput");
  const dropzone = document.querySelector("#dropzone");
  const chooseButton = document.querySelector("#chooseFileButton");
  const parseTextButton = document.querySelector("#parseTextButton");
  const sampleButton = document.querySelector("#sampleButton");

  chooseButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    fileInput?.click();
  });

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) readFile(file);
  });

  dropzone?.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });

  dropzone?.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-dragging");
  });

  dropzone?.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file) readFile(file);
  });

  parseTextButton?.addEventListener("click", () => {
    parseText(document.querySelector("#pasteInput")?.value || "", "pasted-report.csv");
  });

  sampleButton?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    loadSample();
  });
}

function bindDashboardEvents() {
  bindThemeToggle();
  bindLanguageSwitch();

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab || "overview";
      render();
    });
  });

  document.querySelector("#resetButton")?.addEventListener("click", resetReport);
  document.querySelector("#exportJsonButton")?.addEventListener("click", () => downloadJson(state.data));
  document.querySelector("#mobileExportButton")?.addEventListener("click", () => downloadJson(state.data));
  document.querySelector("#shareImageButton")?.addEventListener("click", openShareDialog);
  document.querySelector("#mobileShareButton")?.addEventListener("click", openShareDialog);
  document.querySelector("#mobileThemeToggle")?.addEventListener("click", toggleTheme);

  document.querySelectorAll("[data-share-close]").forEach((button) => {
    button.addEventListener("click", closeShareDialog);
  });

  document.querySelectorAll("[data-share-format]").forEach((button) => {
    button.addEventListener("click", () => {
      state.shareFormat = button.dataset.shareFormat || "landscape";
      renderDashboard();
    });
  });

  document.querySelector("#dailyMonthSelect")?.addEventListener("change", (event) => {
    state.dailyMonth = event.currentTarget.value || "";
    renderDashboard();
  });

  document.querySelector("#downloadShareImageButton")?.addEventListener("click", downloadShareImage);

  const searchInput = document.querySelector("#globalSearch");
  searchInput?.addEventListener("input", () => {
    state.search = searchInput.value;
    render();
    const nextSearch = document.querySelector("#globalSearch");
    nextSearch?.focus();
    nextSearch?.setSelectionRange(nextSearch.value.length, nextSearch.value.length);
  });
}

function bindThemeToggle() {
  document.querySelector("#themeToggle")?.addEventListener("click", toggleTheme);
}

function bindLanguageSwitch() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.language === "en" ? "en" : "zh";
      if (state.language === nextLanguage) return;
      state.language = nextLanguage;
      localStorage.setItem("ibkr-analytics-language", state.language);
      applyLanguage();
      render();
    });
  });
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("ibkr-analytics-theme", state.theme);
  applyTheme();
  render();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function applyLanguage() {
  document.documentElement.lang = state.language === "en" ? "en" : "zh-CN";
}

function t(key) {
  return copy[state.language]?.[key] || copy.zh[key] || key;
}

async function readFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    const decoded = decodeReportFile(buffer);
    parseText(decoded.text, file.name);
  } catch (error) {
    state.error = "读取文件失败，请重新选择报表。";
    renderUpload();
  }
}

async function loadSample() {
  try {
    const response = await fetch("./samples/ibkr-sample-demo.csv?v=2.1.1");
    if (!response.ok) throw new Error("sample unavailable");
    parseText(await response.text(), "ibkr-sample-demo.csv");
  } catch (error) {
    state.error = "示例文件读取失败，请确认通过本地服务打开项目。";
    renderUpload();
  }
}

function maybeAutoLoadSample() {
  if (state.autoSampleStarted || state.data) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("sample") !== "1") return;
  state.autoSampleStarted = true;
  loadSample();
}

function parseText(text, sourceName) {
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    state.error = "没有可解析的内容。";
    renderUpload();
    return;
  }

  if (isChineseIbkrReport(cleanText)) {
    state.error = "检测到这份报表可能是中文导出。当前解析器主要支持英文 IBKR Activity Statement CSV，请将 Language 设置为 English 后重新导出。";
    renderUpload();
    return;
  }

  try {
    const parsed = parseIbkrReport(cleanText);
    if (!Object.keys(parsed.sectionStats).length) {
      throw new Error("No recognizable sections");
    }
    state.data = parsed;
    state.sourceName = sourceName || "";
    state.search = "";
    state.error = "";
    state.activeTab = "performance";
    state.shareOpen = new URLSearchParams(window.location.search).get("share") === "1";
    renderDashboard();
  } catch (error) {
    state.error = "解析失败。请确认文件是 IBKR Activity Statement CSV/TXT，且包含 Header/Data 结构。";
    renderUpload();
  }
}

function resetReport() {
  state.data = null;
  state.error = "";
  state.search = "";
  state.sourceName = "";
  renderUpload();
}

function downloadJson(data) {
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ibkr-analytics-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function openShareDialog() {
  state.shareOpen = true;
  renderDashboard();
}

function closeShareDialog() {
  state.shareOpen = false;
  renderDashboard();
}

async function renderShareImagePreview() {
  const canvas = document.querySelector("#shareImageCanvas");
  if (!canvas || !state.data) return;
  await drawShareImage(canvas, state.data, state.shareFormat);
}

async function downloadShareImage() {
  if (!state.data) return;
  const canvas = document.createElement("canvas");
  await drawShareImage(canvas, state.data, state.shareFormat);
  const account = (state.data.accountInfo.account || "account").replace(/[^\w-]+/g, "-");
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ibkr-share-${account}-${state.shareFormat}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function drawShareImageDraft(canvas, data, format) {
  const size = SHARE_IMAGE_SIZES[format] || SHARE_IMAGE_SIZES.landscape;
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  const theme = shareTheme();
  const model = buildShareModel(data);

  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size.width, size.height);

  if (format === "portrait") {
    drawSharePortrait(ctx, model, theme, size.width, size.height);
  } else {
    drawShareLandscape(ctx, model, theme, size.width, size.height);
  }
}

function buildShareModel(data) {
  const currency = data.baseCurrency || "USD";
  const topTickers = data.tickerPL
    .slice()
    .sort((a, b) => Math.abs(b.realizedPL) - Math.abs(a.realizedPL))
    .slice(0, 6);

  return {
    currency,
    account: maskAccount(data.accountInfo.account),
    period: renderDateRange(data),
    nav: data.nav.total,
    cash: data.nav.cash,
    totalPl: data.plSummary.total.total,
    realizedPl: data.plSummary.total.realized,
    unrealizedPl: data.plSummary.total.unrealized,
    twr: data.nav.rateOfReturn,
    positions: data.positions.length,
    sections: Object.keys(data.sectionStats).length,
    allocation: data.assetAllocation.slice(0, 4),
    monthly: data.monthlySummary.slice(-6),
    topTickers,
    generatedDate: new Intl.DateTimeFormat(numberLocale(), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date())
  };
}

function drawShareLandscape(ctx, model, theme, width, height) {
  drawShareBrand(ctx, theme, 54, 44);
  drawShareText(ctx, "IBKR Portfolio Insight", 54, 116, 34, 900, theme.ink, { maxWidth: 560 });
  drawShareText(ctx, "Local-only Activity Statement analytics", 54, 160, 16, 600, theme.muted, { maxWidth: 560 });
  drawSharePill(ctx, model.account, 54, 194, theme);
  drawSharePill(ctx, model.period, 180, 194, theme, { width: 310 });
  drawSharePill(ctx, `${model.currency} Base`, 508, 194, theme, { accent: true, width: 118 });

  drawShareReturn(ctx, model, theme, width - 390, 76, 330);
  drawShareKpi(ctx, "Ending NAV", formatMoney(model.nav, model.currency), theme, 54, 252, 254, 100);
  drawShareKpi(ctx, "Total P/L", signedMoney(model.totalPl, model.currency), theme, 324, 252, 254, 100, model.totalPl);
  drawShareKpi(ctx, "Unrealized", signedMoney(model.unrealizedPl, model.currency), theme, 594, 252, 254, 100, model.unrealizedPl);
  drawShareKpi(ctx, "Positions", formatNumber(model.positions), theme, 864, 252, 254, 100);

  drawShareAllocation(ctx, model, theme, 54, 388, 330, 198);
  drawShareMonthly(ctx, model, theme, 408, 388, 350, 198);
  drawShareTickers(ctx, model, theme, 782, 388, 364, 198);
  drawShareFooter(ctx, model, theme, 54, height - 42, width - 108);
}

function drawSharePortrait(ctx, model, theme, width, height) {
  drawShareBrand(ctx, theme, 64, 58);
  drawShareText(ctx, "IBKR Portfolio Insight", 64, 146, 44, 900, theme.ink, { maxWidth: 680 });
  drawShareText(ctx, "Local-only Activity Statement analytics", 64, 204, 22, 600, theme.muted, { maxWidth: 640 });
  drawSharePill(ctx, model.account, 64, 252, theme, { scale: 1.18, width: 150 });
  drawSharePill(ctx, model.period, 232, 252, theme, { scale: 1.18, width: 430 });
  drawShareReturn(ctx, model, theme, 690, 242, 320, { large: true });

  drawShareKpi(ctx, "Ending NAV", formatMoney(model.nav, model.currency), theme, 64, 360, 452, 130, model.nav, { scale: 1.18 });
  drawShareKpi(ctx, "Total P/L", signedMoney(model.totalPl, model.currency), theme, 564, 360, 452, 130, model.totalPl, { scale: 1.18 });
  drawShareKpi(ctx, "Realized", signedMoney(model.realizedPl, model.currency), theme, 64, 518, 452, 130, model.realizedPl, { scale: 1.18 });
  drawShareKpi(ctx, "Unrealized", signedMoney(model.unrealizedPl, model.currency), theme, 564, 518, 452, 130, model.unrealizedPl, { scale: 1.18 });

  drawShareAllocation(ctx, model, theme, 64, 704, 952, 230, { scale: 1.12 });
  drawShareMonthly(ctx, model, theme, 64, 976, 952, 190, { scale: 1.12 });
  drawShareTickers(ctx, model, theme, 64, 1208, 952, 92, { compact: true, scale: 1.12 });
  drawShareFooter(ctx, model, theme, 64, height - 54, width - 128, { scale: 1.15 });
}

function drawShareBrand(ctx, theme, x, y) {
  drawShareRoundRect(ctx, x, y, 48, 48, 7, theme.primary);
  drawShareText(ctx, "IB", x + 13, y + 12, 18, 900, "#ffffff");
  drawShareText(ctx, "IBKR Analytics Studio", x + 64, y + 4, 18, 900, theme.ink);
  drawShareText(ctx, "Private browser-side parser", x + 64, y + 29, 13, 700, theme.muted);
}

function drawShareReturn(ctx, model, theme, x, y, width, options = {}) {
  const size = options.large ? 54 : 46;
  const value = formatSignedPercent(model.twr);
  drawShareText(ctx, "Time Weighted Return", x, y, 13, 800, theme.muted, { align: "right", maxWidth: width });
  drawShareText(ctx, value, x + width, y + 20, size, 900, shareValueColor(model.twr, theme), { align: "right", maxWidth: width });
}

function drawShareKpi(ctx, label, value, theme, x, y, width, height, tone = 0, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, label, x + 18 * scale, y + 16 * scale, 12 * scale, 900, theme.muted, { maxWidth: width - 36 * scale });
  drawShareText(ctx, value, x + 18 * scale, y + 43 * scale, 27 * scale, 900, shareValueColor(tone, theme), { maxWidth: width - 36 * scale });
}

function drawShareAllocation(ctx, model, theme, x, y, width, height, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, "Asset Allocation", x + 20 * scale, y + 16 * scale, 14 * scale, 900, theme.muted);
  const rows = model.allocation.length ? model.allocation : [{ name: "No positions", value: 0, weight: 0 }];
  rows.slice(0, 4).forEach((row, index) => {
    const rowY = y + 54 * scale + index * 34 * scale;
    drawShareText(ctx, displayGroup(row.name), x + 20 * scale, rowY, 14 * scale, 800, theme.ink, { maxWidth: width * 0.45 });
    ctx.fillStyle = theme.surfaceMid;
    ctx.fillRect(x + width * 0.48, rowY + 5 * scale, width * 0.31, 7 * scale);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(x + width * 0.48, rowY + 5 * scale, Math.max(3, width * 0.31 * (row.weight || 0)), 7 * scale);
    drawShareText(ctx, formatPercent((row.weight || 0) * 100), x + width - 20 * scale, rowY, 13 * scale, 800, theme.muted, { align: "right" });
  });
}

function drawShareMonthly(ctx, model, theme, x, y, width, height, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, "Monthly Net", x + 20 * scale, y + 16 * scale, 14 * scale, 900, theme.muted);
  const rows = model.monthly.length ? model.monthly : [];
  if (!rows.length) {
    drawShareText(ctx, "No monthly data", x + 20 * scale, y + 62 * scale, 16 * scale, 700, theme.muted);
    return;
  }
  const max = Math.max(1, ...rows.map((row) => Math.abs(row.net)));
  const chartX = x + 22 * scale;
  const chartY = y + 64 * scale;
  const chartH = height - 104 * scale;
  const gap = 12 * scale;
  const barW = (width - 44 * scale - gap * (rows.length - 1)) / rows.length;
  rows.forEach((row, index) => {
    const barH = Math.max(4, Math.abs(row.net) / max * chartH);
    const barX = chartX + index * (barW + gap);
    ctx.fillStyle = row.net >= 0 ? theme.primary : theme.negative;
    ctx.fillRect(barX, chartY + chartH - barH, barW, barH);
    drawShareText(ctx, shortMonth(row.month), barX + barW / 2, chartY + chartH + 10 * scale, 11 * scale, 800, theme.muted, { align: "center" });
  });
}

function drawShareTickers(ctx, model, theme, x, y, width, height, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, "Top Contributors", x + 20 * scale, y + 16 * scale, 14 * scale, 900, theme.muted);
  const rows = model.topTickers.slice(0, options.compact ? 3 : 5);
  rows.forEach((row, index) => {
    const rowY = y + 52 * scale + index * 27 * scale;
    drawShareText(ctx, row.ticker, x + 20 * scale, rowY, 14 * scale, 900, theme.ink, { maxWidth: width * 0.4 });
    drawShareText(ctx, signedMoney(row.realizedPL, model.currency), x + width - 20 * scale, rowY, 14 * scale, 900, shareValueColor(row.realizedPL, theme), { align: "right", maxWidth: width * 0.55 });
  });
}

function drawShareFooter(ctx, model, theme, x, y, width, options = {}) {
  const scale = options.scale || 1;
  drawShareText(ctx, "Local-only report · No statement data uploaded", x, y, 13 * scale, 800, theme.muted);
  drawShareText(ctx, `Generated ${model.generatedDate}`, x + width, y, 13 * scale, 800, theme.muted, { align: "right" });
}

function drawSharePanel(ctx, x, y, width, height, theme) {
  drawShareRoundRect(ctx, x, y, width, height, 10, theme.surface);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1;
  drawShareRoundedPath(ctx, x, y, width, height, 10);
  ctx.stroke();
}

function drawSharePill(ctx, text, x, y, theme, options = {}) {
  const scale = options.scale || 1;
  const width = options.width || Math.max(104 * scale, ctx.measureText(String(text)).width + 34 * scale);
  drawShareRoundRect(ctx, x, y, width, 32 * scale, 16 * scale, options.accent ? theme.accentSoft : theme.surfaceMid);
  drawShareText(ctx, text, x + 16 * scale, y + 8 * scale, 12 * scale, 900, options.accent ? theme.accent : theme.muted, { maxWidth: width - 32 * scale });
  return width;
}

function drawShareText(ctx, text, x, y, size, weight, color, options = {}) {
  ctx.font = `${weight} ${size}px Inter, Segoe UI, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = "top";
  const value = fitCanvasText(ctx, String(text ?? ""), options.maxWidth || Infinity);
  ctx.fillText(value, x, y);
}

function fitCanvasText(ctx, text, maxWidth) {
  if (!Number.isFinite(maxWidth) || ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}...`;
}

function drawShareRoundRect(ctx, x, y, width, height, radius, fill) {
  drawShareRoundedPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawShareRoundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shareTheme() {
  if (state.theme === "dark") {
    return {
      bg: "#111827",
      surface: "#172033",
      surfaceMid: "#24344d",
      ink: "#edf3ff",
      muted: "#b8c4d6",
      line: "#41536f",
      primary: "#f8fafc",
      accent: "#ff5b7c",
      accentSoft: "#3c1c27",
      positive: "#4ade80",
      negative: "#fb7185"
    };
  }
  return {
    bg: "#f8f9ff",
    surface: "#ffffff",
    surfaceMid: "#eef4ff",
    ink: "#0b1c30",
    muted: "#45464d",
    line: "#d7dce6",
    primary: "#0f172a",
    accent: "#b80938",
    accentSoft: "#fff0f3",
    positive: "#057a55",
    negative: "#c92020"
  };
}

function shareValueColor(value, theme) {
  if (value > 0) return theme.positive;
  if (value < 0) return theme.negative;
  return theme.ink;
}

async function drawShareImage(canvas, data, format) {
  const size = SHARE_IMAGE_SIZES[format] || SHARE_IMAGE_SIZES.landscape;
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const theme = legacyShareTheme();
  const model = buildLegacyShareModel(data);
  const logoImage = await loadShareLogoImage();

  drawLegacyShareBackground(ctx, canvas.width, canvas.height, theme);

  if (format === "portrait") {
    drawLegacyPortraitShareImage(ctx, model, theme, logoImage);
  } else {
    drawLegacyLandscapeShareImage(ctx, model, theme, logoImage);
  }
}

function loadShareLogoImage() {
  if (shareLogoImagePromise) return shareLogoImagePromise;

  shareLogoImagePromise = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = SHARE_LOGO_SRC;
  });

  return shareLogoImagePromise;
}

function legacyShareTheme() {
  return {
    bg: "#08090b",
    panel: "#111317",
    panelSoft: "#181b20",
    ink: "#f7f7f4",
    muted: "#b7bcc4",
    faint: "#747b86",
    line: "#282c33",
    lineStrong: "#3d424c",
    brand: "#e31937",
    brandStrong: "#ff304b",
    brandSoft: "#2a0d14",
    positive: "#36d399",
    negative: "#ff7a83",
    shadow: "rgba(0,0,0,0.48)",
    grid: "rgba(255,255,255,0.045)"
  };
}

function buildLegacyShareModel(data) {
  const totalPl = data.plSummary.total;
  return {
    name: data.accountInfo.name || "账户视图",
    account: data.accountInfo.account ? maskAccount(data.accountInfo.account) : "未识别账户",
    period: data.accountInfo.period || renderDateRange(data),
    currency: data.baseCurrency || "USD",
    generatedDate: new Intl.DateTimeFormat(numberLocale(), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date()),
    nav: data.nav.total,
    cash: data.nav.cash,
    totalPl: totalPl.total,
    realizedPl: totalPl.realized,
    unrealizedPl: totalPl.unrealized,
    twr: data.nav.rateOfReturn,
    positions: data.positions.length,
    sections: Object.keys(data.sectionStats).length,
    allocation: data.assetAllocation || [],
    monthlyRows: data.monthlySummary.slice(-6),
    tickerRows: data.tickerPL.slice(0, 5)
  };
}

function drawLegacyLandscapeShareImage(ctx, model, theme, logoImage) {
  drawLegacyShareBrand(ctx, theme, logoImage, 60, 44, { logoSize: 64, logoY: 40, titleOffsetX: 84, titleOffsetY: 6 });
  drawLegacyShareTopReturn(ctx, model, theme, 650, 84, 330, { size: 82 });
  drawLegacyShareText(ctx, model.name, 60, 124, {
    size: 44,
    weight: 820,
    color: theme.ink,
    maxWidth: 650
  });

  let pillX = 60;
  pillX += drawLegacySharePill(ctx, model.account, pillX, 176, theme) + 10;
  pillX += drawLegacySharePill(ctx, model.period, pillX, 176, theme) + 10;
  drawLegacySharePill(ctx, `${model.currency} Base`, pillX, 176, theme, { tone: "brand" });

  drawLegacyShareHero(ctx, 60, 222, 440, 176, model, theme, { valueOffsetY: 62, valueScale: 0.92 });
  drawLegacyShareMetric(ctx, 520, 222, 230, 80, "总盈亏", formatMoney(model.totalPl, model.currency), model.totalPl, theme);
  drawLegacyShareMetric(ctx, 520, 318, 230, 80, "持仓数", formatNumber(model.positions), model.positions, theme);
  drawLegacyShareAllocation(ctx, 770, 222, 370, 176, model, theme, { compact: true });
  drawLegacyShareMonthlyTrend(ctx, 60, 422, 530, 146, model, theme, { compact: true });
  drawLegacyShareTickerList(ctx, 610, 422, 530, 146, model, theme, { rowHeight: 26 });
  drawLegacyShareFooter(ctx, model, 60, 590, 1080, theme);
}

function drawLegacyPortraitShareImage(ctx, model, theme, logoImage) {
  drawLegacyShareBrand(ctx, theme, logoImage, 70, 92);
  drawLegacyShareText(ctx, model.name, 70, 174, {
    size: 74,
    weight: 830,
    color: theme.ink,
    maxWidth: 640
  });
  drawLegacyShareTopReturn(ctx, model, theme, 505, 270, 490);

  drawLegacySharePill(ctx, model.account, 70, 288, theme, { scale: 1.18 });
  drawLegacySharePill(ctx, model.period, 70, 346, theme, { scale: 1.18 });

  drawLegacyShareHero(ctx, 70, 435, 940, 220, model, theme, { scale: 1.28 });
  drawLegacyShareMetric(ctx, 70, 685, 455, 112, "总盈亏", formatMoney(model.totalPl, model.currency), model.totalPl, theme, { scale: 1.12 });
  drawLegacyShareMetric(ctx, 555, 685, 455, 112, "未实现盈亏", formatMoney(model.unrealizedPl, model.currency), model.unrealizedPl, theme, { scale: 1.12 });
  drawLegacyShareMetric(ctx, 70, 820, 455, 112, "已实现盈亏", formatMoney(model.realizedPl, model.currency), model.realizedPl, theme, { scale: 1.12 });
  drawLegacyShareMetric(ctx, 555, 820, 455, 112, "持仓数", formatNumber(model.positions), model.positions, theme, { scale: 1.12 });
  drawLegacyShareAllocation(ctx, 70, 970, 940, 285, model, theme, { scale: 1.18 });
  drawLegacyShareTickerList(ctx, 70, 1295, 940, 350, model, theme, { rowHeight: 50, scale: 1.18 });
  drawLegacyShareFooter(ctx, model, 70, 1684, 940, theme, { scale: 1.12 });
}

function drawLegacyShareBackground(ctx, width, height, theme) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 72) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = theme.brandSoft;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(width - 300, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, 215);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.brand;
  ctx.globalAlpha = 0.78;
  ctx.beginPath();
  ctx.moveTo(width - 180, 0);
  ctx.lineTo(width - 118, 0);
  ctx.lineTo(width, 118);
  ctx.lineTo(width, 180);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLegacyShareBrand(ctx, theme, logoImage, x, y, options = {}) {
  const logoSize = options.logoSize || 82;
  const logoY = options.logoY ?? y - 16;
  const titleOffsetX = options.titleOffsetX || 102;
  const titleOffsetY = options.titleOffsetY ?? 8;
  drawLegacyShareLogoMark(ctx, logoImage, x, logoY, logoSize, theme);
  drawLegacyShareText(ctx, "IBKR Report Studio", x + titleOffsetX, y + titleOffsetY, {
    size: 24,
    weight: 820,
    color: theme.ink
  });
}

function drawLegacyShareHero(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  drawLegacySharePanel(ctx, x, y, width, height, theme);
  drawLegacyShareText(ctx, "期末净值", x + 28, y + 26, {
    size: 20 * scale,
    weight: 740,
    color: theme.muted,
    maxWidth: width - 56
  });
  const valueY = y + (options.valueOffsetY ?? 78);
  drawLegacyShareText(ctx, formatMoney(model.nav, model.currency), x + 28, valueY, {
    size: 50 * scale * (options.valueScale || 1),
    weight: 850,
    color: theme.ink,
    maxWidth: width - 56
  });
  drawLegacyShareText(ctx, `现金 ${formatMoney(model.cash, model.currency)}`, x + 28, y + height - 54, {
    size: 18 * scale,
    weight: 700,
    color: theme.muted,
    maxWidth: width - 56
  });
  drawLegacyShareText(ctx, `sections ${formatNumber(model.sections)}`, x + width - 28, y + height - 54, {
    size: 18 * scale,
    weight: 700,
    color: theme.faint,
    align: "right"
  });
}

function drawLegacyShareTopReturn(ctx, model, theme, x, y, width, options = {}) {
  const size = options.size || 126;
  drawLegacyShareText(ctx, formatSignedPercent(model.twr), x + width, y + 8, {
    size,
    weight: 860,
    color: legacyShareValueColor(model.twr, theme),
    align: "right"
  });
}

function drawLegacyShareMetric(ctx, x, y, width, height, label, value, tone, theme, options = {}) {
  const scale = options.scale || 1;
  drawLegacySharePanel(ctx, x, y, width, height, theme, { soft: true });
  drawLegacyShareText(ctx, label, x + 22, y + 20, {
    size: 17 * scale,
    weight: 740,
    color: theme.muted,
    maxWidth: width - 44
  });
  drawLegacyShareText(ctx, value, x + 22, y + 50 * scale, {
    size: 26 * scale,
    weight: 840,
    color: legacyShareValueColor(tone, theme),
    maxWidth: width - 44
  });
}

function drawLegacyShareAllocation(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.allocation.slice(0, width > 500 ? 5 : 4);
  drawLegacySharePanel(ctx, x, y, width, height, theme);
  drawLegacyShareText(ctx, "资产配置", x + 24, y + 22, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawLegacyShareText(ctx, "暂无持仓市值", x + 24, y + 70, {
      size: 18 * scale,
      weight: 650,
      color: theme.muted,
      maxWidth: width - 48
    });
    return;
  }

  const donutRadius = Math.min(width > 500 ? 94 : 58, height * 0.28);
  const donutX = x + (width > 500 ? 150 : 88);
  const donutY = y + height / 2 + 18;
  const lineWidth = Math.max(16, donutRadius * 0.34);
  let start = -Math.PI / 2;

  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";
  for (const [index, row] of rows.entries()) {
    const end = start + Math.PI * 2 * row.weight;
    ctx.beginPath();
    ctx.strokeStyle = SHARE_IMAGE_COLORS[index % SHARE_IMAGE_COLORS.length];
    ctx.arc(donutX, donutY, donutRadius, start, end);
    ctx.stroke();
    start = end;
  }
  ctx.restore();

  drawLegacyShareText(ctx, "100%", donutX, donutY - 14 * scale, {
    size: 24 * scale,
    weight: 850,
    color: theme.ink,
    align: "center"
  });

  const legendX = x + (width > 500 ? 300 : 160);
  const legendY = y + 66;
  const legendGap = width > 500 ? 42 : 31;
  rows.forEach((row, index) => {
    const rowY = legendY + index * legendGap;
    ctx.fillStyle = SHARE_IMAGE_COLORS[index % SHARE_IMAGE_COLORS.length];
    drawLegacyRoundedPath(ctx, legendX, rowY + 2, 14 * scale, 14 * scale, 4);
    ctx.fill();
    drawLegacyShareText(ctx, displayGroup(row.name), legendX + 24 * scale, rowY, {
      size: 16 * scale,
      weight: 740,
      color: theme.ink,
      maxWidth: width - (legendX - x) - 92
    });
    drawLegacyShareText(ctx, formatPercent(row.weight * 100), x + width - 24, rowY, {
      size: 16 * scale,
      weight: 780,
      color: theme.muted,
      align: "right"
    });
  });
}

function drawLegacyShareTickerList(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.tickerRows.slice(0, Math.max(3, Math.floor((height - 58) / (28 * scale))));
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.realizedPL)), 1);

  drawLegacySharePanel(ctx, x, y, width, height, theme);
  drawLegacyShareText(ctx, "贡献排行", x + 24, y + 22, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawLegacyShareText(ctx, "暂无已平仓贡献", x + 24, y + 70, {
      size: 17 * scale,
      weight: 650,
      color: theme.muted,
      maxWidth: width - 48
    });
    return;
  }

  const rowHeight = options.rowHeight || 28 * scale;
  rows.forEach((row, index) => {
    const rowY = y + 62 + index * rowHeight;
    const amount = formatMoney(row.realizedPL, model.currency);
    drawLegacyShareText(ctx, String(index + 1).padStart(2, "0"), x + 24, rowY + 6 * scale, {
      size: 14 * scale,
      weight: 800,
      color: theme.faint
    });
    drawLegacyShareText(ctx, row.ticker, x + 58 * scale, rowY, {
      size: 17 * scale,
      weight: 820,
      color: theme.ink,
      maxWidth: width * 0.28
    });
    drawLegacyShareText(ctx, amount, x + width - 24, rowY, {
      size: 17 * scale,
      weight: 800,
      color: legacyShareValueColor(row.realizedPL, theme),
      align: "right",
      maxWidth: width * 0.36
    });

    const trackX = x + 58 * scale;
    const trackY = rowY + 20 * scale;
    const trackW = width - (trackX - x) - 24;
    ctx.fillStyle = theme.line;
    drawLegacyRoundedPath(ctx, trackX, trackY, trackW, 4 * scale, 6);
    ctx.fill();
    ctx.fillStyle = legacyShareValueColor(row.realizedPL, theme);
    drawLegacyRoundedPath(ctx, trackX, trackY, Math.max(6, trackW * (Math.abs(row.realizedPL) / maxAbs)), 4 * scale, 6);
    ctx.fill();
  });
}

function drawLegacyShareMonthlyTrend(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.monthlyRows;
  drawLegacySharePanel(ctx, x, y, width, height, theme);
  drawLegacyShareText(ctx, "月度趋势", x + 24, y + 20, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawLegacyShareText(ctx, "暂无月度数据", x + 24, y + 66, {
      size: 17 * scale,
      weight: 650,
      color: theme.muted,
      maxWidth: width - 48
    });
    return;
  }

  const chartX = x + 30;
  const chartY = y + 58;
  const chartW = width - 60;
  const chartH = height - 88;
  const baseline = chartY + chartH / 2;
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.net)), 1);
  const slot = chartW / rows.length;

  ctx.strokeStyle = theme.lineStrong;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartX, baseline);
  ctx.lineTo(chartX + chartW, baseline);
  ctx.stroke();

  rows.forEach((row, index) => {
    const barW = Math.max(18, slot * 0.52);
    const barH = Math.max(3, (Math.abs(row.net) / maxAbs) * (chartH / 2 - 8));
    const barX = chartX + slot * index + (slot - barW) / 2;
    const barY = row.net >= 0 ? baseline - barH : baseline;
    ctx.fillStyle = legacyShareValueColor(row.net, theme);
    drawLegacyRoundedPath(ctx, barX, barY, barW, barH, 6);
    ctx.fill();
    drawLegacyShareText(ctx, row.month.slice(5), barX + barW / 2, chartY + chartH + 8, {
      size: 13 * scale,
      weight: 740,
      color: theme.faint,
      align: "center"
    });
  });
}

function drawLegacyShareFooter(ctx, model, x, y, width, theme, options = {}) {
  const scale = options.scale || 1;
  drawLegacyShareText(ctx, "IBKR Activity Statement", x, y, {
    size: 17 * scale,
    weight: 720,
    color: theme.faint,
    maxWidth: width * 0.6
  });
  drawLegacyShareText(ctx, `生成于 ${model.generatedDate}`, x + width, y, {
    size: 17 * scale,
    weight: 720,
    color: theme.faint,
    align: "right"
  });
}

function drawLegacySharePanel(ctx, x, y, width, height, theme, options = {}) {
  ctx.save();
  if (options.shadow !== false) {
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
  }
  ctx.fillStyle = options.soft ? theme.panelSoft : theme.panel;
  drawLegacyRoundedPath(ctx, x, y, width, height, 20);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawLegacySharePill(ctx, text, x, y, theme, options = {}) {
  const scale = options.scale || 1;
  const size = 17 * scale;
  const isBrand = options.tone === "brand";
  ctx.save();
  ctx.font = `760 ${size}px ${SHARE_IMAGE_FONT}`;
  const width = Math.min(420 * scale, ctx.measureText(text).width + 30 * scale);
  ctx.fillStyle = isBrand ? theme.brandSoft : theme.panelSoft;
  drawLegacyRoundedPath(ctx, x, y, width, 34 * scale, 10);
  ctx.fill();
  ctx.strokeStyle = isBrand ? theme.brand : theme.lineStrong;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  drawLegacyShareText(ctx, text, x + 15 * scale, y + 8 * scale, {
    size,
    weight: 760,
    color: isBrand ? theme.brandStrong : theme.muted,
    maxWidth: width - 30 * scale
  });
  return width;
}

function drawLegacyShareLogoMark(ctx, logoImage, x, y, size, theme) {
  ctx.save();
  drawLegacyRoundedPath(ctx, x, y, size, size, size * 0.1);
  ctx.clip();

  if (logoImage) {
    ctx.drawImage(logoImage, x, y, size, size);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, size, size);
    drawLegacyShareText(ctx, "IB", x + size * 0.25, y + size * 0.3, {
      size: size * 0.34,
      weight: 900,
      color: theme.ink
    });
  }

  ctx.restore();
}

function drawLegacyShareText(ctx, text, x, y, options = {}) {
  const size = options.size || 18;
  const weight = options.weight || 650;
  ctx.save();
  ctx.font = `${weight} ${size}px ${SHARE_IMAGE_FONT}`;
  ctx.fillStyle = options.color || "#000000";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "top";
  const value = options.maxWidth ? legacyFitCanvasText(ctx, String(text ?? ""), options.maxWidth) : String(text ?? "");
  ctx.fillText(value, x, y);
  ctx.restore();
}

function legacyFitCanvasText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function drawLegacyRoundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function legacyShareValueColor(value, theme) {
  if (value > 0) return theme.positive;
  if (value < 0) return theme.negative;
  return theme.ink;
}

function summarizeVisiblePositions(rows, key) {
  const total = rows.reduce((sum, row) => sum + Math.abs(row.value), 0) || 1;
  const map = new Map();
  for (const row of rows) {
    const name = row[key] || "Unknown";
    map.set(name, (map.get(name) || 0) + Math.abs(row.value));
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value, weight: value / total }))
    .sort((a, b) => b.value - a.value);
}

function searchMatch(values) {
  const query = state.search.trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => String(value || "").toLowerCase().includes(query));
}

function renderDateRange(data) {
  if (data.accountInfo.period) return data.accountInfo.period;
  const first = formatDate(data.tradeSummary.firstTradeDate);
  const last = formatDate(data.tradeSummary.lastTradeDate);
  return first && last ? `${first} - ${last}` : "未识别周期";
}

function displayGroup(name) {
  const labels = {
    Stocks: "股票",
    "Equity and Index Options": "期权",
    Forex: "外汇",
    Cash: "现金",
    Long: "多头",
    Short: "空头"
  };
  return labels[name] || name || "Unknown";
}

function sideLabel(side) {
  if (side === "Long") return '<span class="pill positive">多头</span>';
  if (side === "Short") return '<span class="pill negative">空头</span>';
  return `<span class="pill">${escapeHtml(side || "-")}</span>`;
}

function sideBadge(side) {
  if (side === "Buy") return '<span class="pill positive">买入</span>';
  if (side === "Sell") return '<span class="pill negative">卖出</span>';
  return `<span class="pill">${escapeHtml(side || "-")}</span>`;
}

function displayWarning(warning) {
  const labels = {
    missingAccountInfo: "未找到 Account Information 区块。",
    missingNetAssetValue: "未找到 Net Asset Value 区块。",
    missingTrades: "未找到 Trades 区块。",
    missingPositions: "未找到 Open Positions 区块。",
    missingPlSummary: "未找到 Realized & Unrealized Performance Summary 区块。",
    sparseReport: "文件结构不像标准 IBKR Activity Statement CSV。"
  };
  return labels[warning] || warning;
}

function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${icons[name] || icons.analytics}</svg>`;
}

function valueClass(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function signedMoney(value, currency) {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = formatMoney(Math.abs(amount), currency);
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

function safePercent(value, denominator) {
  if (!Number.isFinite(value) || !Number.isFinite(denominator) || denominator === 0) return 0;
  return (value / Math.abs(denominator)) * 100;
}

function formatMoney(value, currency = "USD") {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(numberLocale(), {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `${currency} ${formatNumber(amount, 2)}`;
  }
}

function formatNumber(value, digits = 0) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(numberLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(amount);
}

function formatPercent(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${formatNumber(amount, 2)}%`;
}

function formatSignedPercent(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${amount > 0 ? "+" : ""}${formatPercent(amount)}`;
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

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(numberLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatMonthLabel(month) {
  if (!month) return "-";
  const [year, monthNumber] = String(month).split("-").map(Number);
  if (!year || !monthNumber) return month;
  return new Intl.DateTimeFormat(numberLocale(), {
    year: "numeric",
    month: "long"
  }).format(new Date(year, monthNumber - 1, 1));
}

function getDaysInMonth(month) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  if (!year || !monthNumber) return 0;
  return new Date(year, monthNumber, 0).getDate();
}

function shortMonth(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  return parts.length > 1 ? `${Number(parts[1])}月` : value;
}

function numberLocale() {
  return document.documentElement.lang === "en" ? "en-US" : "zh-CN";
}

function maskAccount(account) {
  if (!account) return t("unknownAccount");
  const text = String(account);
  return text.length <= 4 ? text : `${text.slice(0, 2)}••${text.slice(-3)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
