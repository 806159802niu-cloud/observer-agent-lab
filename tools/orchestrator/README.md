# 编排器 demo（最小可跑版）

三个 Agent 自主跑完一场访谈，人在旁边看结果。这是「喊场的人」的第一个可运行版本。

## 怎么跑

```bash
# 单场，观察者提示回流给采访者
node tools/orchestrator/run.mjs --rounds 6 --mode assisted

# 单场，观察者只记录不回流（对照组）
node tools/orchestrator/run.mjs --rounds 6 --mode baseline

# 批量，加 tag 区分
node tools/orchestrator/run.mjs --rounds 4 --mode baseline --tag b1

# 换人物卡
node tools/orchestrator/run.mjs --persona tools/orchestrator/samples/persona-01.md

# 走 pnpm dsh（慢，每次带依赖检查，排错时用）
node tools/orchestrator/run.mjs --rounds 2 --pnpm
```

需要 `DEEPSEEK_API_KEY` 在三个包的 `.env` 里。本机跑要 `env -u NODE_OPTIONS`，否则子进程被工具删除保护拦截。

## 关键接口（实测确认，不是猜的）

```bash
cd Service_agents/<agent>
node --import tsx/esm apps/cli/src/bin.ts --profile headless [--session-id <id>] --json "<任务>"
```

- **首次调用不能带 `--session-id`**，带了会报 `session "xxx" does not exist`。第一行输出里取 id：`{"type":"session","sessionId":"session-xxx",...}`
- **后续调用带 `--session-id`**，上下文真的复用（实测第二轮能答出第一轮的原话，输出里 `turn` 递增）
- **结果在最后一行** `{"type":"final",...,"text":"..."}`
- **stdout 混着非 JSON 的噪音行**（例如 `[llm-deepseek-api-key] model listing ... loaded 2 model(s)`），解析时只取以 `{` 开头的行
- 绕过 `pnpm dsh` 直接调 CLI 可以省掉每次约 7 秒的依赖检查，`pnpm` 只在排错时用

这意味着编排器不需要 HTTP，也不需要改上游 core。跨三个目录各 spawn 一次，串起来就行。

## 三层边界（破了 demo 就没意义）

| 谁 | 拿得到什么 | 拿不到什么 |
|---|---|---|
| 采访者 | 访谈记录 + 观察者的 hint | **人物卡，一个字都不能有** |
| 受访者 | 人物卡 + 记录 | 观察者给的任何东西 |
| 观察者 | 访谈记录 | **人物卡，连埋点都不能看到** |

观察者看不到人物卡，这条是设计上的硬约束，不是遗漏。它一旦看到埋点，hint 就会直接指向没挖出来的答案，等于把考题答案递给考生。所以它的 hint 只能来自「受访者已经说出口、但没展开的线索」。

召回率因此只能由脚本在事后统计，不经过观察者。

## 输出

终端逐轮打印三方发言，观察者那行带加权分和覆盖率，hint 单独一行标出。结束后落盘到 `apps/workbench/records/`，JSON 和 Markdown 各一份，原子写入。

session 里记了这些：

- `mode`：`assisted` 还是 `baseline`
- `rounds`：每轮的 utterances 与本轮 observer 的 hint 和 eval
- `recall`：埋点召回，`hit / total`，以及没挖到的清单
- `isolationCheck`：隔离自检结果
- `agents`：三个 session id

## 实测结果（2026-10-30，各 3 场 4 轮，同一张人物卡）

| 模式 | 过程质量均分 | 埋点召回 |
|---|---|---|
| assisted（hint 回流） | 4.37 | 2.33 / 10 |
| baseline（不回流） | 3.97 | 3.00 / 10 |

**过程分更高的一场，挖到的信息反而更少。** 样本只有三场，不足以下结论，但这个反向关系本身就是一条硬证据：

只用一个总分衡量，会得出「assisted 更好」的判断。分层之后才看得见，提问技巧上去了，覆盖面下来了。这正是《观察者评分标准 v2 提案》要分三层的理由，不是理论推导，是跑出来的。

六场的隔离自检全部通过，采访者的输入里没有出现人物卡原文。

## 已知问题

1. **单场对比不可靠。** 两场 6 轮的分数出现过 baseline 反而更高的情况。提问路线不同、模型采样有随机性，一场说明不了问题。要下结论必须批量跑取平均。
2. **受访者会「出戏」。** 被追问到人物卡里没有的细节时，可能答出「人物卡里没有，不编」这类话，等于把机制暴露给采访者。已在 prompt 里加了两条底线压制，但仍需多跑观察是否彻底。
3. **停止条件只有轮数。** 现在靠 `--rounds` 硬停，没有「连续两轮没有新增判断依据就收尾」的判断。
4. **评分只用 L1 五项。** L2 信息获取（召回率）由脚本关键词匹配统计，比较粗糙，人物卡结构定稿后要换成正文语义判断。

## 下一步

- 批量跑并把结果汇总成一张表，看 assisted 与 baseline 的召回率差
- 加迭代追踪能力：训练 N 场后跑一次不带提示的测试场，分数涨了才算自加强
- 把《观察者评分标准 v2 提案》里的三层落进 observer 的输出
- 停止条件

## 相关文档

- `docs/观察者评分标准-v2提案.md`
- `docs/QA-常见问题.md`
- `Service_agents/observer/rubric.json`
