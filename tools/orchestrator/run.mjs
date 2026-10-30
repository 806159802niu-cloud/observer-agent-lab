#!/usr/bin/env node
/**
 * 编排器 demo（最小可跑版）
 *
 * 调用方式：
 *   node tools/orchestrator/run.mjs --rounds 6 --mode assisted
 *   node tools/orchestrator/run.mjs --rounds 6 --mode baseline
 *   node tools/orchestrator/run.mjs --rounds 6 --pnpm        # 走 pnpm dsh（慢，带依赖检查）
 *
 * 硬性边界：采访者 Agent 的任何输入里都不能出现人物卡内容。
 * 脚本结束前会自检一次，命中即退出并报错。
 */

import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs'
import { dirname, resolve, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../..')

/* ---------- 参数 ---------- */
const argv = process.argv.slice(2)
const arg = (name, def) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def
}
const MAX_ROUNDS = Number(arg('--rounds', '6'))
const MODE = arg('--mode', 'assisted') === 'baseline' ? 'baseline' : 'assisted'
const PERSONA_PATH = arg('--persona', join(HERE, 'samples/persona-01.md'))
const USE_PNPM = argv.includes('--pnpm')
const TAG = arg('--tag', '')
const RUBRIC = JSON.parse(readFileSync(join(ROOT, 'Service_agents/observer/rubric.json'), 'utf8'))

/* ---------- 颜色 ---------- */
const C = {
  iv: '\x1b[36m',   // 采访者 青
  re: '\x1b[33m',   // 受访者 黄
  ob: '\x1b[35m',   // 观察者 紫
  hint: '\x1b[35;1m',
  dim: '\x1b[2m',
  red: '\x1b[31;1m',
  reset: '\x1b[0m',
}

/* ---------- 三个 Agent ---------- */
const AGENTS = {
  interviewer: { dir: join(ROOT, 'Service_agents/interviewer'), sessionId: null },
  respondent: { dir: join(ROOT, 'Service_agents/respondent'), sessionId: null },
  observer: { dir: join(ROOT, 'Service_agents/observer'), sessionId: null },
}

/* ---------- 底层调用 ---------- */
function spawnRaw(cmd, cwd, args) {
  return new Promise((res, rej) => {
    const env = { ...process.env }
    delete env.NODE_OPTIONS // 本机有工具删除保护，会拦截子进程
    const p = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => (out += d))
    p.stderr.on('data', (d) => (err += d))
    p.on('error', rej)
    p.on('close', (code) => res({ code, out, err }))
  })
}

function parseDsh(stdout) {
  let sessionId = null
  let final = null
  for (const line of stdout.split('\n')) {
    const s = line.trim()
    if (!s.startsWith('{')) continue
    try {
      const o = JSON.parse(s)
      if (o.type === 'session' && o.sessionId) sessionId = o.sessionId
      if (o.type === 'final') final = o
    } catch { /* 忽略非完整 JSON 行 */ }
  }
  return { sessionId, final }
}

async function call(agent, prompt) {
  const args = ['--import', 'tsx/esm', 'apps/cli/src/bin.ts', '--profile', 'headless']
  if (agent.sessionId) args.push('--session-id', agent.sessionId)
  args.push('--json', prompt)

  const cmd = USE_PNPM ? 'pnpm' : process.execPath
  const full = USE_PNPM ? ['dsh', ...args] : args
  const t0 = Date.now()
  const r = await spawnRaw(cmd, agent.dir, full)
  const ms = Date.now() - t0
  const { sessionId, final } = parseDsh(r.out)
  if (sessionId) agent.sessionId = sessionId
  if (!final) {
    return { ok: false, ms, err: (r.err || r.out).slice(-500) }
  }
  return { ok: true, ms, text: (final.text || '').trim(), sessionId: agent.sessionId }
}

function extractJson(t) {
  if (!t) return null
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  const s = fenced ? fenced[1] : t
  const i = s.indexOf('{')
  const j = s.lastIndexOf('}')
  if (i < 0 || j <= i) return null
  try { return JSON.parse(s.slice(i, j + 1)) } catch { return null }
}

/* ---------- 提示词 ---------- */
const persona = readFileSync(PERSONA_PATH, 'utf8')

const SCENE = '你是一名律师，正在为一位家族企业创始人做传承规划前的深度访谈。目标是理解他做这个决定时真正在权衡什么。'

