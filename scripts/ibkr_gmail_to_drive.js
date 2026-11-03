/**
 * IBKR Activity Statement — Gmail 附件自动提取并归档至 Google Drive 脚本
 *
 * 核心功能：
 * 1. 自动在 Google Drive 根目录创建：
 *    IBKR_Statements/
 *      ├── archive/  （存放已完结的月度/年度 CSV 报表，永久归档供多周期合并与 AI 复盘）
 *      └── latest/   （存放每日/当月 MTD 增量 CSV 报表，自动清理旧日报，仅保留最新一份避免周期重叠）
 * 2. 自动搜索 Gmail 中来自 Interactive Brokers 且包含 .csv / .txt / .zip 附件的未同步邮件。
 * 3. 自动解析 CSV 内部的 Statement Period（报表周期），智能判断应当归入 archive/ 还是 latest/。
 * 4. 处理完成后自动为邮件打上 "IBKR-Synced" 标签，避免重复处理。
 * 5. 提供一键初始化函数 setupAutoSync()，自动完成文件夹创建、首次同步及每小时定时触发器注册。
 */

const CONFIG = {
  // Gmail 搜索条件：匹配 IBKR 官方发件域名、包含附件且尚未打上已同步标签的邮件
  gmailQuery: 'from:(interactivebrokers.com) has:attachment -label:IBKR-Synced',
  syncedLabelName: 'IBKR-Synced',
  rootFolderName: 'IBKR_Statements',
  archiveSubfolderName: 'archive',
  latestSubfolderName: 'latest',
  // 是否在 latest/ 目录更新时将旧的日常报表移入回收站（保持 latest/ 下只有最新 1 份报表）
  cleanOldLatestFiles: true
};

/**
 * 【首次使用请在上方下拉菜单选择运行此函数】
 * 一键完成：创建云盘目录 -> 创建 Gmail 标签 -> 执行首次同步 -> 注册每小时自动运行触发器
 */
function setupAutoSync() {
  ensureFolders_();
  ensureGmailLabel_(CONFIG.syncedLabelName);
  syncIbkrStatementsFromGmail();

  // 检查是否已存在定时触发器，避免重复创建
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(
    (t) => t.getHandlerFunction() === 'syncIbkrStatementsFromGmail'
  );
  if (!exists) {
    ScriptApp.newTrigger('syncIbkrStatementsFromGmail')
      .timeBased()
      .everyHours(1)
      .create();
    Logger.log('已成功注册每小时自动同步触发器：syncIbkrStatementsFromGmail');
  } else {
    Logger.log('定时触发器已存在，无需重复注册。');
  }
}

/**
 * 定时执行的主同步函数（每小时自动运行，也可手动点击运行）
 */
function syncIbkrStatementsFromGmail() {
  const folders = ensureFolders_();
  const label = ensureGmailLabel_(CONFIG.syncedLabelName);
  const threads = GmailApp.search(CONFIG.gmailQuery, 0, 30);

  if (!threads || threads.length === 0) {
    Logger.log('未发现新的 IBKR 报表邮件。');
    return;
  }

  // 按时间从旧到新处理邮件，确保最新一封邮件的附件最后写入 latest/
  const sortedThreads = threads.slice().reverse();

  for (const thread of sortedThreads) {
    const messages = thread.getMessages();
    let threadSavedCount = 0;

    for (const message of messages) {
      const msgDate = message.getDate();
      const subject = message.getSubject() || '';
      const attachments = message.getAttachments();

      for (const att of attachments) {
        const extractedBlobs = extractStatementBlobs_(att);
        for (const blob of extractedBlobs) {
          const saved = routeAndSaveStatement_(blob, subject, msgDate, folders);
          if (saved) threadSavedCount++;
        }
      }
    }

    if (threadSavedCount > 0) {
      thread.addLabel(label);
      Logger.log(`已处理邮件会话 [${thread.getFirstMessageSubject()}]，共保存 ${threadSavedCount} 份报表。`);
    }
  }
}

/**
 * 从附件中提取 .csv 或 .txt Blob（支持直接附件或 .zip 压缩包解压）
 */
function extractStatementBlobs_(attachment) {
  const name = attachment.getName() || '';
  const lower = name.toLowerCase();
  const results = [];

  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    results.push(attachment.copyBlob());
  } else if (lower.endsWith('.zip')) {
    try {
      const unzipped = Utilities.unzip(attachment.copyBlob());
      for (const b of unzipped) {
        const bName = (b.getName() || '').toLowerCase();
        if (bName.endsWith('.csv') || bName.endsWith('.txt')) {
          results.push(b);
        }
      }
    } catch (e) {
      Logger.log(`解压附件 ${name} 失败: ${e.message}`);
    }
  }
  return results;
}

