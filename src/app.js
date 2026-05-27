import { decodeReportFile } from "./encoding.js";
import { isChineseIbkrReport } from "./reportLanguage.js";
import { parseIbkrReport } from "./parser.js";

const app = document.querySelector("#app");
const resetButton = document.querySelector("#resetButton");
const themeToggle = document.querySelector("#themeToggle");
const resetLabel = document.querySelector("#resetLabel");
const languageSwitcher = document.querySelector("#languageSwitcher");

let currentData = null;
let activeTab = "overview";
let currentLanguage = localStorage.getItem("ibkr-report-language") || "zh";
let currentTheme = localStorage.getItem("ibkr-report-theme") === "dark" ? "dark" : "light";
let shareImageFormat = "landscape";
let shareLogoImagePromise = null;

const translations = {
  zh: {
    htmlLang: "zh-CN",
    privacy: "仅本地",
    themeToDark: "切换到暗色模式",
    themeToLight: "切换到浅色模式",
    reset: "重置",
    eyebrow: "IBKR Activity Statement",
    homeTitle: "IBKR报表解析",
    homeIntro: "上传 CSV 或 TXT 后直接生成账户视图，文件只在当前浏览器中处理。",
    previewAlt: "IBKR 报表仪表盘预览",
    chooseFile: "选择报表文件",
    pasteLabel: "粘贴 CSV 内容",
    noFile: "尚未选择文件",
    parse: "解析",
    guideTitle: "如何获取报表",
    guideSubtitle: "从 IBKR Client Portal 导出 Activity Statement CSV",
    guideNote: "如果使用 Flex Queries，请选择 CSV 或 Text 格式，并确保包含 Net Asset Value、Open Positions、Trades、Realized & Unrealized Performance Summary 等区块。",
    guideSource: "IBKR 官方说明",
    openSource: "开源",
    guideSteps: [
      "登录 IBKR Client Portal。",
      "进入顶部菜单 Performance & Reports，打开 Statements。",
      "在默认报表或 Activity Statement 旁点击 Run 按钮。",
      "选择账户、日期范围、Format = CSV，语言按需要选择。",
      "生成并下载报表文件，然后回到这里上传或粘贴 CSV 内容。"
    ],
    fileReadError: "读取文件失败，请重新选择报表。",
    emptyContent: "没有可解析的内容。",
    chineseReportWarning: "检测到这份报表可能是中文导出。当前解析器只支持英文 IBKR Activity Statement CSV。请在 IBKR 导出时将 Language 设为 English 后重新上传。",
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
    shareImage: "分享图",
    shareImageTitle: "生成社交分享图",
    shareLandscape: "横版",
    sharePortrait: "竖版",
    sharePreview: "分享图预览",
    downloadPng: "下载 PNG",
    close: "关闭",
    generatedOn: "生成于",
    topContributors: "贡献排行",
    monthlyTrend: "月度趋势",
    positionsCount: "持仓数",
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
    assetAllocationKicker: "按组合市值统计",
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
    positionAssetPie: "持仓资产分布",
    positionAssetPieKicker: "按标的市值统计",
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
    positiveContribution: "正贡献",
    negativeContribution: "负贡献",
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
    cashAsset: "现金",
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
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    reset: "Reset",
    eyebrow: "IBKR Activity Statement",
    homeTitle: "IBKR Statement Parser",
    homeIntro: "Upload a CSV or TXT file to generate an account view. Processing stays in this browser.",
    previewAlt: "IBKR dashboard preview",
    chooseFile: "Select statement file",
    pasteLabel: "Paste CSV content",
    noFile: "No file selected",
    parse: "Parse",
    guideTitle: "How to get the report",
    guideSubtitle: "Export an Activity Statement CSV from IBKR Client Portal",
    guideNote: "If you use Flex Queries, choose CSV or Text format and include sections such as Net Asset Value, Open Positions, Trades, and Realized & Unrealized Performance Summary.",
    guideSource: "IBKR official guide",
    openSource: "Open source",
    guideSteps: [
      "Log in to IBKR Client Portal.",
      "Open Performance & Reports from the top menu, then go to Statements.",
      "Click the Run button next to a default statement or Activity Statement.",
      "Choose the account, date range, Format = CSV, and your preferred language.",
      "Generate and download the report file, then upload it here or paste the CSV content."
    ],
    fileReadError: "Could not read the file. Please choose the statement again.",
    emptyContent: "There is no content to parse.",
    chineseReportWarning: "This looks like a Chinese IBKR statement. The parser currently supports English IBKR Activity Statement CSV files only. Export it again with Language = English, then upload it.",
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
    shareImage: "Share image",
    shareImageTitle: "Generate social share image",
    shareLandscape: "Landscape",
    sharePortrait: "Portrait",
    sharePreview: "Share image preview",
    downloadPng: "Download PNG",
    close: "Close",
    generatedOn: "Generated on",
    topContributors: "Top contributors",
    monthlyTrend: "Monthly trend",
    positionsCount: "Positions",
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
    assetAllocationKicker: "By portfolio value",
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
    positionAssetPie: "Position asset allocation",
    positionAssetPieKicker: "By underlying market value",
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
    positiveContribution: "Positive",
    negativeContribution: "Negative",
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
    cashAsset: "Cash",
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
  share: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M17 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M7 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="m9.7 7.1 4.6 2.8"/><path d="m14.3 14.1-4.6 2.8"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="7"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65"/><path d="M4 4v5h5"/></svg>`
};

const SHARE_IMAGE_SIZES = {
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1728 }
};

