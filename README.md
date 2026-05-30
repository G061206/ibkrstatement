# IBKR Analytics Studio

IBKR Analytics Studio 是一个用于 Interactive Brokers Activity Statement 的本地化报表分析工具。它可以在浏览器中直接解析 IBKR 导出的 CSV/TXT 报表，生成账户总览、持仓分析、绩效统计、每日交易统计、数据质量检查和社交分享图。

项目网站：https://www.ibkrstatement.site/

## 功能概览

- 本地解析 IBKR Activity Statement CSV/TXT。
- 支持文件拖放、文件选择、粘贴 CSV 文本和载入示例数据。
- 自动识别报表账户、周期、基础货币、净值、现金、持仓、交易、费用、利息和外汇损益等信息。
- 提供总览、持仓、绩效、每日、数据五个分析栏目。
- 支持中英文界面切换。
- 支持浅色和暗色主题。
- 支持导出结构化 JSON。
- 支持生成横版和竖版 PNG 分享图。
- 所有处理均在当前浏览器内完成。

## 主要页面

### 账户总览

账户总览用于快速查看报表核心状态，包括：

- 期末净值
- 现金
- 总盈亏
- 时间加权收益
- 交易订单数
- 当前持仓数量
- 已识别 CSV 区块
- 佣金费用
- 资产配置
- 币种敞口
- NAV 变化
- 包含现金的资产配置占比饼图

资产配置占比会把 Open Positions 的市值和 Net Asset Value 中的现金合并计算，因此可以看到股票、现金等组合构成。

### 持仓明细

持仓页面用于分析当前 Open Positions：

- 按资产类别汇总持仓
- 按多头/空头方向汇总
- 按币种汇总
- 展示逐项 Open Positions 明细
- 在页面底部展示按标的市值统计的持仓饼图

持仓饼图按每个标的的当前市值统计，不包含现金，适合观察持仓集中度。

### 绩效概览

绩效页面用于查看报表周期内收益表现：

- 已实现盈亏
- 未实现盈亏
- 总盈亏
- 盈亏明细
- 主要贡献者
- 月度收入与支出
- 已实现交易排行

页面标题和说明不会写死为年初至今，而是按照导入报表的实际周期展示。

### 每日统计

每日页面基于 Trades 区块中的逐笔交易记录生成：

- 盈亏日历
- 每日交易笔数柱状图
- 总交易笔数
- 总成交额
- 日均交易数
- 已实现盈亏
- 所选月份的交易流水列表

月份下拉会根据报表中实际存在的交易月份生成。交易流水表会随月份切换而更新，显示该月份所有交易，包括成交时间、代码、买卖方向、资产类别、数量、成交价、成交金额、佣金和已实现盈亏。

### 数据质量

数据质量页面用于排查报表解析情况：

- 已解析 CSV 区块
- 基础货币换算汇率
- 解析诊断

如果缺少关键区块，例如 Account Information、Net Asset Value、Trades、Open Positions 或 Realized & Unrealized Performance Summary，页面会给出诊断提示。

## 支持的数据来源

推荐从 IBKR Client Portal 导出英文 Activity Statement：

1. 登录 IBKR Client Portal。
2. 进入 Performance & Reports -> Statements。
3. 选择 Activity Statement 并点击 Run。
4. 将 Language 设置为 English。
5. 将 Format 设置为 CSV。
6. 下载文件后在本项目中上传或粘贴内容。

当前解析器主要面向英文 IBKR Activity Statement CSV。中文导出的报表字段名可能不同，项目会尝试检测并提示重新导出英文版本。

## 已解析的主要区块

项目会读取并使用以下区块中的数据：

- Account Information
- Net Asset Value
- Change in NAV
- Open Positions
- Trades
- Realized & Unrealized Performance Summary
- Forex P/L Details
- Interest
- Fees
- Stock Yield Enhancement Program Securities Lent Interest Details
- Mark-to-Market Performance Summary
- Base Currency Exchange Rate

不同账户权限、报表配置和报表周期可能导致区块缺失。缺失区块不会阻止页面加载，但对应指标可能为空或显示诊断提示。

## Trades 明细字段

每日统计和交易流水依赖 Trades 区块中的 Order 行。常见字段包括：

- Asset Category
- Currency
- Symbol
- Date/Time
- Quantity
- T. Price
- C. Price
- Proceeds
- Comm/Fee
- Basis
- Realized P/L
- MTM P/L
- Code

