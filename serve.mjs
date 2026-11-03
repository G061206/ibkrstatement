import { createServer } from "node:http";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
const port = Number(process.env.PORT || 4187);
const host = "127.0.0.1";

// 本地自动导入目录配置（可通过环境变量 IBKR_STATEMENTS_DIR 指向 Google Drive 本地同步目录 IBKR_Statements）
const statementsRoot = normalize(
  process.env.IBKR_STATEMENTS_DIR
    ? process.env.IBKR_STATEMENTS_DIR
    : join(root, "statements")
);
const archiveDir = join(statementsRoot, "archive");
const latestDir = join(statementsRoot, "latest");
const aiSnapshotPath = join(statementsRoot, "IBKR_AI_Snapshot.json");

// 启动时自动创建目录结构
for (const dir of [statementsRoot, archiveDir, latestDir]) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png"
};

/**
 * 扫描指定目录下的所有 .csv / .txt 报表文件（不递归进入子目录）
 */
function listStatementFilesInDir(dirPath, bucket) {
  if (!existsSync(dirPath)) return [];
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;
    const ext = extname(entry.name).toLowerCase();
    if (ext !== ".csv" && ext !== ".txt") continue;

    const fullPath = join(dirPath, entry.name);
    const stat = statSync(fullPath);
    if (stat.size === 0) continue;

    const relToStatements = relative(statementsRoot, fullPath).split(sep).join("/");
    results.push({
      name: entry.name,
      relPath: relToStatements,
      url: `/api/statement-file?path=${encodeURIComponent(relToStatements)}`,
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      bucket
    });
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 构建自动加载的报表清单：
 * 1. statements/archive/ 下的所有历史归档报表（如年报、已完成月报）全部载入
 * 2. statements/ 根目录下的所有报表全部载入
 * 3. statements/latest/ 下仅取修改时间最新（mtime 最大）的 1 份报表（防止每日自动投递的多份当月 MTD 报表产生周期重叠报错）
 */
function getAutoStatementsList() {
  const archiveFiles = listStatementFilesInDir(archiveDir, "archive");
  const rootFiles = listStatementFilesInDir(statementsRoot, "root");
  const latestCandidates = listStatementFilesInDir(latestDir, "latest").sort(
    (a, b) => b.mtimeMs - a.mtimeMs
  );
  const latestFile = latestCandidates.length > 0 ? [latestCandidates[0]] : [];

  return [...archiveFiles, ...rootFiles, ...latestFile];
}

/**
 * 动态注入到 src/app.js 末尾的前端自动加载与 AI 复盘快照落盘钩子（零侵入原项目源码）
 */
const AUTO_LOAD_INJECTION = `
// === [Auto-Injected by serve.mjs: Gmail/Drive Auto-Loader & AI Snapshot Exporter] ===
(async function maybeAutoLoadLocalStatements() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sample") === "1" || params.get("manual") === "1") return;
  if (typeof state !== "undefined" && (state.data || state.importing)) return;

  try {
    const res = await fetch("/api/auto-statements", { cache: "no-store" });
    if (!res.ok) return;
    const payload = await res.json();
    if (!payload.files || payload.files.length === 0) return;

    const fileObjects = await Promise.all(
      payload.files.map(async (item) => {
        const fileRes = await fetch(item.url, { cache: "no-store" });
        if (!fileRes.ok) throw new Error(\`无法读取报表: \${item.name}\`);
        const blob = await fileRes.blob();
        return new File([blob], item.name, { type: "text/csv" });
      })
    );

    if (typeof readFiles === "function") {
      await readFiles(fileObjects, false);
      console.info(\`[Auto-Loader] 已自动加载并合并 \${fileObjects.length} 份本地 IBKR 报表:\`, payload.files.map(f => f.name));

      // 自动将合并后的结构化数据保存为 IBKR_AI_Snapshot.json 同步至 Google Drive，方便 AI 直接读取复盘
      if (typeof state !== "undefined" && state.data) {
        fetch("/api/save-ai-snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exportedAt: new Date().toISOString(),
            sourceFiles: payload.files.map(f => f.name),
            report: state.data
          })
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("[Auto-Loader] 自动加载本地报表失败，回退至手动上传界面:", err);
  }
})();
`;

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);

  // 1. 返回待自动加载的本地报表列表
  if (url.pathname === "/api/auto-statements" && request.method === "GET") {
    const files = getAutoStatementsList();
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(JSON.stringify({ statementsDir: statementsRoot, count: files.length, files }));
    return;
  }

  // 2. 接收前端合并后的完整结构化 JSON 并落盘至同步目录（供 AI 复盘直接读取）
  if (url.pathname === "/api/save-ai-snapshot" && request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) request.destroy();
    });
    request.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        writeFileSync(aiSnapshotPath, JSON.stringify(parsed, null, 2), "utf-8");
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ ok: true, savedTo: aiSnapshotPath }));
      } catch (err) {
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 3. 安全读取 statements 目录下的单个报表文件（支持外部 Google Drive 同步目录）
  if (url.pathname === "/api/statement-file" && request.method === "GET") {
    const rel = url.searchParams.get("path") || "";
    const targetPath = normalize(join(statementsRoot, rel));
    const statementsPrefix = statementsRoot.endsWith(sep)
      ? statementsRoot
      : `${statementsRoot}${sep}`;

    if (
      !targetPath.startsWith(statementsPrefix) ||
      !existsSync(targetPath) ||
      !statSync(targetPath).isFile()
    ) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Statement file not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(targetPath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(targetPath).pipe(response);
    return;
  }

  const requestedPath = decodeURIComponent(
    url.pathname === "/" ? "/index.html" : url.pathname
  );
  const filePath = normalize(join(root, requestedPath));

  if (
    !filePath.startsWith(rootPrefix) ||
    !existsSync(filePath) ||
    !statSync(filePath).isFile()
  ) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  // 4. 拦截 /src/app.js，在末尾无损追加自动加载逻辑（无需修改原仓库 src/app.js）
  if (requestedPath === "/src/app.js") {
    const originalCode = readFileSync(filePath, "utf-8");
    response.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(`${originalCode}\n${AUTO_LOAD_INJECTION}`);
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`IBKR Analytics Studio: http://${host}:${port}/`);
  console.log(`Google Drive Sync Directory: ${statementsRoot}`);
  console.log(`  ├── archive/              (历史年报/月报归档，全部参与合并)`);
  console.log(`  ├── latest/               (每日自动投递报表，自动只取最新1份避免重叠)`);
  console.log(`  └── IBKR_AI_Snapshot.json (前端合并后自动生成的结构化复盘数据，供 AI 直接读取)`);
});