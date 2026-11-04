// pages/persona-detail/persona-detail.js
const { personas } = require('../../data/personas.js')

Page({
  data: {
    persona: null,
    evidenceTypes: [
      { type: 'decision', label: '决策案例', icon: '🎯' },
      { type: 'quote', label: '关键原话', icon: '💬' }
    ]
  },

  onLoad(options) {
    const id = options.id
    const persona = personas.find(p => p.id === id)
    
    if (!persona) {
      wx.showToast({ title: '人物不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }

    wx.setNavigationBarTitle({ title: persona.name })

    // 按 type 分组 evidence
    const grouped = {}
    persona.evidence.forEach(e => {
      if (!grouped[e.type]) grouped[e.type] = []
      grouped[e.type].push(e)
    })

    this.setData({
      persona: {
        ...persona,
        groupedEvidence: grouped
      }
    })
  },

  onEvidenceTap(e) {
    // 证据条目点击 - 可以扩展为详情弹窗
    wx.showToast({ title: '查看证据详情', icon: 'none' })
  }
})
