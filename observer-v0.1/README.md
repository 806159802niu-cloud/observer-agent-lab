# 观察者 Agent V0.1

观察者评的是**采访者的访谈表现**，不是受访者的性格。它读一段访谈记录，按五项评分口径给出逐项打分、证据原话、不确定性说明，以及能直接照着说出口的改进建议。

版本：V0.1（2026-10-30）｜负责人：牛畅

## V0.1 包含什么

| 文件 | 作用 |
| --- | --- |
| `rubric.json` | 五项评分口径的唯一真源（id、中文名、权重、看什么、何时无法判断）。改权重只改这里 |
| `packages/bundle/{headless,web-app}/cordis.patch.yml` | 观察者人格，六条原则写在组装层的 `personaPrefix`，未动上游 core |
| `tools/observer-console.mjs` | 控制台：连续对话、`/eval` 结构化评估、加权与缺项归一化 |
| `output-schema.json` | 评估输出的公开契约（JSON Schema），其他 Agent 与工作台按这个接 |
| `tools/samples/transcript-01.md` | 样例访谈记录（4 轮，含一处人工打断标记） |
| `tools/samples/eval-01.json` | 上面那份记录的真实评估输出，可直接拿来对接 |

## V0.1 明确不做什么

- **不做实时回流。** V0.1 只做访谈结束后的整段评分。边访谈边给采访者提示（hint）的方案已验证过方向，没进 V0.1。
- **不合成"信息获取"类指标。** 覆盖了多少埋点、有没有矛盾、还剩哪些待追问点，属于 V0.2 的第二层指标。
- **不改上游。** `packages/` 下的 DSH 实现零改动。
- **不给受访者贴标签，不推测没说出口的动机。**

## 输入与输出

输入是一段以 round 为单位的访谈记录（每轮含 1 到 N 条发言），纯文本。
输出是 `cw-observer/eval/v0.1`，字段定义见 `output-schema.json`。三条要紧的约定：

1. **评不出就是 `null`，不是 0。** 没有时间戳就不判"是否打断"，也不默认给中间分。缺数据的项要在 `note` 里写清缺什么。
2. **总分由本地算。** 加权与缺项归一化在 `observer-console.mjs` 里完成，不采信模型自报的数字。评不出的项从分母里剔除，重新归一化权重。
3. **`coverage` 比总分更要紧。** 它是评得出的项占的权重比例。coverage 低说明这份记录本身缺数据，总分再高也别拿去比。

## 三种用法

### 1. 网页里聊（可交互，推荐）

人格已同步进 `web-app` profile，起服务后在浏览器里直接跟观察者对话，上下文会保留。

```bash
cd Service_agents/observer
pnpm dsh web            # 会自动打开浏览器，并打印一个带 token 的本地地址
```

指定端口不想自动开浏览器：`pnpm dsh web --no-open --host 127.0.0.1 --port 5177`。

首次启动前需要构建一次前端产物（约几分钟，之后不用重复）：

```bash
pnpm run build:lib:client && pnpm run build:web
```

### 2. 控制台（终端里连续对话）

```bash
cd Service_agents/observer
node tools/observer-console.mjs
```

输入内容后空一行发送。内置命令：`/eval <文件>` 评估一段访谈记录、`/new` 开新会话、`/exit` 退出。会话 id 存在 `.observer-session`。

### 3. 单次评估一段访谈记录

```bash
node tools/observer-console.mjs eval tools/samples/transcript-01.md
```

按五项评分表（不打断 0.30、倾听与承接 0.25、问题开放性 0.20、节奏与尊重 0.15、洞察深度 0.10）输出每项得分、引用的原话、不确定性说明，以及最该改的几条建议。

前置条件：本包 `.env` 里有 `DEEPSEEK_API_KEY`；原生模块若报 `system.node` 缺失，先跑 `pnpm run build:native-system`。

## 验收：怎么确认 V0.1 是真的

```bash
node tools/observer-console.mjs eval tools/samples/transcript-01.md
```

三条判据，缺一条就不算过：

- 五项都出分，每项都带 `reason` 和 `quote`（能指出是哪句话让你这么判断）；
- 缺数据的项 `score` 是 `null`，且 `note` 写清缺什么，不是悄悄给个中间分；
- `suggestions` 每条具体到能照着改下一个提问，不写"应该多倾听"这类空话。

实测（2026-10-30，样例记录，DeepSeek 官方 key）：输出见 `tools/samples/eval-01.json`。其中"节奏与尊重"一项因没有时间戳判为 `null`，"问题开放性"因开场是二选一加贴标签、转场是诱导式确认而判 2 分——这两处正是这条人格里最要紧的判断。

## 已知限制

- 只有 `headless` 与 `web-app` 两个 profile 写入了观察者人格；`acp-app`、`sdk-app`、`sdk-minimal` 仍是上游默认的英文 coding agent。工作台接哪个 profile 就同步哪几份，动之前先问组长。
- 评估随模型波动，同一份记录两次跑可能差 0.2 上下。**不要用单次分数给采访者排名**，先看 `coverage`，再看趋势。
- "是否打断"依赖时间戳、话轮重叠或人工事件标记。纯文字记录下这一项永远是 `null`，这不是模型的错。

## 下一步

1. 把评分从提示词里挪进插件，让 `rubric.json` 真正驱动打分而不是只被读进 prompt（V0.2）。
2. 补第二层指标：信息获取的覆盖率、矛盾、待追问点。
3. 与工作台连接：`apps/workbench/bundles/observer.json` 现在是 mock 版（启发式打分，五项只有 id/name/weight）。V0.1 这套真评分接进去时，要用这里的 `rubric.json` 换掉那份简版。

## 阻塞

- 反馈时机与权限未细化（AGENTS.md 模块卡里明写"待细化"）：观察者是每轮都说话，还是访谈结束再说。V0.1 按"结束再评"做，实时方案等组长定。
- 数据单元口径：组长 2026-10-30 定为一轮（round）内含 1 到 N 条 utterance，评分以轮为单位，不要用 turn。

## 对上游 DSH 的本地改动（分叉记录）

| 文件 | 性质 | 说明 |
| --- | --- | --- |
| `driver.mts` | Parable 新增（上游无） | L1 单轮 headless 驱动：stdin JSON `{system, user, sessionId?, maxTokens?}` → stdout JSON `{text, ms, model}`；业务系统提示词以 complete section 成为唯一 system（屏蔽 harness 身份与工具协议段）；LLM 经 `dsh-llm-pi-ai` 手声明 OpenAI 兼容路由（`PARABLE_API_BASE`/`PARABLE_MODEL`/`DEEPSEEK_API_KEY`）。由 `apps/workbench/bridge.mjs` 的 `PARABLE_DRIVER=dsh` 模式 spawn。删除本文件即还原上游。 |
| `node_modules/` | pnpm install 产物 | gitignore，不提交。 |

上游其余文件零改动。packages/ 未分叉。