/**
 * 解析 CSV 前 30 行中的 Statement Period，判断是历史归档报表（月报/年报）还是日常更新报表（Daily/MTD）
 */
function classifyStatement_(csvPreview, subject) {
  const lines = csvPreview.split(/\r?\n/).slice(0, 30);
  let periodValue = '';

  for (const line of lines) {
    if (
      line.startsWith('Statement,Data,Period,') ||
      line.startsWith('声明,Data,期间,') ||
      line.startsWith('聲明,Data,期間,')
    ) {
      const parts = line.split(',');
      periodValue = parts.slice(3).join(',').replace(/^"|"$/g, '').trim();
      break;
    }
  }

  const lowerSub = (subject || '').toLowerCase();
  if (lowerSub.includes('monthly') || lowerSub.includes('annual') || lowerSub.includes('月度') || lowerSub.includes('年度')) {
    return { bucket: 'archive', period: periodValue || 'monthly' };
  }

  if (
    /^[A-Za-z]+\s+\d{4}$/.test(periodValue) ||
    /^\d{4}-\d{2}$/.test(periodValue) ||
    /^\d{4}$/.test(periodValue) ||
    /January 1,\s*(\d{4})\s*-\s*December 31,\s*\1/i.test(periodValue)
  ) {
    return { bucket: 'archive', period: periodValue };
  }

  return { bucket: 'latest', period: periodValue || 'latest' };
}

/**
 * 将报表保存至对应的 Google Drive 子目录（archive/ 或 latest/）
 */
function routeAndSaveStatement_(blob, subject, msgDate, folders) {
  const rawBytes = blob.getBytes();
  if (!rawBytes || rawBytes.length === 0) return false;

  const previewBytes = rawBytes.slice(0, Math.min(rawBytes.length, 2048));
  const previewText = Utilities.newBlob(previewBytes).getDataAsString('UTF-8');

  if (
    !previewText.includes('Statement,Header') &&
    !previewText.includes('声明,Header') &&
    !previewText.includes('聲明,Header') &&
    !previewText.includes('Account Information')
  ) {
    Logger.log(`跳过非 IBKR 活动报表附件: ${blob.getName()}`);
    return false;
  }

  const classification = classifyStatement_(previewText, subject);
  const dateStr = Utilities.formatDate(msgDate, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const originalName = (blob.getName() || 'statement.csv').replace(/[^a-zA-Z0-9._-]/g, '_');
  const safePeriod = classification.period
    ? classification.period.replace(/[^a-zA-Z0-9_-]/g, '_')
    : dateStr;

  if (classification.bucket === 'archive') {
    const fileName = `IBKR_Archive_${safePeriod}_${originalName}`;
    const existing = folders.archive.getFilesByName(fileName);
    if (existing.hasNext()) {
      Logger.log(`归档报表已存在，跳过: ${fileName}`);
      return true;
    }
    blob.setName(fileName);
    folders.archive.createFile(blob);
    Logger.log(`已归档历史月报/年报至 archive/: ${fileName}`);
  } else {
    const fileName = `IBKR_Latest_${dateStr}_${originalName}`;
    if (CONFIG.cleanOldLatestFiles) {
      const oldFiles = folders.latest.getFiles();
      while (oldFiles.hasNext()) {
        const oldFile = oldFiles.next();
        oldFile.setTrashed(true);
      }
    }
    blob.setName(fileName);
    folders.latest.createFile(blob);
    Logger.log(`已更新最新报表至 latest/: ${fileName}`);
  }

  return true;
}

/**
 * 确保 Google Drive 中存在 IBKR_Statements 及其 archive/、latest/ 子文件夹
 */
function ensureFolders_() {
  const rootIter = DriveApp.getFoldersByName(CONFIG.rootFolderName);
  const rootFolder = rootIter.hasNext()
    ? rootIter.next()
    : DriveApp.createFolder(CONFIG.rootFolderName);

  const archiveIter = rootFolder.getFoldersByName(CONFIG.archiveSubfolderName);
  const archiveFolder = archiveIter.hasNext()
    ? archiveIter.next()
    : rootFolder.createFolder(CONFIG.archiveSubfolderName);

  const latestIter = rootFolder.getFoldersByName(CONFIG.latestSubfolderName);
  const latestFolder = latestIter.hasNext()
    ? latestIter.next()
    : rootFolder.createFolder(CONFIG.latestSubfolderName);

  return {
    root: rootFolder,
    archive: archiveFolder,
    latest: latestFolder
  };
}

/**
 * 确保 Gmail 中存在指定标签
 */
function ensureGmailLabel_(labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }
  return label;
}
