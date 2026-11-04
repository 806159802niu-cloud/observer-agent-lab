// pages/personas/personas.js
const { personas } = require('../../data/personas.js')

Page({
  data: {
    personas: []
  },

  onLoad() {
    this.setData({ personas })
  },

  onPersonaTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/persona-detail/persona-detail?id=${id}` })
  }
})
