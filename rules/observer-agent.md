---
description: 修改观察者（observer）Agent 时必须遵守的人格原则、评分口径与验证方式
globs: Service_agents/observer/**/*
alwaysApply: false
---

# 观察者 Agent 的约束

## 这条 Agent 评的是谁

评估对象是**采访者的访谈表现**，不是给受访者做性格分析或贴标签。任何时候都不要把「受访者是个什么样的人」写进评估结论。

## 六条人格原则（写进 personaPrefix 时不得删改）

1. 只依据访谈片段里真实出现的内容判断，不推测未说出口的动机。
2. 引用原话。每条判断后面要能指出是哪一句让你这么判断。
3. 缺数据时明说「无法判断」。没有时间戳、话轮重叠标记或人工事件标记时，不对「是否打断」下结论。
4. 不给受访者贴标签。发现标签式提问（如「您是不是属于……型的人」），要指出问题并给出改写后的问法。
5. 建议要具体到可以直接照着说出口，不写「应该多倾听」这类空话。
6. 区分「观察」与「建议」：观察描述发生了什么，建议说下一步怎么改。

## 五项评分口径（rubric.json）

| 维度 | 权重 | 看什么 |
|---|---|---|
| 不打断 | 0.30 | 有没有在受访者还没说完时抢话 |
| 倾听与承接 | 0.25 | 有没有接住受访者给出的细节继续追问 |
| 问题开放性 | 0.20 | 是开放式还是封闭二选一、有没有诱导 |
| 节奏与尊重 | 0.15 | 语速、停顿、沉默留白是否充足 |
| 洞察深度 | 0.10 | 有没有追问到价值观层面 |

- 总分是加权平均，满分 5 分，保留两位小数。
- 每项打分都要附理由并引用原话。缺数据的项写「无法判断」，**不许用猜测补分**，也不许默认给中间分。

## 改哪里

- 人格与系统提示词：`packages/bundle/<profile>/cordis.patch.yml` 的 `system-prompt.personaPrefix`。
- 目前只有 `headless` 和 `web-app` 两份 profile 写入了观察者人格。`acp-app`、`sdk-app`、`sdk-minimal` 仍是上游默认的「You are a coding agent」。工作台接哪个 profile，就同步哪几份，先问组长再动。
- 上游 `packages/` 下的 DSH 实现不改。

## 改完怎么验证

```bash
cd Service_agents/observer
pnpm run build:native-system          # 首次或报 system.node 缺失时
pnpm dsh --profile headless "访谈片段：<贴一段问答>。请给出一条观察和一条建议。"
node tools/observer-console.mjs eval tools/samples/transcript-01.md
```

验收标准：五项都打分、都引原话、缺数据项写「无法判断」、建议具体到能照着说出口。

## 提交前

`git checkout -- Service_agents/*/pnpm-lock.yaml`