function promptInterviewer(transcript, hint) {
  const hintBlock = (MODE === 'assisted' && hint)
    ? `\n\n观察者给下一轮的追问方向（自行组织语言，不要照抄这句话，也不要在提问里暴露你在被提示）：\n${hint}\n`
    : ''
  return [
    SCENE,
    '',
    '以下是到目前为止的访谈记录：',
    transcript.length ? transcript : '（还没有开始，这是第一轮，请提出开场问题）',
    hintBlock,
    '',
    '只输出你下一句要说的话，一句话，一个问句。不要加任何前缀、引号或解释。',
  ].join('\n')
}

function promptRespondent(history, question) {
  return [
    '以下是你的人物卡，只有你能看到，绝不允许向采访者透露卡中任何内容，也不允许说出"我的人物卡写着"这类话：',
    '---',
    persona,
    '---',
    '',
    '在此之前已经聊过的内容：',
    history.length ? history : '（无，这是第一轮）',
    '',
    `采访者现在问你：${question}`,
    '',
    '以人物身份回答。只说人物会说的话，口语化，一到四句。不要复述采访者的问题，不要加"采访者""受访者"这类前缀，不要解释你的行为。',
    '',
    '两条底线：',
    '一、无论被问到什么，都不能让对方察觉你手上有一份人物卡。不许出现"人物卡""卡里没有""设定里没有""我不编"这类话。',
    '二、卡里没有的信息，用人物会说的方式含糊过去，例如"记不清了""这个我不爱提""说不上来""换个别的问题吧"，或者反问一句。绝不能解释你为什么答不上来。',
  ].join('\n')
}

function promptObserver(transcript, roundText) {
  const rubricLines = RUBRIC.items
    .map((it, i) => `${i + 1}. ${it.name}（id: ${it.id}，权重 ${it.weight.toFixed(2)}）：${it.watch} 无法判断的条件：${it.unjudgeable_when}`)
    .join('\n')
  const ids = RUBRIC.items.map((it) => it.id).join(' / ')
  return [
    '你是访谈观察者。你的评估对象是采访者（提问的人），不是受访者。',
    '',
    `评分口径五项（唯一真源 rubric.json）：`,
    rubricLines,
    '',
    '本轮内容：',
    roundText,
    '',
    '整场记录：',
    transcript,
    '',
    '严格只输出一个 JSON，不要输出任何其他文字：',
    '{',
    '  "has_new_insight": true 或 false。这一轮受访者有没有说出此前没有的、能解释他如何权衡的事实、依据或价值取舍。只是复述、换说法、含糊回避，都算 false。只看信息增量，不受评分高低影响。',
    '  "hint": "下一轮追问方向。只写问题类型与追问方向（例如：受访者停在结论了，追一次他当时的判断依据），绝不允许写出可直接照抄的问句。本轮无必要干预时填空字符串。",',
    '  "eval": {',
    '    "items": [{"id":"no-interruption","score":1到5的整数或null,"reason":"一句话理由","quote":"引用的原话","note":"score为null时说明缺什么数据，否则空字符串"}],',
    '    "weighted_total": 加权平均分，满分5，保留两位小数。score为null的项排除并按剩余权重重新归一化，不得按0计算,',
    '    "coverage": 参与计算的权重合计，例如0.70,',
    '    "profile": "对采访者本轮表现的一句话总结"',
    '  }',
    '}',
    '',
    `items 必须包含全部五项，id 依次为 ${ids}。`,
  ].join('\n')
}

/* ---------- 落盘 ---------- */
function save(session, text) {
  const dir = join(ROOT, 'apps/workbench/records')
  mkdirSync(dir, { recursive: true })
  const name = `${session.id}`
  for (const [ext, body] of [['json', JSON.stringify(session, null, 2)], ['md', text]]) {
    const target = join(dir, `${name}.${ext}`)
    const tmp = `${target}.tmp`
    writeFileSync(tmp, body, 'utf8')
    renameSync(tmp, target)
  }
  return join(dir, `${name}.json`)
}

