// pages/history-detail/history-detail.js
const { interviewList, interviewDetail } = require('../../data/interviews.js')
const { getSpeakerLabel, getAvatarClass } = require('../../utils/format.js')

Page({
  data: {
    interview: null,
    detail: null,
    expandedRounds: {},
    showRecall: false,
    recallSummary: ''
  },

  onLoad(options) {
    const id = options.id
    const interview = interviewList.find(i => i.id === id)

    if (!interview) {
      wx.showToast({ title: '访谈不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }

    wx.setNavigationBarTitle({ title: interview.title })

    let detail
    if (id === 'assisted-final8-2026-10-30') {
      detail = { ...interviewDetail }
    } else {
      detail = { ...interview, rounds: [], recall: null }
    }

    const rounds = detail.rounds.map(r => ({
      ...r,
      scoreDisplay: r.weightedTotal ? r.weightedTotal.toFixed(1) : '—',
      scoreColor: r.scoreColor || '#188038',
      isTurningPoint: !!r.isTurningPoint,
      utterances: r.utterances.map(u => ({
        ...u,
        speakerLabel: getSpeakerLabel(u.speaker),
        avatarClass: getAvatarClass(u.speaker)
      }))
    }))

    // 默认展开第 7 轮（关键转折，index 6）
    const expanded = { 6: true }

    let recallSummary = ''
    if (detail.recall) {
      recallSummary = `${detail.recall.hit} / ${detail.recall.total} · ${(detail.recall.rate * 100).toFixed(0)}%`
    }

    this.setData({
      interview,
      detail: { ...detail, rounds },
      expandedRounds: expanded,
      recallSummary
    })
  },

  onToggleRound(e) {
    const index = e.currentTarget.dataset.index
    const expandedRounds = { ...this.data.expandedRounds }
    expandedRounds[index] = !expandedRounds[index]
    this.setData({ expandedRounds })
  },

  onExpandAll() {
    const expanded = {}
    this.data.detail.rounds.forEach((_, i) => { expanded[i] = true })
    this.setData({ expandedRounds: expanded })
  },

  onCollapseAll() {
    this.setData({ expandedRounds: {} })
  },

  onToggleRecall() {
    this.setData({ showRecall: !this.data.showRecall })
  },

  onReplayInterview() {
    wx.navigateTo({ url: '/pages/interview/interview' })
  }
})
