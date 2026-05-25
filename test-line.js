const { pushMessage } = require('./src/line');

async function test() {
  console.log('Sending simple text message to LINE...');
  try {
    await pushMessage({
      type: 'text',
      text: 'Test message from Bot'
    });
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();
