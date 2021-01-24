self.addEventListener('message', data => {
  self.importScripts('back.js')
  // eslint-disable-next-line no-undef
  self.postMessage(restructureTKB(data.data))
})