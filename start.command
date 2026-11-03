#!/bin/bash
cd "$(dirname "$0")"

GDRIVE_DIR=$(find "$HOME/Library/CloudStorage" -maxdepth 1 -name "GoogleDrive-*" 2>/dev/null | head -n 1)

if [ -n "$GDRIVE_DIR" ] && [ -d "$GDRIVE_DIR/My Drive/IBKR_Statements" ]; then
  export IBKR_STATEMENTS_DIR="$GDRIVE_DIR/My Drive/IBKR_Statements"
elif [ -n "$GDRIVE_DIR" ] && [ -d "$GDRIVE_DIR/我的云端硬盘/IBKR_Statements" ]; then
  export IBKR_STATEMENTS_DIR="$GDRIVE_DIR/我的云端硬盘/IBKR_Statements"
else
  export IBKR_STATEMENTS_DIR="./statements"
fi

echo "正在启动 IBKR 看板..."
echo "报表同步目录: $IBKR_STATEMENTS_DIR"

open "http://127.0.0.1:4187/"
node serve.mjs
