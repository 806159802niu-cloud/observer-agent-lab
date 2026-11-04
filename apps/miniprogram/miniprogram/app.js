// app.js
App({
  onLaunch() {
    // 初始化全局状态
    this.globalData = {
      version: '0.1.0',
      // 当前选中的人物
      activePersonaId: 'demo-founder',
      // mock 模式标记（Demo 全程本地）
      mockMode: true
    }
  },
  globalData: {}
})
