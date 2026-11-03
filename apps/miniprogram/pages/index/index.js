// pages/index/index.js
const { interviewList } = require('../../data/interviews.js')

Page({
  data: {
    features: [
      {
        id: 'interview',
        icon: '🎙️',
        title: '访谈模拟',
        desc: '观看一场完整的深度访谈，采访者提问、受访者回应、观察者实时点评',
        color: '#1a73e8'
      },
      {
        id: 'personas',
        icon: '👤',
        title: '人物画像',
        desc: '浏览创始人的决策案例、价值偏好与关键判断依据',
        color: '#188038'
      },
      {
        id: 'history',
        icon: '📋',
        title: '历史复盘',
        desc: '回看每场访谈的轮次记录、评分与埋点召回率',
        color: '#b06000'
      }
    ],
    recentInterview: null,
    stats: {
      totalRounds: 25,
      avgScore: 4.1,
      personasCount: 2
    }
  },

  onLoad() {
    this.setData({
      recentInterview: interviewList[0],
      stats: {
        totalRounds: interviewList.reduce((sum, i) => sum + i.roundCount, 0),
        avgScore: (interviewList.reduce((sum, i) => sum + i.weightedTotal, 0) / interviewList.length).toFixed(1),
        personasCount: 2
      }
    })
  },

  onFeatureTap(e) {
    const id = e.currentTarget.dataset.id
    const map = {
      interview: '/pages/interview/interview',
      personas: '/pages/personas/personas',
      history: '/pages/history/history'
    }
    wx.navigateTo({ url: map[id] })
  },

  onRecentTap() {
    wx.navigateTo({
      url: `/pages/history-detail/history-detail?id=${this.data.recentInterview.id}`
    })
  },

  onQuickStart() {
    wx.navigateTo({ url: '/pages/interview/interview' })
  }
})
