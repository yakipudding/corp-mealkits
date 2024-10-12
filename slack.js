const axios = require('axios');
const config = require('config');

const webhookUrl = config.get('slack.webhook_url');
const mealkitUrl = "https://shop.pal-system.co.jp/pal/SearchItemList.do?search=";

const coopSendSlack = async (items) => {
  let text = ":wave: 次回のコープミールキットからよさげなやつをチョイスしたよ〜！！\n\n";
  for (let i of items) {
    text += `<${i.url}|${i.name}> (${i.amount}) ${i.price}\n`;
  }
  const payload = { text };

  await axios.post(webhookUrl, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
};

const palSendSlack = async (items) => {
  if (items.length == 0) {
    return;
  }
  let text = ":wave: 次回のパルシステムミールキットからよさげなやつをチョイスしたよ〜！！\n\n";
  for (let i of items) {
    const urlParam = encodeURIComponent(i.name);
    text += `<${mealkitUrl}${urlParam}|${i.name}> (税込 ${i.price})\n`;
  }
  const payload = { text };

  await axios.post(webhookUrl, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
};

module.exports = { coopSendSlack, palSendSlack };