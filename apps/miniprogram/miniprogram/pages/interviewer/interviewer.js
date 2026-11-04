// pages/interviewer/interviewer.js - 采访者人设 v2.4.12
const { interviewerV2412 } = require('../../data/interviewer.js')

Page({
  data: {
    v: interviewerV2412,
    // 分组折叠状态，默认展开前几个，后面收起
    open: {
      levels: true,
      standards: true,
      patterns: false,
      pressures: false,
      ruleLayers: false,
      keywordLoop: true,
      caseCards: false,
      diagnostic: false,
      oral: false
    },
    // 某个 pattern 是否展开详细
    patternOpen: {},
    // 某个 case card 是否展开详细
    cardOpen: {}
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ [`open.${key}`]: !this.data.open[key] })
  },

  onTogglePattern(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ [`patternOpen.${id}`]: !this.data.patternOpen[id] })
  },

  onToggleCard(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ [`cardOpen.${id}`]: !this.data.cardOpen[id] })
  }
})
