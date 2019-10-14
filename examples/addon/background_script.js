const count = async (origin) => {
  let { count } = await browser.storage.local.get('count');
  count = count || {};
  count[origin] = count[origin] || 0;
  count[origin]++;
  await browser.storage.local.set({ count });
};

browser.runtime.onMessage.addListener((msg, sender) => {
  switch (msg.type) {
  case 'type.key':
    return count(new URL(sender.url).origin);
  }
})
