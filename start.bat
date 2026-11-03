@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: 自动检测 Google Drive 挂载路径（优先尝试 G 盘，若改过盘符也可手动修改）
if exist "G:\我的云端硬盘\IBKR_Statements" (
    set "IBKR_STATEMENTS_DIR=G:\我的云端硬盘\IBKR_Statements"
) else if exist "G:\My Drive\IBKR_Statements" (
    set "IBKR_STATEMENTS_DIR=G:\My Drive\IBKR_Statements"
) else (
    echo [提示] 未检测到 G 盘的 Google Drive，使用默认本地 statements 目录
    set "IBKR_STATEMENTS_DIR=%~dp0statements"
)

echo 正在启动 IBKR Analytics Studio...
echo 数据同步目录: %IBKR_STATEMENTS_DIR%

start http://127.0.0.1:4187/
node serve.mjs
pause