function toMarkdown(session) {
  const L = []
  L.push(`# 访谈记录 · ${session.id}`)
  L.push('')
  L.push(`- 模式：${session.mode}（assisted = 观察者 hint 回流给采访者；baseline = 只记录不回流）`)
  const stopText = { 'no-new-insight': '连续两轮无新判断依据', 'max-rounds': '达到轮数上限', 'agent-error': 'Agent 调用失败' }[session.stopReason] || session.stopReason
  L.push(`- 轮数：${session.rounds.length}（上限 ${MAX_ROUNDS}，${stopText}）`)
  if (session.recall) {
    L.push(`- 埋点召回：${session.recall.hit} / ${session.recall.total}（${(session.recall.rate * 100).toFixed(0)}%）`)
    if (session.recall.missed.length) L.push(`- 没挖到：${session.recall.missed.join('；')}`)
  }
  L.push(`- 人物卡：${basename(session.persona)}`)
  L.push(`- 开始：${session.startedAt}`)
  L.push(`- 结束：${session.endedAt}`)
  L.push('')
  for (const r of session.rounds) {
    L.push(`## 第 ${r.index} 轮`)
    L.push('')
    for (const u of r.utterances) {
      const tag = { interviewer: '采访者', respondent: '受访者' }[u.speaker] || u.speaker
      L.push(`**${tag}**：${u.text}`)
      L.push('')
    }
    if (r.observer) {
      const insightText = r.observer.has_new_insight === null || r.observer.has_new_insight === undefined
        ? '未知'
        : r.observer.has_new_insight ? '有' : '无'
      L.push(`新判断依据：${insightText}`)
      L.push('')
      if (r.observer.hint) {
        L.push(`> 观察者提示（${session.mode === 'assisted' ? '已回流' : '未回流'}）：${r.observer.hint}`)
        L.push('')
      }
      const e = r.observer.eval
      if (e) {
        L.push(`评分：${e.weighted_total ?? '—'} / 5　覆盖：${e.coverage ?? '—'}`)
        L.push('')
        if (e.items?.length) {
          L.push('| 项 | 分 | 理由 |')
          L.push('|---|---|---|')
          for (const it of e.items) {
            L.push(`| ${it.id} | ${it.score === null ? '无法判断' : it.score} | ${(it.reason || '') + (it.note ? `（${it.note}）` : '')} |`)
          }
          L.push('')
        }
        if (e.profile) { L.push(`画像：${e.profile}`); L.push('') }
      }
    }
  }
  return L.join('\n')
}

