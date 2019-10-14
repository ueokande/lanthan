const { Builder } = require('lanthan');

(async () => {
  // Create a new Firefox session
  let lanthan = await Builder
    .forBrowser('firefox')  // Lanthan currently supports only Firefox
    .build();

  // Close the session
  await lanthan.quit();
})()

