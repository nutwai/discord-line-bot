const token = 'kQBFHPpLoM1Foj+i23jsMUBWPzkxNZSuDpaEAA8UiZnCeCInp5pOexYXHgLekK7tyjE1Z21HgbMDcRk6HkbbVXegDrg2XUxkXOv25kfZwwb83hRuMOOv/7OWEXVxJOvR/RFexg63DunlxafcSNkfLAdB04t89/1O/w1cDnyilFU=';
const target = 'U6815e26dbd5120ed0d1e12d5535c2c7e';

fetch(`https://api.line.me/v2/bot/profile/${target}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(async r => {
  const data = await r.json();
  console.log('Status:', r.status);
  console.log('Response:', data);
}).catch(console.error);
