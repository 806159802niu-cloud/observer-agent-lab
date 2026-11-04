// pages/history/history.js
const { interviewList } = require('../../data/interviews.js')

Page({
  data: {
    interviews: [],
    filter: 'all' // all | assisted | baseline
  },

  onLoad() {
    this.applyFilter('all')
  },

  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter
    this.applyFilter(filter)
  },

  applyFilter(filter) {
    let list = interviewList
    if (filter === 'assisted') {
      list = interviewList.filter(i => i.mode === 'assisted')
    } else if (filter === 'baseline') {
      list = interviewList.filter(i => i.mode === 'baseline')
    }
    this.setData({ filter, interviews: list })
  },

  onInterviewTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/history-detail/history-detail?id=${id}` })
  }
})
