#!/bin/bash
# 双击这个文件就会打开终端，跑一场三 Agent 自主访谈。
# 参数可以在下面两行的提示里改，也可以直接改 DEFAULTS。

unset NODE_OPTIONS
export PATH="$HOME/.local/node/current/bin:$PATH"

REPO="/Users/niuchang/Documents/Parable-cognitive-worker"
cd "$REPO" || { echo "找不到仓库目录：$REPO"; exit 1; }

clear
echo "=========================================="
echo "  Parable 三 Agent 自主访谈"
echo "------------------------------------------"
echo "  采访者提问 → 受访者作答 → 观察者评分"
echo "  跑完会在 apps/workbench/records/ 留下记录"
echo "=========================================="
echo

read -p "跑几轮？（直接回车 = 6 轮） " R
R=${R:-6}

read -p "模式：a = 观察者给提示（默认）/ b = 不给提示的对照组 " M
case "$M" in
  b|B) MODE="baseline" ;;
  *)   MODE="assisted" ;;
esac

echo
echo "开始跑：${R} 轮，模式 ${MODE}"
echo "------------------------------------------"

node tools/orchestrator/run.mjs --rounds "$R" --mode "$MODE"

echo
echo "------------------------------------------"
echo "跑完了。记录在这个文件夹里："
echo "  $REPO/apps/workbench/records/"
echo "（最新的一次是刚才这场，JSON 和 Markdown 各一份）"
echo
read -p "按回车关闭窗口..."
