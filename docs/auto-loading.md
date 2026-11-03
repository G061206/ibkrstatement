# 本地与云盘报表自动加载与同步指南 (Automated Statement Loading Guide)

> **一站式指南**：本文档详细阐述了如何通过本地服务扩展与云端自动化任务，彻底免去手动登录 IBKR Client Portal 导出 CSV 的繁琐操作，实现**打开本地看板即自动呈现最新持仓、净值与历史复盘**，并自动生成结构化快照供 AI 深度复盘。

---

## 📖 目录
1. [核心背景与解决的痛点](#一核心背景与解决的痛点)
2. [数据流与底层工作原理](#二数据流与底层工作原理)
3. [本次变更文件及其作用](#三本次变更文件及其作用)
4. [报表目录规划与周期防重叠机制](#四报表目录规划与周期防重叠机制)
5. [保姆级快速配置全流程 (3 步搞定)](#五保姆级快速配置全流程-3-步搞定)
   - [第一步：IBKR 官方后台配置自动邮件投递](#第一步ibkr-官方后台配置自动邮件投递一次性)
   - [第二步：Google Apps Script 云端自动提取与同步](#第二步google-apps-script-云端自动提取与同步一次性)
   - [第三步：本地 Google Drive 客户端同步设置](#第三步本地-google-drive-客户端同步设置)
6. [日常启动与使用方式](#六日常启动与使用方式)
7. [平滑向下兼容与安全回退机制](#七平滑向下兼容与安全回退机制)
8. [进阶功能：AI 投资复盘快照](#八进阶功能ai-投资复盘快照)

---

## 一、核心背景与解决的痛点

`IBKR Analytics Studio` 是一个出色的 Local-first 工具，纯前端解析、隐私安全且支持多报表跨期合并。但在日常高频使用中存在一个明显的体验瓶颈：
* **每次复盘都要手动操作**：必须登录 IBKR 网页端、通过二次验证、找到报表菜单、选择周期、下载 CSV、再拖进浏览器。
* **多设备使用不同步**：如果在办公 Mac 和家用 Windows 上切换，报表文件无法自动同步。

**本方案的解决方式**：
利用 IBKR 官方的免费邮件订阅功能，配合轻量云端脚本，将每天生成的报表自动同步到 Google Drive（或本地文件夹），本地看板启动时自动扫描并合并，实现“零点击、打开即看”。

---

## 二、数据流与底层工作原理

```text
┌─────────────────────────────────────────────────────────────┐
│                 1. 盈透证券官方后台 (IBKR Portal)             │
│    - 每日结算后自动生成自定义 Activity Statement CSV            │
│    - 通过邮件附件自动投递至绑定的 Gmail 邮箱                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Email 自动推送，免开电脑)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             2. 云端自动化任务 (Google Apps Script)           │
│    - 运行在 Google 云端 (无需开机，7x24 小时待命)             │
│    - 自动解压/提取 CSV 附件，智能解析报表周期 (Period)          │
│    - 归档历史月报至 archive/，更新最新日报至 latest/ (防周期重叠) │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Google Drive 自动同步)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             3. 你的本地电脑 (Mac / Windows 挂载盘)            │
│    - Google Drive for Desktop 本地文件夹映射                 │
│    - 运行增强版 serve.mjs (原生 Node.js，无需任何 npm 依赖)    │
│    - 自动扫描目录，注入加载钩子，自动合并渲染看板               │
│    - 自动输出 IBKR_AI_Snapshot.json 供 AI 复盘              │
└─────────────────────────────────────────────────────────────┘
```

1. **为什么不需要 TWS / IB Gateway 客户端？**
   TWS Socket API 必须在电脑上一直挂着客户端，还要频繁双因素登录，且 API 不提供官方时间加权收益（TWR）、历史股息、利息等全量报表数据。而 Activity Statement 是盈透官方最全的审计级报表。
2. **零侵入前端核心**：
   `serve.mjs` 在返回 `/src/app.js` 时，会在尾部动态追加一段轻量异步加载钩子，直接调用项目原有的 `readFiles` 函数。前端原本的解析算法、多报表合并逻辑 100% 保持不变。

---

## 三、本次变更文件及其作用

本次变更严格遵循“零新增外部依赖、保持极简”的原则，仅涉及以下文件：

| 文件路径 | 变更类型 | 核心作用与职责 |
| :--- | :--- | :--- |
| **`serve.mjs`** | **核心修改** | 1. 扩展静态 HTTP 服务，增加 `/api/auto-statements` 和 `/api/statement-file` 接口；<br>2. 自动检测系统云盘路径（Mac `CloudStorage` / Windows `G:` 盘）及 `IBKR_STATEMENTS_DIR` 环境变量；<br>3. 拦截 `/src/app.js` 请求，无损注入自动加载钩子；<br>4. 接收前端解析后的快照并写入 `IBKR_AI_Snapshot.json`。 |
| **`start.command`** | **新增** | macOS 一键启动脚本：赋予执行权限后，在访达中**直接双击**即可自动识别云盘路径、拉起 Node 服务并自动弹开浏览器。 |
| **`start.bat`** | **新增** | Windows 一键启动脚本：在 Windows 文件资源管理器中**直接双击**即可自动匹配 `G:\我的云端硬盘`、启动服务并弹开浏览器。 |
| **`docs/auto-loading.md`** | **新增** | 本文档，为使用者提供完整、成体系的配置、使用与原理解释。 |
| **`scripts/ibkr_gmail_to_drive.js`** | **新增** | Google Apps Script 云端脚本源码：负责 7×24 小时监听 Gmail、提取 IBKR 附件并根据报表周期自动分流至云盘目录。 |

---

## 四、报表目录规划与周期防重叠机制

在本地或网盘中，报表目录结构如下：

```text
IBKR_Statements/
├── archive/              # 存放已完结的历史年报或月报 CSV（全部参与跨期累加）
├── latest/               # 存放日常导出的最新日报或当月 MTD 报表（服务按修改时间仅取最新 1 份）
└── IBKR_AI_Snapshot.json # 每次打开看板时自动生成的清洗后结构化总表，供 AI 深度复盘
```

### 为什么必须区分 `archive/` 和 `latest/`？
* `IBKR Analytics Studio` 具备严密的合并校验逻辑：**若两份报表的周期存在重叠，合并会报错**。
* 如果每天收到的日报都一股脑堆在一起，就会产生重叠（例如 11月1日报表与 11月2日报表重叠）。
* **解决方案**：服务端的算法确保 `archive/` 下的所有完整历史月报/年报全部载入，而 `latest/` 下**仅按修改时间提取最新 1 份日报**。这样就实现了“完整历史 + 最新当日数据”的完美拼接，永远不会冲突。

---

## 五、保姆级快速配置全流程 (3 步搞定)

### 第一步：IBKR 官方后台配置自动邮件投递（一次性）
1. 登录 IBKR 网页端 Client Portal，进入 **`Performance & Reports` (绩效与报表) > `Statements` (报表) > `Custom Statements` (自定义报表)**，点击 **`+`** 新建模板。
2. 基础配置：
   * **报表名称**：填入 `Daily_Statement`（或任意名称）。
   * **包含区块 (Sections)**：勾选所有常用板块（`Net Asset Value`、`Change in NAV`、`Open Positions`、`Trades`、`Realized & Unrealized Performance Summary`、`Dividends`、`Interest`、`Fees`、`Forex P/L Details`、`Base Currency Exchange Rate` 等）。
   * **盈亏口径**：`Profit and Loss` 选择 **`MTM and Realized P/L`**。
   * **文件格式与周期**：在 `Section Delivery Configuration` 中，将 **Format 设为 `CSV`**，**Period 设为 `Daily`**（也可按需建一份 `Monthly` 模板）。
3. 开启投递：
   * 进入 **`Statements Delivery` (已投递报表设置)**，点击齿轮图标。
   * 在刚创建的报表模板旁边勾选启用，交付方式选择 **`Email`**（附件发送）。保存退出。

---

### 第二步：Google Apps Script 云端自动提取与同步（一次性）
此步骤保证你的电脑哪怕关机，云端也会每天自动整理附件并同步到网盘：

1. 打开 [Google Apps Script 控制台](https://script.google.com/)，点击左上角 **「新项目」**。
2. 将本项目根目录下的 **`scripts/ibkr_gmail_to_drive.js`** 代码完整复制并替换到编辑器中。
3. 按 `Cmd + S` / `Ctrl + S` 保存项目。
4. 在顶部工具栏的函数下拉菜单中选择 **`setupAutoSync`**，点击 **「▷ 运行」**。
5. 首次运行会弹出权限授权窗口：点击「审查权限」→ 选择你的账号 → 点击「高级」→ 点击「转至项目（安全）」→ 点击「允许」。
6. 执行完毕后，日志会提示 `已成功注册每小时自动同步触发器`。此时打开你的 Google Drive，可以看到自动建好的 `IBKR_Statements/archive` 和 `IBKR_Statements/latest` 文件夹。至此云端配置完毕！

---

### 第三步：本地 Google Drive 客户端同步设置
在电脑上安装 [Google Drive 桌面端 (Google Drive for Desktop)](https://www.google.com/drive/download/) 并登录同一账号：
* **Mac 默认映射路径**：`~/Library/CloudStorage/GoogleDrive-你的邮箱/My Drive/IBKR_Statements`
* **Windows 默认映射路径**：`G:\我的云端硬盘\IBKR_Statements` 或 `G:\My Drive\IBKR_Statements`

---

## 六、日常启动与使用方式

配置完成后，以后日常使用无需打开终端敲命令：

### 1. 双击一键启动（推荐）
* **macOS**：在项目根目录**双击 `start.command`**。
* **Windows**：在项目根目录**双击 `start.bat`**。

脚本会自动扫描本地 Google Drive 目录，启动服务并立即唤起系统默认浏览器打开 `http://127.0.0.1:4187/`，直接呈现最新数据看板！

### 2. 命令行或自定义目录启动
若将报表存放在其他自定义路径，可在终端传参启动：
* **macOS / Linux**：
  ```bash
  IBKR_STATEMENTS_DIR="/你的自定义路径/IBKR_Statements" npm run serve
  ```
* **Windows (PowerShell)**：
  ```powershell
  $env:IBKR_STATEMENTS_DIR="D:\你的路径\IBKR_Statements"; npm run serve
  ```

---

## 七、平滑向下兼容与安全回退机制

本方案对原项目没有任何破坏性改动：
1. **零文件回退**：若指定的目录下没有任何 `.csv`/`.txt` 报表文件，前端不会报错，而是平滑显示原项目的**手动上传与文件拖拽界面**。
2. **强制手动模式**：即使目录下存在报表，只需在浏览器访问：
   👉 **`http://127.0.0.1:4187/?manual=1`**
   即可强制切换回手动模式，方便临时拖入外部其他测试报表。
3. **零外部 npm 依赖**：纯使用 Node.js 原生模块开发，项目依然保持无需 `npm install` 的极简特性。

---

## 八、进阶功能：AI 投资复盘快照

每次你打开本地看板完成合并后，系统都会在 `IBKR_Statements/` 目录下自动生成并更新一份 **`IBKR_AI_Snapshot.json`**。

原始 IBKR 报表的区块格式复杂、汇率换算容易引起大模型计算幻觉。这份快照是经过 `IBKR Analytics Studio` 严谨清洗、对齐货币口径并扣除佣金后的纯结构化 JSON，你可以将其直接提供给 ChatGPT、Claude、Gemini 或 NotebookLM：

**Prompt 示范**：
> “这是我由 IBKR 导出的最新交易与持仓结构化快照 `IBKR_AI_Snapshot.json`。请帮我分析：
> 1. 最近一个月的胜率、盈亏比与平均持仓周期；
> 2. 当前持仓的前三大集中度标的及行业风险敞口；
> 3. 统计期间总交易佣金占总毛利的比例，并给出降低交易损耗的优化建议。”
