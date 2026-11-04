// data/interviews.js - 访谈记录 mock 数据
// 来源：apps/workbench/records/assisted-final8-2026-10-30T04-56-40.json（真实跑出来的记录）

const interviewList = [
  {
    id: 'assisted-final8-2026-10-30',
    title: '接班与话语权',
    personaId: 'demo-founder',
    personaName: '林知远',
    mode: 'assisted',
    roundCount: 8,
    startedAt: '2026-10-30 12:56',
    endedAt: '2026-10-30 12:59',
    weightedTotal: 4.82,
    coverage: 0.55,
    recallRate: 0.4,
    profile: '观察者介入的一场完整访谈。采访者承接扎实、提问开放，成功撬出受访者关于车间话语权的核心判断依据，以及与下一代之间那句"你退了我才敢说真话"的关键转折。'
  },
  {
    id: 'baseline-b3-2026-10-30',
    title: '创业历程回顾',
    personaId: 'demo-founder',
    personaName: '林知远',
    mode: 'baseline',
    roundCount: 5,
    startedAt: '2026-10-30 12:32',
    endedAt: '2026-10-30 12:33',
    weightedTotal: 3.5,
    coverage: 0.4,
    recallRate: 0.3,
    profile: '无观察者介入的基线访谈。开场节奏尚可但追问偏浅，未触及深层判断依据。'
  },
  {
    id: 'assisted-b3-2026-10-30',
    title: '危机中的选择',
    personaId: 'demo-founder',
    personaName: '林知远',
    mode: 'assisted',
    roundCount: 6,
    startedAt: '2026-10-30 12:30',
    endedAt: '2026-10-30 12:31',
    weightedTotal: 4.1,
    coverage: 0.5,
    recallRate: 0.35,
    profile: '观察者介入下的访谈，较 baseline 有明显提升。'
  }
]

