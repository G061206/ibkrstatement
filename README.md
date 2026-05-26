# IBKR Report Studio

这是一个面向 Interactive Brokers Activity Statement 的本地化报表解析工具。用户可以上传或粘贴 IBKR 导出的 CSV/TXT 报表，在浏览器内生成账户概览、NAV、持仓、交易、盈亏、费用、利息、外汇损益和资产配置视图。

所有解析都在当前浏览器中完成，不需要后端服务，也不会把用户的报表文件上传到服务器。

线上站点：

```text
https://www.ibkrstatement.site/
```

## 功能概览

- 本地解析 IBKR Activity Statement CSV/TXT。
- 支持文件上传、拖拽上传和手动粘贴 CSV 内容。
- 自动识别常见文本编码，包括 UTF-8、GB18030/GBK、UTF-16LE 和 UTF-16BE。
- 检测中文 IBKR 报表并提示用户导出英文报表，避免字段名不匹配导致结果错误。
- 展示账户信息、报表周期、基础货币、识别到的 CSV 区块数量。
- 汇总 Net Asset Value、现金、总资产、时间加权收益率。
- 解析 Change in NAV，展示报表周期内 NAV 变化来源。
- 解析 Open Positions，展示持仓、数量、方向、市值、成本、未实现盈亏、币种和期权信息。
- 解析 Trades，统计交易数量、股票/期权/外汇订单、佣金、已实现盈亏和期权权利金。
- 解析 Realized & Unrealized Performance Summary，生成股票、期权、外汇和总计盈亏分布。
- 解析 Interest、Fees、Forex P/L Details、SYEP Interest，生成月度收入与成本摘要。
- 从 Mark-to-Market Performance Summary 中提取 Forex 汇率，用于基础货币换算。
- 按资产类别和币种展示组合敞口。
- 按 ticker 统计已平仓贡献。
- 支持中文/英文界面切换。
- 支持浅色/深色主题。
- 支持导出汇总 JSON。
- 支持生成横版和竖版社交分享 PNG。

## 隐私说明

IBKR Report Studio 不包含后端接口。报表文件通过浏览器的 FileReader API 读取，解析逻辑运行在用户本地浏览器中。

默认行为：

- 不上传原始 CSV/TXT 文件。
- 不存储用户账户数据。
- 不使用数据库。
- 不依赖第三方分析脚本。
- 导出的 JSON 和 PNG 由用户主动在浏览器中生成并下载。

如果后续接入统计、日志或错误上报，应在 README 和页面隐私说明中同步更新。

## 支持的报表格式

推荐从 IBKR Client Portal 导出英文 Activity Statement，格式选择 CSV。

当前解析器主要识别 IBKR 英文字段名和区块名。中文报表会被检测并提示重新导出英文版本。

建议导出时包含以下区块：

- Account Information
- Statement
- Net Asset Value
- Change in NAV
- Open Positions
- Trades
- Realized & Unrealized Performance Summary
- Interest
- Fees
- Forex P/L Details
- Stock Yield Enhancement Program Securities Lent Interest Details
- Mark-to-Market Performance Summary
- Financial Instrument Information

其中部分区块缺失时，应用仍会尽量生成可用视图，但相关指标会为空或出现诊断提示。

## 如何从 IBKR 导出报表

1. 登录 IBKR Client Portal。
2. 打开顶部菜单 `Performance & Reports`。
3. 进入 `Statements`。
4. 找到 `Activity Statement`，点击 `Run`。
5. 选择账户和日期范围。
6. 将语言设置为 English。
7. 将格式设置为 CSV。
8. 生成并下载报表文件。
9. 回到 IBKR Report Studio 上传 CSV/TXT 文件，或直接粘贴报表内容。

注意：不要用 Excel 打开并重新保存 CSV。电子表格软件可能会修改日期、数字、引号或编码格式，从而影响解析。

## 页面使用流程

1. 打开网站。
2. 选择报表文件，拖拽报表文件，或粘贴 CSV 内容。
3. 应用读取并自动解码文件内容。
4. 如果检测到中文报表，应用会提示重新导出英文报表。
5. 解析成功后进入 Dashboard。
6. 在 `总览`、`持仓`、`收益`、`数据` 之间切换查看结果。
7. 可点击 `导出 JSON` 下载结构化摘要。
8. 可点击 `分享图` 生成横版或竖版 PNG。
9. 可点击 `更换文件` 回到上传页。

## Dashboard 说明

### 总览

总览页用于快速判断报表整体情况：

- 期末净值
- 现金
- 总盈亏
- 时间加权收益
- 交易订单数量
- 当前持仓数量
- 资产类别数量
- 识别到的报表区块数量
- 月度净贡献
- 资产配置
- NAV 变化
- 解析诊断和警告

### 持仓

持仓页展示当前 Open Positions：

- 标的
- 资产类别
- 多头/空头方向
- 数量
- 市值
- 成本
- 未实现盈亏
- 币种
- 期权类型、到期日、行权价

持仓页支持按标的、基础标的、资产类别和币种搜索过滤。

### 收益

收益页展示 P/L 相关信息：

- 股票、期权、外汇的已实现和未实现盈亏。
- 总盈亏拆分。
- ticker 已平仓贡献排行。
- 月度收入与成本明细。
- 已实现交易排行。

### 数据

数据页用于排查和验证：

- 已解析的 CSV 区块。
- 基础货币汇率表。
- 币种敞口。
- 解析警告。

## 本地运行

项目没有构建步骤，也没有运行时依赖。只需要 Node.js 用来启动本地静态服务器和做语法检查。

建议使用 Node.js 18 或更高版本。

安装依赖：

