---
description: 本机开发环境约束、依赖安装坑位、分支与提交纪律、访谈数据模型口径
globs: **/*
alwaysApply: true
---

# 本项目在本机的开发约束

## 环境（不要另装版本）

- Node：24.22.2，已装在 `~/.local/node/current/bin`，PATH 已前置。不要用 nvm，也不要改动 `~/.workbuddy/` 下的 Node。
- pnpm：**必须是 11.28.5**（仓库 `packageManager` 已锁定）。用 12.x 会自动下载并校验 11.28.5，国内网络下校验必失败。
- 三个包 `Service_agents/{interviewer,observer,respondent}` 是**三份独立副本**，依赖各自安装、命令各自执行，根目录没有 workspace，不要在根目录跑 `pnpm install`。

## 依赖安装的两个坑（会卡半小时以上）

1. `xlsx` 依赖指向 `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`，国内速度 5–26 KB/s，pnpm 默认 60 秒超时必失败。
   完整的包已存在本机 `~/.local/share/offline-tarballs/xlsx-0.20.3.tgz`，其 sha512 与 lockfile 一致。
   装依赖时：先 `pnpm install --fetch-timeout=600000`；若仍卡在 xlsx，临时把
   `packages/client/ui-sidebar-documentpreview/package.json` 里的该条改成 `file:/Users/niuchang/.local/share/offline-tarballs/xlsx-0.20.3.tgz`，
   装完**必须**用 `git checkout --` 还原 package.json 与 pnpm-lock.yaml。不要把 `file:` 路径提交进仓库。
2. 原生模块不预编译。首次运行报 `Cannot find module .../native/system/packages/darwin-arm64/bin/system.node` 时，在该包目录执行
   `pnpm run build:native-system`（约 3 秒，用系统 clang，不需要 Xcode）。

## 分支与提交纪律

- 禁止直接提交到 `main`。开工前先 `git checkout -b feat/<任务名>`，完成后走 PR 评审。
- `pnpm install` 和 `pnpm dsh` 都会顺手改三个 `pnpm-lock.yaml`（删掉一批 importer，因为上游 benchmarks 等目录未纳入本仓库）。
  **提交前必须还原**：`git checkout -- Service_agents/*/pnpm-lock.yaml`，否则 PR 里会混进大量无关 diff。
- 只提交 `.env.example`，`.env` 永不入库；密钥走环境变量。三个包各自一份 `.env`，不要共用。

## 密钥与运行

- 各包 `.env` 里配 `DEEPSEEK_API_KEY`（当前用 DeepSeek 官方 key），可选 `DEEPSEEK_BASE_URL`。
- 跑一次对话验证：在该包目录执行
  `pnpm dsh --profile headless "只回复一句话：已就绪"`。
- `headless` profile 会禁用凭据存储，只读启动环境变量与项目 `.env`，不读 `~/.dsh/.credentials.yaml`。

## 非交互调用三个 Agent（写编排器时用它，已实测）

三个 Agent 都能用一条命令做**单次往返**，这是编排器串起一场访谈的基础，不需要 HTTP，也不需要改上游：

```bash
cd Service_agents/<agent>
pnpm dsh --profile headless [--session-id <id>] --json "<任务>"
```

- `--json` 让输出结构化，便于程序解析。先跑一次确认输出外形的字段名，再写解析逻辑，不要凭猜。
- `--session-id` 复用同一会话上下文。一场访谈里**每个 Agent 各持一个 session id**，全程不变；换 session id 等于清空上下文。
- **首次调用不能带 `--session-id`**，带了会报 `session "xxx" does not exist`。先不带它跑一次，从输出第一行 `{"type":"session","sessionId":"session-xxx"}` 取 id，之后再用这个 id 复用。
- 结果文本在**最后一行** `{"type":"final",...,"text":"..."}`。
- stdout 混着非 JSON 的噪音行（如 `[llm-deepseek-api-key] model listing ... loaded 2 model(s)`），解析时只取以 `{` 开头的行。
- 可绕过 `pnpm` 直接调 CLI，省掉每次约 7 秒的依赖检查：
  `node --import tsx/esm apps/cli/src/bin.ts --profile headless [--session-id <id>] --json "<任务>"`（cwd 指到该包目录）。排错时才用 `pnpm dsh`。
- 本机跑子进程要 `env -u NODE_OPTIONS`，否则被工具删除保护拦截。
- 现有参考实现：`Service_agents/observer/tools/observer-console.mjs`，以及**编排器 `tools/orchestrator/run.mjs`**（跑得通的完整版本，优先照抄它）。
- 三个包目录不同（interviewer / observer / respondent），编排器要**跨目录各 spawn 一次**，cwd 指到对应包目录。

## 三个 Agent 的信息边界（破了整个系统就没意义）

| 谁 | 拿得到 | 拿不到 |
|---|---|---|
| 采访者 | 访谈记录 + 观察者的 hint | **人物卡，一个字都不能有** |
| 受访者 | 人物卡 + 记录 | 观察者给的任何东西 |
| 观察者 | 访谈记录 | **人物卡，连埋点都不能看到** |

观察者看不到人物卡，是设计约束，不是遗漏。它一旦看到埋了哪些关键信息，hint 就会直接指向没挖出来的那几条，等于把考题答案递给考生。所以它的 hint 只能来自「受访者已经说出口、但没展开的线索」。

埋点召回率因此只能由脚本在事后统计，不能交给观察者判断。

## 实时模式的输出分两层（2026-10-30 定，防自证污染）

观察者介入访谈时，输出必须拆成两份，混在一起会毁掉分数的可比性：

- `hint`（**回流给采访者**）：只说问题类型与追问方向，例如「受访者停在结论了，往下追一次他当时的判断依据」。**不给原句改写**，让采访者自己组织语言。
- `eval`（**只进记录，不回流**）：完整评分与改写建议，供事后复盘与横向比较。

落盘时记录 `mode: "assisted" | "baseline"`，说明这一场有没有被观察者介入。带介入的分数衡量的是辅助后的结果，不能当作这个采访者的真实水平。

## 修改边界（来自 AGENTS.md 与 Service_agents/README.md）

- 只改**组装层**：`packages/bundle/<profile>/cordis.patch.yml` 里的 `personaPrefix`（人格与系统提示词）、策略插件、评分插件。
- 不改上游 core（`packages/*` 下的 DSH 原生实现）。需要改上游时，先提出理由与影响面，等团队确认。
- 写代码与评审代码，另见 `.trae/rules/coding-checklist.md` 的八条清单（强类型、枚举、缺值与零值、纯函数边界、留痕、先定接口、整体验证、加 Agent 前定契约）。

## 访谈数据模型口径（组长 2026-10-30 定，待 PR 确认）

- **一轮访谈（round）不等于一问一答**。round 内含 1 到 N 条发言（utterance），追问、补充、无回应、打断后插话都算，不要求一定有来有回。
- 每条 utterance 标注说话人（interviewer / respondent / observer）；评分以 **round** 为单位，不以单条发言为单位。
- 不要再引入 `turn` 作为数据单元；历史数据里若出现 turn，迁移为 `round + utterances`。

## 访谈记录落盘

- 访谈结束后自动落盘到 `apps/workbench/records/`，JSON + Markdown 各一份，**原子写入**（先写临时文件再 rename，避免中途失败留下半个文件）。
- 文件名带时间戳与访谈 ID，便于按场次检索。
