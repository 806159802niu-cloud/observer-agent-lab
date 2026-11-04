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
    id: 'jobs-demo1',
    name: 'Steve Jobs',
    type: 'real',
    role: 'Apple 联合创始人 · NeXT / Pixar CEO',
    bio: '出生即被收养，里德学院辍学后旁听书法课；1976 年与沃兹尼亚克在车库创办苹果；1984 年发布 Macintosh，1985 年离开苹果创办 NeXT 并收购皮克斯；1997 年回归苹果，先后推出 iMac、iPod、iPhone、iPad（1955–2011）。',
    style: '直率、二元判断（insanely great / it sucks）、短句、善用比喻与重复强调',
    tags: ['科技', '产品', '专注', '创业'],
    evidence: [
      {
        id: 'J-C1',
        type: 'decision',
        title: '1997 回归后砍产品线到四象限',
        content: '回归苹果任临时 CEO，产品线冗杂几十型号，濒临破产。只保留消费/专业 × 台式/便携四个格子，其余全部砍掉或卖掉（包括 Newton 项目）。关键原话："People think focus means saying yes... It means saying no to the hundred other good ideas."（Fortune 2008）判断规则：先做减法再谈战略。',
        tags: ['专注', '减法', '战略']
      },
      {
        id: 'J-C2',
        type: 'decision',
        title: '触屏赌注——不做手机键盘',
        content: 'iPhone 立项时全行业（黑莓、Palm、诺基亚）都是实体键盘。Jobs 赌全触屏新交互，发布会上当众演示正面回应质疑。原话："Physical keyboards can\'t change. They can\'t evolve."（Macworld iPhone 发布会 2007）判断规则：不沿袭行业惯例，锁死的硬件形态就是产品缺陷。',
        tags: ['产品', '反常规', '判断']
      },
      {
        id: 'J-C3',
        type: 'decision',
        title: 'iTunes 99 美分单首——顺应人性而非对抗',
        content: '盗版泛滥，唱片公司只会诉讼与 DRM。Jobs 逆着行业做 99 美分单首购买，逐家谈判先 Warner 后 Universal，用可验证的预测（订阅服务会失败）建立信誉。原话："We don\'t see how you convince people to stop being thieves unless you can offer them a carrot."（Rolling Stone 2003）判断规则：判断对方的结构性盲区，把"对抗人性"改造成"顺应人性"。',
        tags: ['商业', '谈判', '人性']
      },
      {
        id: 'J-C4',
        type: 'decision',
        title: 'App Store——先拒绝、后反转',
        content: 'iPhone 发布初期 Jobs 公开拒绝第三方原生应用（担心安全与稳定性，力推 Web Apps）。四个月后反转，2007 年 10 月公开承诺 SDK，2008 年 7 月上线 App Store。原话："We want native third party applications on the iPhone, and we plan to have an SDK in February."（Jobs 署名公开信 2007-10-17）判断规则：可以误判，但反转要快、要公开、给时间表。',
        tags: ['生态', '反转', '开放']
      },
      {
        id: 'J-C5',
        type: 'decision',
        title: '"Think Different"——品牌在产品黑暗期最需要投资',
        content: '回归初期苹果品牌形象崩坏，营销预算有限。Jobs 说服董事会放弃产品广告，先拍致敬爱因斯坦、甘地、马丁·路德·金的黑白片 Think Different。原话："Marketing is about values... Nike sells shoes, but they honor great athletes. That\'s who they are."（1997 内部讲话）判断规则：先告诉世界"我们是谁"，再谈"我们卖什么"。',
        tags: ['品牌', '营销', '价值观']
      },
      {
        id: 'J-C6',
        type: 'decision',
        title: '蓝盒子——小团队可以撬动大系统',
        content: '两个中学生钻进斯坦福直线加速器中心图书馆找到 AT&T 技术期刊，做出"世界上最好的蓝盒子"（免费打长途的装置）。原话："What we learned was that we could build something ourselves that could control billions of dollars\' worth of infrastructure... I don\'t think there would have ever been an Apple Computer had there not been blue boxing."（《The Lost Interview》1995）判断规则：技术的本质是杠杆，这类英雄主义式自信是创业的心理底座。',
        tags: ['创业', '杠杆', '自信']
      }
    ]
  }
]

module.exports = { personas }
