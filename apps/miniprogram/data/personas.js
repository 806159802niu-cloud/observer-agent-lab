// data/personas.js - 人物数据（从 bundles/respondent.json 提取）
const personas = [
  {
    id: 'demo-founder',
    name: '林知远',
    type: 'fictional',
    role: '澄远制造创始人',
    bio: '虚构家族企业创始人，2024 年手术后开始认真考虑接班问题。核心关切：跟着他二十多年的老师傅们的去处、下一代能否接住话语权传递的通道。',
    style: '审慎、温和，重视事实与家族长期发展',
    tags: ['传承', '家族企业', '制造'],
    evidence: [
      {
        id: 'D01',
        type: 'decision',
        title: '供应链危机中的选择',
        content: '创业第七年，最大客户临时取消订单。林知远选择保留核心研发团队，压缩自己的分红，随后花了六个月寻找新客户。',
        tags: ['危机', '决策', '员工']
      },
      {
        id: 'D02',
        type: 'decision',
        title: '家族成员是否应直接进入管理层',
        content: '林知远提出，家族成员不应仅凭血缘获得管理岗位，应经过外部工作经历和独立能力评估。',
        tags: ['传承', '家族', '接班']
      },
      {
        id: 'D03',
        type: 'decision',
        title: '五年任职规则的反思',
        content: '家族宪章草案要求在企业任职满五年才能参选董事。林知远担心这一条款会鼓励形式主义，忽略在外部积累的真实能力。',
        tags: ['宪章', '规则', '公平']
      },
      {
        id: 'D04',
        type: 'decision',
        title: '股权退出机制',
        content: '林知远希望不参与经营的家族成员可以依据透明、公平的机制退出持股，避免被迫留在企业。',
        tags: ['股权', '退出', '家族']
      },
      {
        id: 'D05',
        type: 'decision',
        title: '质量问题中的错误判断',
        content: '林知远承认曾因过分信任老员工而延迟处理产品质量问题，后来推动建立独立质检复核机制。',
        tags: ['质量', '错误', '信任']
      }
    ]
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    type: 'real',
    role: 'Apple 创始人',
    bio: '（知识库待补充）',
    style: '',
    tags: ['科技', '产品'],
    evidence: []
  }
]

module.exports = { personas }
