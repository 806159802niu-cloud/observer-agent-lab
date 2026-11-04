// pages/interview/interview.js
const { interviewDetail } = require('../../data/interviews.js')
const { getSpeakerLabel, getAvatarClass } = require('../../utils/format.js')

Page({
  data: {
    personaName: '',
    rounds: [],
    visibleRounds: [],
    currentRoundIndex: 0,
    showObserverPanel: false,
    observerScoreDisplay: '',
    observerHint: '',
    observerDepthNote: '',
    observerScoreColor: '#188038',
    isTurningPoint: false,
    completed: false,
    autoPlay: true,
    playSpeed: 2000,
    roundCount: 0
  },

  onLoad() {
    const rounds = interviewDetail.rounds.map(r => ({
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

    this.setData({
      personaName: interviewDetail.personaName,
      rounds,
      visibleRounds: [],
      roundCount: rounds.length,
      autoPlay: true
    })

    this.showNextRound()
  },

  onUnload() {
    this._autoPlayTimer && clearTimeout(this._autoPlayTimer)
    this._hintTimer && clearTimeout(this._hintTimer)
  },

  showNextRound() {
    const { rounds, currentRoundIndex } = this.data
    if (currentRoundIndex >= rounds.length) {
      this.setData({ completed: true, showObserverPanel: false })
      return
    }

    const round = rounds[currentRoundIndex]
    const visibleRounds = [...this.data.visibleRounds, {
      ...round,
      showHint: false
    }]

    this.setData({
      visibleRounds,
      currentRoundIndex: currentRoundIndex + 1,
      showObserverPanel: false
    })

    // 1.5 秒后显示观察者点评
    this._hintTimer = setTimeout(() => {
      this.setData({
        showObserverPanel: true,
        observerScoreDisplay: round.scoreDisplay,
        observerHint: round.hint,
        observerDepthNote: round.depthNote || '',
        observerScoreColor: round.scoreColor || '#188038',
        isTurningPoint: !!round.isTurningPoint
      })

      // 自动播放下一轮
      if (this.data.autoPlay && this.data.currentRoundIndex < this.data.rounds.length) {
        this._autoPlayTimer = setTimeout(() => {
          this.showNextRound()
        }, this.data.playSpeed)
      }
    }, 1500)
  },

  onToggleHint(e) {
    const index = e.currentTarget.dataset.index
    const visibleRounds = this.data.visibleRounds.map((r, i) => {
      if (i === index) return { ...r, showHint: !r.showHint }
      return r
    })
    this.setData({ visibleRounds })
  },

  onNextRound() {
    // 完成态 → 重新播放
    if (this.data.completed) {
      this.restart()
      return
    }
    // 手动推进 → 关闭自动
    if (this.data.autoPlay) {
      this.setData({ autoPlay: false })
      this._autoPlayTimer && clearTimeout(this._autoPlayTimer)
      this._hintTimer && clearTimeout(this._hintTimer)
    }
    this.showNextRound()
  },

  onToggleAuto() {
    const newAuto = !this.data.autoPlay
    this.setData({ autoPlay: newAuto })
    if (newAuto && !this.data.completed) {
      this.showNextRound()
    } else {
      this._autoPlayTimer && clearTimeout(this._autoPlayTimer)
      this._hintTimer && clearTimeout(this._hintTimer)
    }
  },

  restart() {
    this._autoPlayTimer && clearTimeout(this._autoPlayTimer)
    this._hintTimer && clearTimeout(this._hintTimer)
    this.setData({
      visibleRounds: [],
      currentRoundIndex: 0,
      completed: false,
      showObserverPanel: false,
      autoPlay: true,
      observerScoreDisplay: '',
      observerHint: '',
      observerDepthNote: '',
      isTurningPoint: false
    })
    setTimeout(() => this.showNextRound(), 400)
  },

  onReplay() {
    this.restart()
  },

  onViewHistory() {
    wx.navigateTo({
      url: '/pages/history-detail/history-detail?id=assisted-final8-2026-10-30'
    })
  }
})
