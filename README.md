# IBKR Report Studio

一个轻量的 IBKR Activity Statement 解析网站，参考 `premium-tracker` 的 CSV 区块解析方式重新设计。项目是纯静态前端，不需要安装依赖。

## 文件结构

```text
ibkr-report-studio/
  index.html
  assets/
    styles.css
    statement-preview.svg
  src/
    app.js
    parser.js
```

## 使用

直接用浏览器打开 `index.html`，上传 Interactive Brokers 导出的 Activity Statement CSV/TXT，或把 CSV 内容粘贴到输入框后点击解析。

也可以启动本地预览服务：

```bash
npm run serve
```

然后访问 `http://127.0.0.1:4177/`。

当前解析内容包括：

- Account Information、Statement、Net Asset Value
- Change in NAV
- Open Positions
- Trades
- Realized & Unrealized Performance Summary
- Interest、Fees、Forex P/L Details、SYEP Interest
- Mark-to-Market Performance Summary 中的 Forex 汇率

所有解析都在浏览器本地完成，导出 JSON 只包含汇总后的结构化数据。