```powershell
cd "E:\IBKR Reader\ibkr-report-studio"
npm install
```

启动本地服务：

```powershell
npm run serve
```

默认地址：

```text
http://127.0.0.1:4177/
```

指定端口：

```powershell
$env:PORT=4180
npm run serve
```

语法检查：

```powershell
npm run check
```

当前 `check` 会检查：

- `src/encoding.js`
- `src/parser.js`
- `src/reportLanguage.js`
- `src/app.js`

## 部署

这是一个纯静态项目，可以部署到 Vercel、Cloudflare Pages、Netlify、GitHub Pages 或任意静态文件服务器。

当前仓库包含 Vercel 配置：

```json
{
  "framework": null,
  "installCommand": "",
  "buildCommand": null,
  "outputDirectory": "."
}
```

也包含 apex 域名到 www 域名的永久重定向：

```text
https://ibkrstatement.site/* -> https://www.ibkrstatement.site/*
```

部署后建议检查：

```text
https://www.ibkrstatement.site/
https://ibkrstatement.site/
```

期望结果：

- 首页返回 200。
- apex 域名跳转到 www 域名。

## 项目结构

```text
ibkr-report-studio/
├─ assets/
│  ├─ icon.svg
│  ├─ ibkr-logo.svg
│  ├─ statement-preview.svg
│  └─ styles.css
├─ src/
│  ├─ app.js
│  ├─ encoding.js
│  ├─ parser.js
│  └─ reportLanguage.js
├─ index.html
├─ package.json
├─ README.md
├─ serve.mjs
└─ vercel.json
```

## 核心模块

### `src/app.js`

负责浏览器交互和页面渲染：

- 语言切换。
- 主题切换。
- 文件上传和拖拽。
- 粘贴 CSV 内容。
- 调用编码识别、中文报表检测和解析器。
- 渲染 Dashboard。
- 导出 JSON。
- 生成分享图。

### `src/parser.js`

负责 IBKR CSV 解析和数据建模：

- 解析 CSV 行和区块。
- 提取账户信息。
- 提取基础货币和汇率。
- 提取 NAV 和 NAV 变化。
- 提取 Open Positions。
- 汇总 Trades。
- 汇总 Realized & Unrealized Performance Summary。
- 构建月度摘要。
- 构建 ticker P/L 贡献。
- 构建资产配置和币种敞口。
- 生成诊断警告。

### `src/encoding.js`

负责读取用户文件时的编码识别：

- BOM 检测。
- UTF-16 空字节模式检测。
- UTF-8、GB18030/GBK、UTF-16LE、UTF-16BE 候选解码。
- 根据 IBKR 标记、Header/Data 行和乱码字符评分选择最佳结果。

### `src/reportLanguage.js`

负责检测中文 IBKR 报表：

- 判断文本中是否包含 CJK 字符。
- 检测中文区块、行类型和字段名。
- 如果不是英文 IBKR 标准结构，则提示用户导出英文报表。

### `serve.mjs`

一个极简 Node.js 静态服务器：

- 默认监听 `127.0.0.1:4177`。
- 支持 `PORT` 环境变量。
- 根据扩展名返回基础 MIME 类型。
- 防止路径穿越访问项目目录外文件。

## 数据字段和计算说明

### 汇率

应用从 `Mark-to-Market Performance Summary` 的 Forex 行中读取 `Current Price`，建立非基础货币到基础货币的换算表。

如果缺失对应币种汇率，则默认按 1 处理。复杂多币种账户建议确保报表包含 Mark-to-Market Performance Summary。

### 期权识别

应用基于 IBKR 常见期权符号格式解析：

```text
SYMBOL EXPIRY STRIKE P/C
```

示例：

```text
AAPL 20250117 180 C
TSLA 20250620 200 P
```

解析结果包括：

- 基础标的
- 是否期权
- Call/Put
- 行权价
- 到期日

### 月度摘要

月度摘要综合以下来源：

- Trades
- Forex P/L Details
- Stock Yield Enhancement Program Securities Lent Interest Details
- Interest
- Fees

净额计算逻辑：

```text
optionsPL + stocksPL + forexPL + syepIncome + interest - commissions - fees
```

### 诊断警告

如果关键区块缺失，应用会在数据页和总览页给出警告。例如：

- 未找到 Account Information 区块。
- 未找到 Net Asset Value 区块。
- 未找到 Trades 区块。
- 未找到 Open Positions 区块。
- 文件结构不像标准 IBKR Activity Statement CSV。

## 常见问题

### 为什么中文 IBKR 报表不能直接解析？

当前解析器主要匹配英文区块名和字段名。中文报表的字段翻译可能随 IBKR 界面语言、地区和版本变化，直接解析容易产生错误结果。

因此应用检测到中文报表后会提示重新导出英文 Activity Statement。

### 为什么上传后显示缺少区块？

通常是导出报表时没有包含对应 section。请重新导出 Activity Statement，并确认包含 Net Asset Value、Open Positions、Trades、Realized & Unrealized Performance Summary 等区块。

### 为什么数值和 IBKR 页面不完全一致？

可能原因包括：

- 报表日期范围不同。
- 缺少部分 section。
- 多币种汇率数据缺失。
- IBKR 报表中的某些费用或调整项不在当前解析范围内。
- 浏览器本地解析和 IBKR 后台展示口径不同。

## 免责声明

IBKR Report Studio 仅用于个人报表整理、学习和辅助分析，不构成投资建议、税务建议或财务建议。

解析结果可能因为 IBKR 报表格式变化、字段缺失、汇率缺失、日期范围选择、浏览器解析差异或程序缺陷而不准确。请以 Interactive Brokers 官方报表和专业顾问意见为准。

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
