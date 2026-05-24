import { parseCsvLine } from "./parser.js";

const CJK_PATTERN = /[\u3400-\u9fff]/;
const ENGLISH_SECTION_NAMES = new Set([
  "Statement",
  "Account Information",
  "Net Asset Value",
  "Change in NAV",
  "Open Positions",
  "Trades",
  "Realized & Unrealized Performance Summary",
  "Interest",
  "Fees",
  "Forex P/L Details",
  "Mark-to-Market Performance Summary"
]);

const CHINESE_ROW_TYPES = new Set(["标题", "表头", "数据", "资料", "明细"]);
const CHINESE_REPORT_MARKERS = [
  "活动报表",
  "报表",
  "账户信息",
  "帐户信息",
  "账户资料",
  "账户",
  "净资产价值",
  "资产净值",
  "净值",
  "持仓",
  "未平仓",
  "头寸",
  "交易",
  "成交",
  "已实现",
  "未实现",
  "盈亏",
  "损益",
  "业绩摘要",
  "表现摘要",
  "资产类别",
  "字段名称",
  "字段值",
  "基础货币",
  "基本货币",
  "货币",
  "币种",
  "利息",
  "费用",
  "佣金",
  "外汇",
  "市值计价"
];

export function isChineseIbkrReport(text) {
  if (!CJK_PATTERN.test(text)) return false;

  const rows = previewRows(text);
  if (!rows.length) return false;
  if (hasEnglishIbkrStructure(rows)) return false;

  let structuredChineseRows = 0;
  let markerHits = 0;
  let csvLikeRows = 0;

  for (const row of rows) {
    const joined = row.join(",");
    const rowType = String(row[1] || "").trim();
    const hasStructuredRowType = rowType === "Header" || rowType === "Data" || CHINESE_ROW_TYPES.has(rowType);
    const hasChinese = CJK_PATTERN.test(joined);

    if (row.length >= 3) csvLikeRows += 1;
    if (hasStructuredRowType && hasChinese) structuredChineseRows += 1;

    markerHits += CHINESE_REPORT_MARKERS.reduce((count, marker) => {
      return count + (joined.includes(marker) ? 1 : 0);
    }, 0);
  }

  if (structuredChineseRows >= 2 && markerHits >= 2) return true;
  if (csvLikeRows >= 4 && markerHits >= 5) return true;
  return false;
}

function previewRows(text) {
  return text
    .split(/\r\n|\n|\r/)
    .slice(0, 120)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
}

function hasEnglishIbkrStructure(rows) {
  let englishHeaders = 0;

  for (const row of rows) {
    const sectionName = String(row[0] || "").trim().replace(/^\uFEFF/, "");
    const rowType = String(row[1] || "").trim();
    if (rowType === "Header" && ENGLISH_SECTION_NAMES.has(sectionName)) {
      englishHeaders += 1;
    }
  }

  return englishHeaders >= 2;
}
