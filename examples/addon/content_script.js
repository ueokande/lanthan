window.addEventListener('keypress', (e) => {
  browser.runtime.sendMessage({
    type: 'type.key',
  })
});
