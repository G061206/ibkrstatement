<div align="center">

<img src="assets/icon.svg" width="72" height="72" alt="IBKR Analytics Studio 图标" />

# IBKR Analytics Studio

**在浏览器中分析你的 IBKR 报表。**

Local-first analytics for Interactive Brokers Activity Statements.

<p>
  <a href="https://github.com/G061206/ibkrstatement/blob/main/package.json"><img src="https://img.shields.io/badge/version-2.2.0-e31937?style=flat-square" alt="Version 2.2.0" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2563eb?style=flat-square" alt="MIT License" /></a>
  <a href="#隐私与数据"><img src="https://img.shields.io/badge/processing-local-057a55?style=flat-square" alt="报表在本地处理" /></a>
  <a href="package.json"><img src="https://img.shields.io/badge/runtime_dependencies-0-475569?style=flat-square" alt="零运行时依赖" /></a>
</p>

**[在线体验](https://www.ibkrstatement.site/)** · **[查看示例](https://www.ibkrstatement.site/?sample=1)** · **[本地运行](#本地运行)** · **[反馈问题](https://github.com/G061206/ibkrstatement/issues)**

<p>账户总览 · 持仓分析 · 收益归因 · 每日交易 · 多报表合并</p>

</div>

---

把从 Interactive Brokers 导出的 CSV/TXT 放进来，查看净值、持仓、盈亏、佣金和每日交易。你可以合并同一账户不同月份或年份的报表，导出结构化 JSON，或生成一张分享图。

打开网页即可使用。分析报表无需提供券商密码、API Key 或账户连接权限。

<p align="center">
  <a href="https://www.ibkrstatement.site/?sample=1">
    <img src="artifacts/ibkr-analytics-studio-intro.gif" width="100%" alt="IBKR Analytics Studio 产品演示动画：收益、持仓、每日交易与分享图" />
  </a>
  <br />
  <sub>演示动画使用示例数据，展示早期版本界面。当前界面与统计口径请以在线示例和下方说明为准。</sub>
</p>

## 核心功能

| 功能 | 你可以查看或完成的事 |
| :--- | :--- |
| **账户总览** | 期末净值、现金、时间加权收益、佣金、资产配置、币种敞口和 NAV 变化 |
| **持仓分析** | 股票与期权持仓、成本、市值、未实现盈亏、多空方向，以及标的集中度 |
| **绩效分析** | 已实现与未实现盈亏、资产类别分布、主要贡献者、月度收支和已实现交易排行 |
| **每日复盘** | 盈亏日历、交易笔数、成交额，以及按月份筛选的逐笔交易流水 |
| **多 Statement 合并** | 同一账户跨周期合并，追加或移除报表，查看各份来源和汇率 |
| **数据核对** | 识别到的 CSV 区块、基础货币汇率、缺失字段与解析诊断 |
| **导出与分享** | 结构化 JSON、横版或竖版 PNG，支持自定义分享名称及隐藏姓名、期末净值 |

支持**中英文 Activity Statement**、中英文界面、浅色与暗色主题，以及桌面和移动端布局。

## 快速上手

### 1. 先用示例体验

[打开示例账户 →](https://www.ibkrstatement.site/?sample=1)

页面会载入仓库中的示例报表。你可以切换五个分析栏目、查看逐笔交易，也可以[直接预览分享图](https://www.ibkrstatement.site/?sample=1&share=1)。

### 2. 导出你的报表

在 IBKR Client Portal 中进入 **Performance & Reports → Statements**，运行 **Activity Statement**，选择报表周期，将格式设为 **CSV**。语言可以选择中文或英文。操作入口也可能位于 **Menu → Reporting → Statements**，详见 [IBKR 官方导出指南](https://www.ibkrguides.com/clientportal/performanceandstatements/runstatement.htm)。

如果计划合并多份报表，请选择同一账户，并导出互不重叠的月份、年份或自定义周期。

### 3. 导入并分析

回到应用，拖放文件或点击「选择文件」。你可以一次导入多份 CSV/TXT，也可以展开粘贴面板处理 CSV 文本。

进入分析页后，通过「报表管理」追加或移除文件。导出 JSON 和分享 PNG 的入口位于导航栏；所有导出均在浏览器内生成。

> 请使用 Activity Statement CSV 的 Header/Data 结构。PDF、HTML 报表和 Flex Query XML 不属于当前导入格式。

## 多报表合并

把一月、二月、三月的 Statement 一起导入，就能在同一个视图中复盘这三个周期。文件选择顺序不影响结果，应用会按报表周期排序。

```text
同一账户 · 相同基础货币

一月 Statement ─┐
二月 Statement ─┼─→ 合并视图：跨期交易与收入 + 最新持仓与净值
三月 Statement ─┘
```

| 数据 | 合并方式 |
| :--- | :--- |
| 交易、佣金、股息、利息、费用 | 按已导入周期累计；换算时保留各份报表自身的汇率 |
| 每日与月度统计 | 将各周期记录汇总到对应日期或月份 |
| 持仓、现金、期末净值 | 取最新周期的快照 |
| 已实现盈亏 | 跨期累计 |
| 未实现盈亏 | 取最新周期的值 |
| 总盈亏 | 累计已实现盈亏 + 最新未实现盈亏 |
| 时间加权收益（TWR） | 周期连续且各期收益率有效时复合计算 |

**重复报表会跳过，重叠周期会提示。** 例如，一份全年报表与一份属于该年份的月报不能一起累计；请保留全年报表，或改用互不重叠的月报。应用会保留单份报表中的重复成交行。

追加失败时，你仍可继续查看已有分析。展开「查看来源报表」可以核对文件名、周期及汇率；移除文件后会重新计算，移除最后一份时返回上传页。

<details>
<summary><strong>展开查看合并校验与缺失数据规则</strong></summary>

- 每份报表需包含账户编号、明确的基础货币与可识别的 Statement Period。明细日期需落在声明周期内。
- 周期支持英文日期范围、ISO 日期范围、中文年月日范围、单日、英文月份、`YYYY-MM` 和年份。
- NAV 变化取最早周期的期初净值、最新周期的期末净值，其他变化项目按已导入周期累加。
- 周期连续时，TWR 按 `∏(1 + 单期收益率) − 1` 复合计算。周期有空档或缺少有效收益率时显示 `—`，并给出诊断。
- 存在周期空档时，累计结果仅覆盖已导入周期。
- 必要的盈亏汇总缺失时，相关值保留为 `null`，界面显示 `—`；不会用 0 代替未知值。
- JSON 的 `mergeInfo` 保留来源文件名、周期、汇率、诊断与区块行数，不包含原始 CSV 文本。
- 数据页的公共汇率表显示最新报表汇率；各来源汇率可在报表管理中核对。

</details>

## 隐私与数据

**你的报表在当前浏览器内读取、解析和计算。**

- 文件和粘贴的 CSV 内容不会由应用上传至服务器。
- 报表与解析结果保留在当前页面内存中；刷新或关闭页面后，需要重新导入。
- 语言、主题、分享名称和分享显示偏好会保存在本机 `localStorage` 中。
- 点击导出时，浏览器会在本地生成 JSON 或 PNG。JSON 包含账户信息与交易明细，分享前请检查内容。
- 分享图支持隐藏姓名与期末净值，账户编号会做遮罩处理。

你也可以克隆仓库，在自己的电脑上运行。使用在线版本时，浏览器仍会请求页面资源和你主动载入的示例文件。

## 本地运行

准备好 Git 和 Node.js，在终端执行：

```bash
git clone https://github.com/G061206/ibkrstatement.git
cd ibkrstatement
npm run serve
```

打开 **[http://127.0.0.1:4187/](http://127.0.0.1:4187/)**。

项目使用原生 JavaScript 和 Node.js 内置静态服务器，无需执行 `npm install`，也没有构建步骤。服务器绑定 `127.0.0.1`；建议直接使用上面的地址，避免部分环境中 `localhost` 的 IPv6 解析差异。

<details>
<summary><strong>端口被占用？</strong></summary>

Windows PowerShell：

```powershell
$env:PORT = "4188"
npm run serve
```

macOS / Linux：

```bash
PORT=4188 npm run serve
```

然后访问 `http://127.0.0.1:4188/`。

</details>

## 计算口径与兼容性

项目按报表提供的字段计算，结果适合投资复盘与数据核对。以下口径会影响你对图表的解读。

<details>
<summary><strong>盈亏、佣金与汇率</strong></summary>

- 股票和期权的 `Realized P/L` 已包含佣金，月度净额不再重复扣减；界面仍独立展示佣金。
- 外汇交易提供 MTM 时，月度净额计入对应外汇佣金一次。仅提供已实现盈亏的外汇交易沿用已实现口径。
- `Comm in XXX` 和 `MTM in XXX` 使用列标题中的币种，而非一律使用交易币种。导出的交易明细保留 `commissionCurrency` 与 `mtmCurrency`。
- 汇率优先取 `Base Currency Exchange Rate` 的 `Rate` 或 `Exchange Rate` 列，缺失时回退到 MTM Forex 汇率。多个日期的汇率取最新有效值。
- 交易和持仓使用所在报表的换算汇率，**并非逐笔历史汇率**。所需汇率缺失或无效时，应用会停止导入并提示补充。
- 股票股息关联股票持仓，不会重复归属到同一标的的期权。
- 总览的组合资产配置包含现金；持仓页的标的市值饼图不包含现金，并按市值绝对值统计集中度。

</details>

<details>
<summary><strong>支持的报表区块</strong></summary>

| 区块 | 用途 |
| :--- | :--- |
| `Statement` / `Account Information` | 周期、账户、名称与基础货币 |
| `Net Asset Value` / `Change in NAV` | 净值、现金、TWR 与净值变化 |
| `Open Positions` | 当前持仓与敞口 |
| `Trades` | Order 行、逐笔交易、每日与月度统计 |
| `Realized & Unrealized Performance Summary` | 盈亏汇总与标的贡献 |
| `Dividends` / `Interest` / `Fees` | 股息、利息与费用 |
| `Forex P/L Details` | 外汇损益明细 |
| `Stock Yield Enhancement Program Securities Lent Interest Details` | 证券出借收入 |
| `Mark-to-Market Performance Summary` / `Base Currency Exchange Rate` | 汇率来源 |

解析器会将已支持的中文区块名、列名和枚举值规范化为统一数据模型。文件读取支持 UTF-8、GBK/GB18030 和 UTF-16 编码识别。

不同模板和账户权限可能导致字段缺失。关键区块缺失会出现在数据页诊断中；对应指标可能显示为空或 `—`。

</details>

<details>
<summary><strong>当前范围与限制</strong></summary>

- 导入对象是 IBKR Activity Statement CSV/TXT；其他券商、PDF、HTML 和 Flex Query XML 不在当前支持范围内。
- 多报表合并用于同一账户跨时间复盘，不提供跨账户组合合并。
- 重叠周期需要重新选择或导出，应用不会按天拆分汇总盈亏。
- 每日统计依赖 Trades 的 Order 行，缺少该区块时无法生成逐笔交易视图。
- 税务申报、保证金分析、期权希腊值和完整公司行动处理不属于当前功能范围。
- 分享图展示报表摘要，完整核对请使用原始 Statement。

</details>

## 开发与部署

原生 ES Modules、CSS 和 Canvas。解析逻辑与 UI 分离，测试使用 Node.js 内置测试运行器。

```text
ibkrstatement/
├── src/          # 解析、合并、编码识别、界面与中英文文案
├── assets/       # 样式、图标与品牌资源
├── samples/      # 示例报表
├── tests/        # 解析与界面回归测试
├── index.html    # 应用入口
├── serve.mjs     # 本地静态服务器
└── vercel.json   # 静态部署配置
```

验证修改：

```bash
npm run check
npm test
```

测试覆盖合并排序与冲突、重复报表、周期快照、汇率换算、佣金口径、缺失盈亏、股息归属、界面与分享图文案，以及 HTML 转义。

部署时将仓库作为静态站点发布即可。仓库已提供 Vercel 配置；部署到其他静态服务器时，保留 `index.html`、`src/`、`assets/` 和需要使用的 `samples/`，以及 `robots.txt`、`sitemap.xml`。服务需正确提供 JavaScript 模块的 MIME 类型。

## 参与改进

欢迎通过 [Issue](https://github.com/G061206/ibkrstatement/issues) 反馈解析问题、提出功能需求，或通过 [Pull Request](https://github.com/G061206/ibkrstatement/pulls) 改进代码与文档。

报告解析问题时，请提供报表语言、出错区块、复现步骤及脱敏的最小 CSV 片段。移除姓名、账户编号和其他私人信息，保留 Header/Data 结构与相关列名。

修改解析或合并规则时，请补充合成数据回归测试，并运行 `npm run check` 与 `npm test`。仓库中的真实报表不应作为公开测试样本。

---

[MIT License](LICENSE) · [项目网站](https://www.ibkrstatement.site/) · [GitHub](https://github.com/G061206/ibkrstatement)

本项目由社区开发，与 Interactive Brokers LLC 无官方关联。名称及商标归各自所有者所有。统计结果用于个人复盘与数据查看，不构成投资或税务建议；请以官方报表核对实际数据。