// 完整访谈详情（用于访谈模拟页和详情页）
const interviewDetail = {
  id: 'assisted-final8-2026-10-30',
  personaName: '林知远',
  mode: 'assisted',
  rounds: [
    {
      index: 1,
      utterances: [
        { speaker: 'interviewer', text: '您是从什么时候开始认真考虑把企业交给下一代的？' },
        { speaker: 'respondent', text: '当年 2024 年那次手术之后，就在想这事了。真正往心里去，还是去年年底。' }
      ],
      hint: '受访者目前只停在两个时间节点和"往心里去"这一模糊说法上。追问方向：请他把这两个节点各自触发过的具体念头展开，弄清"真正往心里去"当时落在哪件具体的事上。',
      weightedTotal: 3.33,
      scoreColor: '#1a73e8',
      depthNote: '仅一个事实层面的回合，尚未触及他为什么在手术后开始考虑'
    },
    {
      index: 2,
      utterances: [
        { speaker: 'interviewer', text: '去年年底那会儿，您心里"往里去"的第一个具体念头，是关于哪件事的？' },
        { speaker: 'respondent', text: '车间里那些人。跟着我二十多年的老师傅，两百多号。我一退，他们往哪儿去。' }
      ],
      hint: '受访者已把抽象的"往心里去"落到具体担忧上。下一轮方向：从这一关切追到判断依据与取舍，即他判断"这些人去处稳妥"用什么标准。',
      weightedTotal: 4.27,
      scoreColor: '#1a73e8',
      depthNote: '用受访者自己的话把模糊的"往心里去"接成了具体切口'
    },
    {
      index: 3,
      utterances: [
        { speaker: 'interviewer', text: '以前厂里也有过人员变动的时刻吧，那时候您是怎么判断一批人的去处算稳妥的？' },
        { speaker: 'respondent', text: '有过。2019 年那回，我从外面请了个职业经理人，把摊子交出去两年。结果呢，账上亏，老师傅走了一批。那些人不是冲工资走的，是觉得说话没人听了。这个我到现在认。' }
      ],
      hint: '受访者已给出一个可用的判断依据：人离开不是因为钱，而是"说话没人听了"。下一轮方向：把这个依据往具体处和边界处推。',
      weightedTotal: 4.45,
      scoreColor: '#188038',
      depthNote: '成功让受访者说出可解释其取舍的标准——不是钱，是说话没人听'
    },
    {
      index: 4,
      utterances: [
        { speaker: 'interviewer', text: '2019 年那两年里，"说话没人听了"，具体是在哪类事上、谁的意见没被听到？' },
        { speaker: 'respondent', text: '具体哪一件，现在也说不上来了。反正那两年，车间里的话传不上去。老师傅提一次没人应，就不提第二次了。' }
      ],
      hint: '受访者给出了机制性说法："提一次没人应，就不提第二次"。下一轮方向：转向接班安排，即在他看来"有人应"要落到什么条件上才算数。',
      weightedTotal: 4.45,
      scoreColor: '#188038',
      depthNote: '逼近他在意的底线——意见递不上去之后，人就沉默了'
    },
    {
      index: 5,
      utterances: [
        { speaker: 'interviewer', text: '那您往后看，怎么知道接班以后车间里的话还传得上去——您会看什么？' },
        { speaker: 'respondent', text: '看人走不走。头一年老师傅还愿意争两句，还愿意把废品摔在你桌上，那是好的。哪天全变成点头了，我就知道话又传不上去了。' }
      ],
      hint: '受访者给出了具体、可观察的判断标准。下一轮建议转向取舍与边界，不再补充更多指标。',
      weightedTotal: 4.45,
      scoreColor: '#188038',
      depthNote: '引出"愿意争是好的、全点头是坏的"这一价值取舍'
    },
    {
      index: 6,
      utterances: [
        { speaker: 'interviewer', text: '要是以后厂里真有人把废品摔到桌上，您希望下一代当时怎么反应？' },
        { speaker: 'respondent', text: '先蹲下去看件，别急着讲道理。问清楚哪台机、哪批料、几点出的。老师傅气头上，你得让他把话说完，不能压。听完了再定，错了就当场认。' }
      ],
      hint: '受访者已给出一套具体的行为准则。下一轮建议把这些期望与现实对照。',
      weightedTotal: 5.0,
      scoreColor: '#188038',
      depthNote: '已到价值与判断依据层——不能压，错了就当场认'
    },
    {
      index: 7,
      utterances: [
        { speaker: 'interviewer', text: '这套做法，您跟下一代是怎么交代的？' },
        { speaker: 'respondent', text: '没正经交代过。跟她坐下来谈过一次，她不肯多说，就扔下一句：你退了我才敢说真话。这话我记到现在。' }
      ],
      hint: '全场关键转折！下一代用"你退了我才敢说真话"设了条件。下一轮应集中追这一处，不要另开话题。',
      weightedTotal: 4.82,
      scoreColor: '#188038',
      isTurningPoint: true,
      depthNote: '撬出全场最有分量的一句原话'
    },
    {
      index: 8,
      utterances: [
        { speaker: 'interviewer', text: '她说完那句话，您当时是怎么回的？' },
        { speaker: 'respondent', text: '当时没接话。这种话让人怎么接。后来就搁在那儿了。到今天也没再提。' }
      ],
      hint: '受访者承认这里有一处一直没被处理的空白。下一轮可以追那句"让人怎么接"具体卡在哪。',
      weightedTotal: 4.82,
      scoreColor: '#188038',
      depthNote: '逼出他回避与搁置的事实'
    }
  ],
  recall: {
    hit: 4,
    total: 10,
    rate: 0.4,
    missed: [
      '长女陈曦能力足够但本人不愿接，她真正想做的是教育公益',
      '次子陈屿想接，但陈国栋认为他不懂制造、没在车间待过',
      '陈国栋自己并不想真的退出，怕失去话语权',
      '老伴最担心的不是企业，是两个孩子因为接班反目',
      '没公开说过的底线：家族控股权不能低于 51%',
      '真正的决策时间点：明年 6 月董事会之前必须定下来'
    ]
  }
}

module.exports = { interviewList, interviewDetail }
