const getCoopItems = require('./get_coop_items');
const getPalItems = require('./get_pal_items');
const { coopSendSlack, palSendSlack } = require('./slack');

const main = async () => {
  // coop
  const coopItems = await getCoopItems();
  await coopSendSlack(coopItems);
  console.log("get coop items done.");

  // pal
  const palItems = await getPalItems();
  await palSendSlack(palItems);
  console.log("get pal items done.");
};

main().catch(error => {
  console.error('Error:', error);
});