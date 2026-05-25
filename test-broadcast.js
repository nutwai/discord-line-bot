const token = 'kQBFHPpLoM1Foj+i23jsMUBWPzkxNZSuDpaEAA8UiZnCeCInp5pOexYXHgLekK7tyjE1Z21HgbMDcRk6HkbbVXegDrg2XUxkXOv25kfZwwb83hRuMOOv/7OWEXVxJOvR/RFexg63DunlxafcSNkfLAdB04t89/1O/w1cDnyilFU=';

fetch('https://api.line.me/v2/bot/message/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messages: [{ type: 'text', text: 'ทดสอบส่งข้อความแบบ Broadcast (ส่งหาทุกคนที่เป็นเพื่อนกับบอท) ถัาข้อความนี้เด้ง แสดงว่าไม่ต้องใช้ Webhook ครับ!' }]
  })
}).then(async r => {
  const data = await r.json();
  console.log('Status:', r.status);
  console.log('Response:', data);
}).catch(console.error);