项目会按交易日期聚合每日已实现盈亏、交易笔数、成交额和佣金。

## 本地运行

项目是静态前端应用，无需安装运行时依赖。只需要本机有 Node.js，用于启动本地静态服务器。

```powershell
cd "E:\IBKR Reader\ibkr-analytics-studio"
npm run serve
```

默认访问地址：

```text
http://127.0.0.1:4187/
```

不要优先使用 `localhost`。在部分 Windows 环境中，`localhost` 可能解析到 IPv6 地址，导致访问不到只监听 `127.0.0.1` 的本地服务。

## 检查代码

项目没有构建步骤，当前检查主要是 JavaScript 语法检查：

```powershell
npm run check
```

该命令会检查：

- `src/encoding.js`
- `src/parser.js`
- `src/reportLanguage.js`
- `src/app.js`

## 目录结构

```text
ibkr-analytics-studio/
├─ assets/
│  ├─ ibkr-logo.svg
│  ├─ icon.svg
│  ├─ statement-preview.svg
│  └─ styles.css
├─ samples/
│  ├─ ibkr-sample-demo.csv
│  └─ ibkr-sample-9999.csv
├─ src/
│  ├─ app.js
│  ├─ encoding.js
│  ├─ parser.js
│  └─ reportLanguage.js
├─ stitch-reference/
├─ index.html
├─ package.json
├─ serve.mjs
├─ sitemap.xml
└─ vercel.json
```

### 核心文件说明

- `src/app.js`：应用 UI、交互、图表、分享图和导出逻辑。
- `src/parser.js`：IBKR CSV 解析、账户指标、持仓、交易、月度和每日统计。
- `src/encoding.js`：文件读取和文本编码处理。
- `src/reportLanguage.js`：报表语言检测。
- `assets/styles.css`：完整页面样式、暗色主题、响应式布局。
- `serve.mjs`：本地静态文件服务器。
- `samples/`：示例 IBKR 报表，用于本地测试。
- `stitch-reference/`：设计参考和验证截图，不参与运行逻辑。

## 隐私说明

IBKR Analytics Studio 默认只在当前浏览器内处理数据：

- 上传的 CSV/TXT 文件不会发送到服务器。
- 粘贴的 CSV 文本不会写入数据库。
- 解析结果只保存在当前页面状态中。
- JSON 和 PNG 只有在用户主动点击时才会在浏览器中生成并下载。

如果部署到静态托管平台，仍建议使用 HTTPS，并避免把真实报表样本提交到公开仓库。

## 分享图

项目支持生成两种 PNG 分享图：

- 横版：适合社交媒体或宽屏展示。
- 竖版：适合移动端长图展示。

分享图使用浏览器 Canvas 生成，内容来自当前解析后的报表摘要，包括账户周期、净值、盈亏、资产配置、月度趋势和主要贡献者等。

## 部署

项目可以部署到任何静态托管平台，例如 Vercel、Netlify、GitHub Pages 或本地内网静态服务器。

由于应用无需后端 API，部署时只需要托管以下文件即可：

- `index.html`
- `assets/`
- `src/`
- `samples/`，如果需要保留示例数据
- `robots.txt`
- `sitemap.xml`

Vercel 配置文件已包含在 `vercel.json` 中。

## 已知限制

- 主要支持英文 IBKR Activity Statement CSV。
- 不同 IBKR 报表模板可能导致字段缺失或字段名变化。
- 税务、保证金、期权希腊值和公司行动等高级报表内容目前不是重点分析对象。
- 页面中的统计结果只用于投资复盘和数据查看，不构成投资建议或税务建议。
- 分享图是摘要展示，不应替代完整报表。

## 开发建议

新增功能时建议遵循以下顺序：

1. 先在 `src/parser.js` 中补充结构化数据。
2. 再在 `src/app.js` 中新增渲染函数。
3. 最后在 `assets/styles.css` 中补齐样式和响应式规则。
4. 使用 `npm run check` 做语法检查。
5. 用 `samples/` 中的示例报表手动验证页面。

## 免责声明

本项目不是 Interactive Brokers 官方产品，也不与 Interactive Brokers LLC 存在官方关联。所有商标和产品名称归其各自所有者所有。

本工具仅用于本地报表解析和个人数据分析。用户应自行核对原始 IBKR Activity Statement，任何投资、税务或会计决策都应以官方报表和专业意见为准。

## 许可证

本项目基于 MIT License 开源，详见 `LICENSE`。