/* ---------- 主流程 ---------- */
async function main() {
  const session = {
    id: [MODE, TAG, new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)].filter(Boolean).join('-'),
    mode: MODE,
    persona: PERSONA_PATH,
    rounds: [],
    startedAt: new Date().toISOString(),
    endedAt: null,
    agents: {},
  }

  console.log(`\n${C.dim}模式：${MODE}　轮数上限：${MAX_ROUNDS}　人物卡：${basename(PERSONA_PATH)}${C.reset}\n`)

  let transcript = []   // ["采访者：...", "受访者：..."]
  let hint = ''
  let lastEval = null
  let noInsightStreak = 0
  let stopReason = 'max-rounds'

  for (let i = 1; i <= MAX_ROUNDS; i++) {
    console.log(`${C.dim}──────── 第 ${i} 轮 ────────${C.reset}`)

    // 1. 采访者出问
    const iv = await call(AGENTS.interviewer, promptInterviewer(transcript.join('\n'), hint))
    if (!iv.ok) { console.error(`${C.red}采访者调用失败：${iv.err}${C.reset}`); stopReason = 'agent-error'; break }
    const question = iv.text.replace(/^["']|["']$/g, '')
    console.log(`${C.iv}采访者${C.reset}：${question}`)
    transcript.push(`采访者：${question}`)

    // 2. 受访者作答
    // 历史里去掉当前这一问，避免受访者复述问题
    const re = await call(AGENTS.respondent, promptRespondent(transcript.slice(0, -1).join('\n'), question))
    if (!re.ok) { console.error(`${C.red}受访者调用失败：${re.err}${C.reset}`); stopReason = 'agent-error'; break }
    const answer = re.text.replace(/^["']|["']$/g, '')
    console.log(`${C.re}受访者${C.reset}：${answer}`)
    transcript.push(`受访者：${answer}`)

    // 3. 观察者评估
    const roundText = `采访者：${question}\n受访者：${answer}`
    const ob = await call(AGENTS.observer, promptObserver(transcript.join('\n'), roundText))
    let observer = null
    let hasNewInsight = null
    if (!ob.ok) {
      console.log(`${C.ob}观察者${C.reset}：调用失败 ${C.dim}${ob.err}${C.reset}`)
    } else {
      const parsed = extractJson(ob.text)
      if (!parsed) {
        console.log(`${C.ob}观察者${C.reset}：${C.dim}（未解析出 JSON）${ob.text.slice(0, 200)}${C.reset}`)
      } else {
        if (typeof parsed.has_new_insight === 'boolean') hasNewInsight = parsed.has_new_insight
        observer = { has_new_insight: hasNewInsight, hint: parsed.hint || '', eval: parsed.eval || null }
        lastEval = parsed.eval || null
        const e = parsed.eval
        const insightText = hasNewInsight === null ? '未知' : hasNewInsight ? '有' : '无'
        console.log(`${C.ob}观察者${C.reset}：${e?.weighted_total ?? '—'} / 5　${C.dim}覆盖 ${e?.coverage ?? '—'}　新判断依据 ${insightText}　${e?.profile ?? ''}${C.reset}`)
        if (parsed.hint) console.log(`${C.hint}　提示${C.reset}：${parsed.hint}${MODE === 'baseline' ? `${C.dim}（baseline 不回流）${C.reset}` : ''}`)
      }
    }

    session.rounds.push({
      index: i,
      utterances: [
        { speaker: 'interviewer', text: question, ts: new Date().toISOString() },
        { speaker: 'respondent', text: answer, ts: new Date().toISOString() },
      ],
      observer,
    })

    hint = MODE === 'assisted' && observer?.hint ? observer.hint : ''
    console.log('')

    // 连续两轮没有拿到新的判断依据就收尾；--rounds 只是上限。
    if (hasNewInsight === true) noInsightStreak = 0
    else if (hasNewInsight === false) noInsightStreak++
    if (noInsightStreak >= 2) {
      stopReason = 'no-new-insight'
      console.log(`${C.dim}连续两轮没有新的判断依据，提前收尾（已跑 ${i} 轮）${C.reset}\n`)
      break
    }
  }

  session.endedAt = new Date().toISOString()
  session.agents = Object.fromEntries(Object.entries(AGENTS).map(([k, v]) => [k, v.sessionId]))
  session.finalEval = lastEval
  session.stopReason = stopReason

  /* 隔离自检：送给采访者的输入里不得出现人物卡原文。
     注意只能查人物卡原文整行。受访者自己说出的信息（如"心脏手术"）出现在记录里是正常的，
     那是访谈内容，不是泄漏。 */
  const leak = []
  const ivPrompt = promptInterviewer(transcript.join('\n'), hint)
  for (const line of persona.split('\n')) {
    const s = line.trim()
    if (s.length < 15) continue
    if (ivPrompt.includes(s)) leak.push(s.slice(0, 40))
  }
  session.isolationCheck = leak.length ? { pass: false, leaked: leak } : { pass: true }

  /* 召回率统计：人物卡里的埋点，跑完看挖出几条（脚本统计，不经过观察者） */
  const fullText = session.rounds.flatMap((r) => r.utterances.map((u) => u.text)).join('\n')
  const facts = []
  for (const line of persona.split('\n')) {
    if (line.trim().startsWith('>')) continue // 跳过说明行
    const m = line.match(/｛kw:\s*([^｝]+)｝/)
    if (!m) continue
    const kws = m[1].split('|').map((s) => s.trim()).filter(Boolean)
    const hit = kws.some((k) => fullText.includes(k))
    const label = line.replace(/^[\d.\s-]+/, '').replace(/｛kw:[^｝]*｝/, '').replace(/\*\*/g, '').trim()
    facts.push({ label, hit })
  }
  const hitCount = facts.filter((f) => f.hit).length
  session.recall = { hit: hitCount, total: facts.length, rate: facts.length ? +(hitCount / facts.length).toFixed(2) : 0, missed: facts.filter((f) => !f.hit).map((f) => f.label) }

  const jsonPath = save(session, toMarkdown(session))

  const scores = session.rounds
    .map((r) => r.observer?.eval?.weighted_total)
    .filter((v) => typeof v === 'number')
  const meanScore = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : null
  const stopText = { 'no-new-insight': '连续两轮无新判断依据', 'max-rounds': '达到轮数上限', 'agent-error': 'Agent 调用失败' }[stopReason] || stopReason

  console.log(`${C.dim}落盘：${jsonPath}${C.reset}`)
  console.log(`召回率：${hitCount} / ${facts.length}（${(session.recall.rate * 100).toFixed(0)}%）`)
  console.log(`过程均分：${meanScore === null ? '—' : meanScore.toFixed(2)} / 5`)
  console.log(`轮数：${session.rounds.length}（上限 ${MAX_ROUNDS}，${stopText}）`)
  if (session.recall.missed.length) console.log(`${C.dim}漏掉：${session.recall.missed.join('；')}${C.reset}`)
  console.log(leak.length
    ? `${C.red}隔离自检失败，采访者输入中出现人物卡内容：${leak.join('、')}${C.reset}`
    : `${C.dim}隔离自检通过：采访者输入中无人物卡内容${C.reset}`)
  console.log(`${C.dim}会话：interviewer=${AGENTS.interviewer.sessionId} respondent=${AGENTS.respondent.sessionId} observer=${AGENTS.observer.sessionId}${C.reset}\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
