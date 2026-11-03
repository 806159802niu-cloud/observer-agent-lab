// utils/format.js - 格式化工具

function formatScore(score) {
  if (score === null || score === undefined) return '—'
  return score.toFixed(1)
}

function getScoreColor(score) {
  if (score === null || score === undefined) return '#80868b'
  if (score >= 4.5) return '#188038'
  if (score >= 3.5) return '#1a73e8'
  if (score >= 2.5) return '#b06000'
  return '#c5221f'
}

function getModeLabel(mode) {
  return mode === 'assisted' ? '观察者介入' : '基线'
}

function getModeColor(mode) {
  return mode === 'assisted' ? 'tag-orange' : 'tag-gray'
}

function getSpeakerLabel(speaker) {
  const map = {
    interviewer: '采访者',
    respondent: '受访者',
    observer: '观察者'
  }
  return map[speaker] || speaker
}

function getAvatarClass(speaker) {
  const map = {
    interviewer: 'avatar-interviewer',
    respondent: 'avatar-respondent',
    observer: 'avatar-observer'
  }
  return map[speaker] || 'avatar-gray'
}

function truncate(text, maxLen) {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen) + '…'
}

module.exports = {
  formatScore,
  getScoreColor,
  getModeLabel,
  getModeColor,
  getSpeakerLabel,
  getAvatarClass,
  truncate
}