const SHARE_LOGO_SRC = "./assets/ibkr-logo.svg";
const SHARE_IMAGE_COLORS = ["#e31937", "#5f6368", "#a41124", "#2b2f35", "#f15b61", "#878d96"];
const SHARE_IMAGE_FONT = 'Inter, "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif';

bindLanguageSwitcher();
bindThemeToggle();
applyTheme(currentTheme);
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

function bindThemeToggle() {
  themeToggle?.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("ibkr-report-theme", currentTheme);
    applyTheme(currentTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  updateThemeToggle();

  const shareModal = document.querySelector("#shareImageModal");
  if (shareModal && !shareModal.classList.contains("hidden")) {
    void renderShareImagePreview();
  }
}

function updateThemeToggle() {
  if (!themeToggle) return;

  const isDark = currentTheme === "dark";
  const label = isDark ? t("themeToLight") : t("themeToDark");
  themeToggle.classList.toggle("is-dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("title", label);
}

function updateLanguageChrome() {
  document.documentElement.lang = t("htmlLang");
  resetLabel.textContent = t("reset");
  updateThemeToggle();

  languageSwitcher?.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderUpload(errorMessage = "") {
  resetButton.classList.add("hidden");
  document.body.classList.remove("is-modal-open");
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
        ${renderReportGuide()}
      </div>
      ${renderOpenSourceLink()}
    </section>
  `;

  bindUploadEvents();
}

function renderOpenSourceLink() {
  return `
    <p class="home-source-link">
      <span>${t("openSource")}</span>
      <a href="https://github.com/G061206/ibkrstatement" target="_blank" rel="noopener noreferrer">G061206/ibkrstatement</a>
    </p>
  `;
}

function renderReportGuide() {
  const steps = translations[currentLanguage]?.guideSteps || translations.zh.guideSteps;

  return `
    <details class="report-guide">
      <summary>
        <span>
          <strong>${t("guideTitle")}</strong>
          <span>${t("guideSubtitle")}</span>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ol class="guide-steps">
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
      <p class="guide-note">${escapeHtml(t("guideNote"))}</p>
      <a class="guide-link" href="https://www.interactivebrokers.com/campus/trading-lessons/client-portal-reporting/" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(t("guideSource"))}
      </a>
    </details>
  `;
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
  reader.onload = () => {
    try {
      const { text } = decodeReportFile(reader.result);
      parseText(text, file.name);
    } catch {
      renderUpload(t("fileReadError"));
    }
  };
  reader.onerror = () => renderUpload(t("fileReadError"));
  reader.readAsArrayBuffer(file);
}

function parseText(text, sourceName) {
  if (!text.trim()) {
    renderUpload(t("emptyContent"));
    return;
  }

  if (isChineseIbkrReport(text)) {
    const warning = t("chineseReportWarning");
    window.alert(warning);
    renderUpload(warning);
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
      ${renderShareImageDialog()}
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
        <button class="quiet-button" id="shareImageButton" type="button">
          ${icons.share}
          <span>${t("shareImage")}</span>
        </button>
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

function renderShareImageDialog() {
  return `
    <div class="share-modal hidden" id="shareImageModal" role="dialog" aria-modal="true" aria-labelledby="shareImageTitle">
      <button class="share-modal-backdrop" type="button" data-share-close aria-label="${t("close")}"></button>
      <div class="share-modal-panel">
        <div class="share-modal-header">
          <div>
            <h2 id="shareImageTitle">${t("shareImageTitle")}</h2>
            <p>${t("sharePreview")}</p>
          </div>
          <button class="icon-button" type="button" data-share-close aria-label="${t("close")}">
            ${icons.close}
          </button>
        </div>
        <div class="share-modal-toolbar">
          <div class="share-format-switch" role="group" aria-label="${t("shareImage")}">
            <button class="share-format-button ${shareImageFormat === "landscape" ? "is-active" : ""}" type="button" data-share-format="landscape">
              ${t("shareLandscape")}
            </button>
            <button class="share-format-button ${shareImageFormat === "portrait" ? "is-active" : ""}" type="button" data-share-format="portrait">
              ${t("sharePortrait")}
            </button>
          </div>
          <button class="primary-button" id="downloadShareImageButton" type="button">
            ${icons.download}
            <span>${t("downloadPng")}</span>
          </button>
        </div>
        <div class="share-preview-frame">
          <canvas id="shareImageCanvas" width="1200" height="630" aria-label="${t("sharePreview")}"></canvas>
        </div>
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
  const portfolioAllocation = buildPortfolioAllocation(data);

  return `
    ${renderKpis(data)}
    <div class="insight-strip">
      ${renderMiniStat(t("tradeOrders"), formatNumber(data.tradeSummary.orderCount), renderDateRange(data.tradeSummary))}
      ${renderMiniStat(t("currentPositions"), formatNumber(data.positions.length), `${data.assetAllocation.length} ${t("assetClasses")}`)}
      ${renderMiniStat(t("recognizedSections"), formatNumber(Object.keys(data.sectionStats).length), "IBKR CSV")}
    </div>
    <div class="content-grid overview-grid">
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
        ${renderAllocation(portfolioAllocation, data.baseCurrency)}
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
            <h2 class="card-title">${t("assetAllocation")}</h2>
            <div class="card-kicker">${t("assetAllocationKicker")}</div>
          </div>
        </div>
        ${renderAssetDonut(portfolioAllocation, data.baseCurrency)}
      </article>
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

function renderAssetDonut(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noPositionMarketValue")}</div>`;

  const palette = ["#3186f6", "#0b6b5d", "#b57936", "#7c6ee6", "#d85d5d", "#2aa6a1"];
  let cursor = 0;
  const gradient = rows
    .map((row, index) => {
      const start = cursor;
      const end = cursor + row.weight * 100;
      cursor = end;
      return `${palette[index % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    })
    .join(", ");
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return `
    <div class="asset-donut-layout">
      <div class="asset-donut" style="--donut-gradient:${gradient}" aria-label="${t("assetAllocation")}">
        <span>${formatPercent(100)}</span>
      </div>
      <div class="asset-donut-legend">
        ${rows
          .map(
            (row, index) => `
              <div class="donut-legend-row">
                <span class="donut-legend-label">
                  <i style="background:${palette[index % palette.length]}"></i>
                  ${escapeHtml(displayGroupName(row.name))}
                </span>
                <strong>${formatPercent(row.weight * 100)}</strong>
              </div>
            `
          )
          .join("")}
        <div class="donut-total">${formatMoney(total, currency)}</div>
      </div>
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
    <article class="data-card position-chart-card">
      <div class="card-header">
        <div>
          <h2 class="card-title">${t("positionAssetPie")}</h2>
          <div class="card-kicker">${t("positionAssetPieKicker")}</div>
        </div>
      </div>
      <div id="positionAssetPie">
        ${renderPositionAssetPie(data.positions, data.baseCurrency)}
      </div>
    </article>
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
  if (!rows.length) return `<div class="empty-state">${t("noPositionMarketValue")}</div>`;

  const palette = ["#3186f6", "#0b6b5d", "#b57936", "#7c6ee6", "#d85d5d", "#2aa6a1", "#69a64d", "#bd6aa8"];
  let cursor = 0;
  const gradient = rows
    .map((row, index) => {
      const start = cursor;
      const end = cursor + row.weight * 100;
      cursor = end;
      return `${palette[index % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    })
    .join(", ");
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return `
    <div class="position-pie-layout">
      <div class="asset-pie" style="--pie-gradient:${gradient}" role="img" aria-label="${t("positionAssetPie")}"></div>
      <div class="position-pie-legend">
        ${rows
          .map(
            (row, index) => `
              <div class="position-pie-row">
                <span class="position-pie-label">
                  <i style="background:${palette[index % palette.length]}"></i>
                  ${escapeHtml(row.name)}
                </span>
                <span class="position-pie-value">
                  <strong>${formatPercent(row.weight * 100)}</strong>
                  <span>${formatMoney(row.value, currency)}</span>
                </span>
              </div>
            `
          )
          .join("")}
        <div class="donut-total">${formatMoney(total, currency)}</div>
      </div>
    </div>
  `;
}

function renderPerformance(data) {
  return `
    <div class="performance-grid">
      <div class="performance-column">
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
      <div class="performance-column">
        <article class="data-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">${t("tickerContribution")}</h2>
              <div class="card-kicker">${t("closedPositions")}</div>
            </div>
          </div>
          ${renderTickerTable(data.tickerPL, data.baseCurrency)}
        </article>
      </div>
    </div>
  `;
}

function renderPlTable(data) {
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
          <strong class="${valueTone(total.total)}">${formatMoney(total.total, data.baseCurrency)}</strong>
        </div>
        <div class="pl-total-split">
          <span>${t("realized")} <b class="${valueTone(total.realized)}">${formatMoney(total.realized, data.baseCurrency)}</b></span>
          <span>${t("unrealized")} <b class="${valueTone(total.unrealized)}">${formatMoney(total.unrealized, data.baseCurrency)}</b></span>
        </div>
      </div>
      <div class="pl-category-grid">
        ${rows
          .map(([label, value]) => renderPlCategory(label, value, data.baseCurrency, maxAbs))
          .join("")}
      </div>
    </div>
  `;
}

function renderPlCategory(label, value, currency, maxAbs) {
  return `
    <div class="pl-category-card">
      <div class="pl-category-head">
        <span>${escapeHtml(label)}</span>
        <strong class="${valueTone(value.total)}">${formatMoney(value.total, currency)}</strong>
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
        <strong class="${valueTone(value)}">${formatMoney(value, currency)}</strong>
      </div>
      <div class="pl-metric-track" aria-hidden="true">
        <span class="pl-metric-fill ${value < 0 ? "is-negative" : "is-positive"}" style="width:${width}%"></span>
      </div>
    </div>
  `;
}

function renderTickerTable(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noTickerContribution")}</div>`;

  const visibleRows = rows.slice(0, 12);
  const maxAbs = Math.max(...visibleRows.map((row) => Math.abs(row.realizedPL)), 1);
  const positiveTotal = rows
    .filter((row) => row.realizedPL > 0)
    .reduce((sum, row) => sum + row.realizedPL, 0);
  const negativeTotal = rows
    .filter((row) => row.realizedPL < 0)
    .reduce((sum, row) => sum + row.realizedPL, 0);

  return `
    <div class="ticker-contribution" aria-label="${t("tickerContribution")}">
      <div class="ticker-summary">
        <div class="ticker-summary-item">
          <span>${t("positiveContribution")}</span>
          <strong class="positive">${formatMoney(positiveTotal, currency)}</strong>
        </div>
        <div class="ticker-summary-item">
          <span>${t("negativeContribution")}</span>
          <strong class="negative">${formatMoney(negativeTotal, currency)}</strong>
        </div>
      </div>
      <div class="ticker-bars" role="list">
        ${visibleRows
        .map(
          (row, index) => {
            const isNegative = row.realizedPL < 0;
            const width = Math.max(3, (Math.abs(row.realizedPL) / maxAbs) * 50);

            return `
            <div class="ticker-bar-item" role="listitem">
              <div class="ticker-bar-top">
                <span class="ticker-rank">${String(index + 1).padStart(2, "0")}</span>
                <span class="symbol-cell">${escapeHtml(row.ticker)}</span>
                <strong class="${valueTone(row.realizedPL)}">${formatMoney(row.realizedPL, currency)}</strong>
              </div>
              <div class="ticker-meter" aria-hidden="true">
                <span class="ticker-fill ${isNegative ? "is-negative" : "is-positive"}" style="width:${width}%"></span>
              </div>
            </div>
          `;
          }
        )
        .join("")}
      </div>
    </div>
  `;
}

function renderMonthlyTable(rows, currency) {
  if (!rows.length) return `<div class="empty-state">${t("noMonthlyDetails")}</div>`;

  return `
    <div class="table-wrap is-scroll-limited">
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
    <div class="table-wrap is-scroll-limited">
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

  document.querySelector("#shareImageButton")?.addEventListener("click", () => {
    openShareImageDialog();
  });

  document.querySelectorAll("[data-share-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeShareImageDialog();
    });
  });

  document.querySelectorAll("[data-share-format]").forEach((button) => {
    button.addEventListener("click", () => {
      shareImageFormat = button.dataset.shareFormat || "landscape";
      void renderShareImagePreview();
    });
  });

  document.querySelector("#downloadShareImageButton")?.addEventListener("click", () => {
    void downloadShareImage();
  });

  document.querySelector("#replaceFileButton")?.addEventListener("click", () => {
    currentData = null;
    closeShareImageDialog();
    renderUpload();
  });

  const searchInput = document.querySelector("#positionSearch");
  const tableBody = document.querySelector("#positionsTableBody");
  const positionAssetPie = document.querySelector("#positionAssetPie");
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
      if (positionAssetPie) {
        positionAssetPie.innerHTML = renderPositionAssetPie(filtered, currentData.baseCurrency);
      }
    });
  }
}

function displayGroupName(name) {
  const labels = {
    Cash: t("cashAsset"),
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

function openShareImageDialog() {
  const modal = document.querySelector("#shareImageModal");
  if (!modal || !currentData) return;

  modal.classList.remove("hidden");
  document.body.classList.add("is-modal-open");
  void renderShareImagePreview();
  document.querySelector("#downloadShareImageButton")?.focus();
}

function closeShareImageDialog() {
  document.querySelector("#shareImageModal")?.classList.add("hidden");
  document.body.classList.remove("is-modal-open");
}

async function renderShareImagePreview() {
  const canvas = document.querySelector("#shareImageCanvas");
  if (!canvas || !currentData) return;

  const size = SHARE_IMAGE_SIZES[shareImageFormat] || SHARE_IMAGE_SIZES.landscape;
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.classList.toggle("is-portrait", shareImageFormat === "portrait");

  document.querySelectorAll("[data-share-format]").forEach((button) => {
    const isActive = button.dataset.shareFormat === shareImageFormat;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  await drawShareImage(canvas, currentData, shareImageFormat);
}

async function downloadShareImage() {
  const canvas = document.querySelector("#shareImageCanvas");
  if (!canvas || !currentData) return;

  await renderShareImagePreview();
  canvas.toBlob((blob) => {
    if (!blob) return;

    const safeAccount = (currentData.accountInfo.account || "ibkr").replace(/[^\w.-]+/g, "_");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeAccount}-share-${shareImageFormat}.png`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

async function drawShareImage(canvas, data, format) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const theme = getShareImageTheme();
  const model = buildShareImageModel(data);
  const logoImage = await loadShareLogoImage();
  drawShareBackground(ctx, canvas.width, canvas.height, theme);

  if (format === "portrait") {
    drawPortraitShareImage(ctx, model, theme, logoImage);
  } else {
    drawLandscapeShareImage(ctx, model, theme, logoImage);
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

function getShareImageTheme() {
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

function buildShareImageModel(data) {
  const totalPl = data.plSummary.total;
  const allocation = buildPortfolioAllocation(data);
  const monthlyRows = data.monthlySummary.slice(-6);
  const tickerRows = data.tickerPL.slice(0, 5);

  return {
    name: data.accountInfo.name || t("accountView"),
    account: data.accountInfo.account ? maskAccount(data.accountInfo.account) : t("unknownAccount"),
    period: data.accountInfo.period || t("unknownPeriod"),
    currency: data.baseCurrency,
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
    allocation,
    monthlyRows,
    tickerRows
  };
}

function drawLandscapeShareImage(ctx, model, theme, logoImage) {
  drawShareBrand(ctx, model, theme, logoImage, 60, 44, 1080);
  drawShareTopReturn(ctx, model, theme, 650, 84, 330, { size: 86 });
  drawShareText(ctx, model.name, 60, 106, {
    size: 48,
    weight: 820,
    color: theme.ink,
    maxWidth: 650
  });

  let pillX = 60;
  pillX += drawSharePill(ctx, model.account, pillX, 162, theme) + 10;
  pillX += drawSharePill(ctx, model.period, pillX, 162, theme) + 10;
  drawSharePill(ctx, `${model.currency} Base`, pillX, 162, theme, { tone: "brand" });

  drawShareHero(ctx, 60, 210, 440, 185, model, theme, { valueOffsetY: 66 });
  drawShareMetric(ctx, 520, 210, 230, 84, t("totalPL"), formatMoney(model.totalPl, model.currency), model.totalPl, theme);
  drawShareMetric(ctx, 520, 310, 230, 85, t("positionsCount"), formatNumber(model.positions), model.positions, theme);
  drawShareAllocation(ctx, 770, 210, 370, 185, model, theme);
  drawShareMonthlyTrend(ctx, 60, 420, 530, 150, model, theme);
  drawShareTickerList(ctx, 610, 420, 530, 150, model, theme);
  drawShareFooter(ctx, model, 60, 590, 1080, theme);
}

function drawPortraitShareImage(ctx, model, theme, logoImage) {
  drawShareBrand(ctx, model, theme, logoImage, 70, 92, 940);
  drawShareText(ctx, model.name, 70, 174, {
    size: 74,
    weight: 830,
    color: theme.ink,
    maxWidth: 640
  });
  drawShareTopReturn(ctx, model, theme, 505, 270, 490);

  drawSharePill(ctx, model.account, 70, 288, theme, { scale: 1.18 });
  drawSharePill(ctx, model.period, 70, 346, theme, { scale: 1.18 });

  drawShareHero(ctx, 70, 435, 940, 220, model, theme, { scale: 1.28 });
  drawShareMetric(ctx, 70, 685, 455, 112, t("totalPL"), formatMoney(model.totalPl, model.currency), model.totalPl, theme, { scale: 1.12 });
  drawShareMetric(ctx, 555, 685, 455, 112, t("unrealizedPL"), formatMoney(model.unrealizedPl, model.currency), model.unrealizedPl, theme, { scale: 1.12 });
  drawShareMetric(ctx, 70, 820, 455, 112, t("realized"), formatMoney(model.realizedPl, model.currency), model.realizedPl, theme, { scale: 1.12 });
  drawShareMetric(ctx, 555, 820, 455, 112, t("positionsCount"), formatNumber(model.positions), model.positions, theme, { scale: 1.12 });
  drawShareAllocation(ctx, 70, 970, 940, 285, model, theme, { scale: 1.18 });
  drawShareTickerList(ctx, 70, 1295, 940, 350, model, theme, { rowHeight: 50, scale: 1.18 });
  drawShareFooter(ctx, model, 70, 1684, 940, theme, { scale: 1.12 });
}

function drawShareBackground(ctx, width, height, theme) {
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

function drawShareBrand(ctx, model, theme, logoImage, x, y, width) {
  drawShareLogoMark(ctx, logoImage, x, y - 16, 82, theme);
  drawShareText(ctx, "IBKR Report Studio", x + 102, y + 8, {
    size: 24,
    weight: 820,
    color: theme.ink
  });
}

function drawShareHero(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, t("endingNav"), x + 28, y + 26, {
    size: 20 * scale,
    weight: 740,
    color: theme.muted,
    maxWidth: width - 56
  });
  const valueY = y + (options.valueOffsetY ?? 78);
  drawShareText(ctx, formatMoney(model.nav, model.currency), x + 28, valueY, {
    size: 50 * scale,
    weight: 850,
    color: theme.ink,
    maxWidth: width - 56
  });
  drawShareText(ctx, `${t("cash")} ${formatMoney(model.cash, model.currency)}`, x + 28, y + height - 54, {
    size: 18 * scale,
    weight: 700,
    color: theme.muted,
    maxWidth: width - 56
  });
  drawShareText(ctx, `${t("sections")} ${formatNumber(model.sections)}`, x + width - 28, y + height - 54, {
    size: 18 * scale,
    weight: 700,
    color: theme.faint,
    align: "right"
  });
}

function drawShareTopReturn(ctx, model, theme, x, y, width, options = {}) {
  const size = options.size || 126;
  ctx.save();
  drawShareText(ctx, formatSignedPercent(model.twr, 1), x + width, y + 8, {
    size,
    weight: 860,
    color: shareValueColor(model.twr, theme),
    align: "right"
  });
  ctx.restore();
}

function drawShareMetric(ctx, x, y, width, height, label, value, tone, theme, options = {}) {
  const scale = options.scale || 1;
  drawSharePanel(ctx, x, y, width, height, theme, { soft: true });
  drawShareText(ctx, label, x + 22, y + 20, {
    size: 17 * scale,
    weight: 740,
    color: theme.muted,
    maxWidth: width - 44
  });
  drawShareText(ctx, value, x + 22, y + 50 * scale, {
    size: 26 * scale,
    weight: 840,
    color: shareValueColor(tone, theme),
    maxWidth: width - 44
  });
}

function drawShareAllocation(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.allocation.slice(0, width > 500 ? 5 : 4);
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, t("assetAllocation"), x + 24, y + 22, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawShareText(ctx, t("noPositionMarketValue"), x + 24, y + 70, {
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

  drawShareText(ctx, "100%", donutX, donutY - 14 * scale, {
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
    drawRoundedPath(ctx, legendX, rowY + 2, 14 * scale, 14 * scale, 4);
    ctx.fill();
    drawShareText(ctx, displayGroupName(row.name), legendX + 24 * scale, rowY, {
      size: 16 * scale,
      weight: 740,
      color: theme.ink,
      maxWidth: width - (legendX - x) - 92
    });
    drawShareText(ctx, formatPercent(row.weight * 100), x + width - 24, rowY, {
      size: 16 * scale,
      weight: 780,
      color: theme.muted,
      align: "right"
    });
  });
}

function drawShareTickerList(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.tickerRows.slice(0, Math.max(3, Math.floor((height - 58) / (28 * scale))));
  const maxAbs = Math.max(...rows.map((row) => Math.abs(row.realizedPL)), 1);

  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, t("topContributors"), x + 24, y + 22, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawShareText(ctx, t("noTickerContribution"), x + 24, y + 70, {
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
    drawShareText(ctx, String(index + 1).padStart(2, "0"), x + 24, rowY + 6 * scale, {
      size: 14 * scale,
      weight: 800,
      color: theme.faint
    });
    drawShareText(ctx, row.ticker, x + 58 * scale, rowY, {
      size: 17 * scale,
      weight: 820,
      color: theme.ink,
      maxWidth: width * 0.28
    });
    drawShareText(ctx, amount, x + width - 24, rowY, {
      size: 17 * scale,
      weight: 800,
      color: shareValueColor(row.realizedPL, theme),
      align: "right",
      maxWidth: width * 0.36
    });

    const trackX = x + 58 * scale;
    const trackY = rowY + 20 * scale;
    const trackW = width - (trackX - x) - 24;
    ctx.fillStyle = theme.line;
    drawRoundedPath(ctx, trackX, trackY, trackW, 4 * scale, 6);
    ctx.fill();
    ctx.fillStyle = shareValueColor(row.realizedPL, theme);
    drawRoundedPath(ctx, trackX, trackY, Math.max(6, trackW * (Math.abs(row.realizedPL) / maxAbs)), 4 * scale, 6);
    ctx.fill();
  });
}

function drawShareMonthlyTrend(ctx, x, y, width, height, model, theme, options = {}) {
  const scale = options.scale || 1;
  const rows = model.monthlyRows;
  drawSharePanel(ctx, x, y, width, height, theme);
  drawShareText(ctx, t("monthlyTrend"), x + 24, y + 20, {
    size: 19 * scale,
    weight: 800,
    color: theme.ink,
    maxWidth: width - 48
  });

  if (!rows.length) {
    drawShareText(ctx, t("noMonthlyData"), x + 24, y + 66, {
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
    ctx.fillStyle = shareValueColor(row.net, theme);
    drawRoundedPath(ctx, barX, barY, barW, barH, 6);
    ctx.fill();
    drawShareText(ctx, row.month.slice(5), barX + barW / 2, chartY + chartH + 8, {
      size: 13 * scale,
      weight: 740,
      color: theme.faint,
      align: "center"
    });
  });
}

function drawShareFooter(ctx, model, x, y, width, theme, options = {}) {
  const scale = options.scale || 1;
  drawShareText(ctx, t("eyebrow"), x, y, {
    size: 17 * scale,
    weight: 720,
    color: theme.faint,
    maxWidth: width * 0.6
  });
  drawShareText(ctx, `${t("generatedOn")} ${model.generatedDate}`, x + width, y, {
    size: 17 * scale,
    weight: 720,
    color: theme.faint,
    align: "right"
  });
}

function drawSharePanel(ctx, x, y, width, height, theme, options = {}) {
  ctx.save();
  if (options.shadow !== false) {
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
  }
  ctx.fillStyle = options.soft ? theme.panelSoft : theme.panel;
  drawRoundedPath(ctx, x, y, width, height, 20);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawSharePill(ctx, text, x, y, theme, options = {}) {
  const scale = options.scale || 1;
  const size = 17 * scale;
  const isBrand = options.tone === "brand";
  ctx.save();
  ctx.font = `760 ${size}px ${SHARE_IMAGE_FONT}`;
  const width = Math.min(420 * scale, ctx.measureText(text).width + 30 * scale);
  ctx.fillStyle = isBrand ? theme.brandSoft : theme.panelSoft;
  drawRoundedPath(ctx, x, y, width, 34 * scale, 10);
  ctx.fill();
  ctx.strokeStyle = isBrand ? theme.brand : theme.lineStrong;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  drawShareText(ctx, text, x + 15 * scale, y + 8 * scale, {
    size,
    weight: 760,
    color: isBrand ? theme.brandStrong : theme.muted,
    maxWidth: width - 30 * scale
  });
  return width;
}

function drawShareLogoMark(ctx, logoImage, x, y, size, theme) {
  ctx.save();
  drawRoundedPath(ctx, x, y, size, size, size * 0.1);
  ctx.clip();

  if (logoImage) {
    ctx.drawImage(logoImage, x, y, size, size);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, size, size);
  }

  ctx.restore();
}

function drawShareText(ctx, text, x, y, options = {}) {
  const size = options.size || 18;
  const weight = options.weight || 650;
  ctx.save();
  ctx.font = `${weight} ${size}px ${SHARE_IMAGE_FONT}`;
  ctx.fillStyle = options.color || "#000000";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "top";
  const value = options.maxWidth ? fitCanvasText(ctx, String(text ?? ""), options.maxWidth) : String(text ?? "");
  ctx.fillText(value, x, y);
  ctx.restore();
}

function fitCanvasText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function drawRoundedPath(ctx, x, y, width, height, radius) {
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
}

function shareValueColor(value, theme) {
  if (value > 0) return theme.positive;
  if (value < 0) return theme.negative;
  return theme.ink;
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

function formatSignedPercent(value, digits = 2) {
  const amount = Number.isFinite(value) ? value : 0;
  const sign = amount > 0 ? "+" : "";
  return `${sign}${formatNumber(amount, digits)}%`;
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
