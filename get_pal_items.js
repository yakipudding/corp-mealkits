const { chromium } = require('playwright');
const config = require('config');
const { filterItem, sortItems } = require('./common');

const getPalItems = async () => {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();
  const userId = config.get('palsystem.user_id');
  const password = config.get('palsystem.password');

  await page.goto('https://shop.pal-system.co.jp/pal/InesOrderContents.do?contentsId=A900001', { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.fill('input[name="S9_"]', userId);
  await page.fill('input[name="S11_"]', password);
  
  // ログインボタンをクリック
  await page.waitForSelector('a.btn.btn-md.btn-default.btn-wide', { timeout: 60000 });
  await page.evaluate(() => {
    document.querySelector('a.btn.btn-md.btn-default.btn-wide').click();
  });

  await page.waitForTimeout(100000);

  // // ログイン後に表示される要素を待機
  // await page.waitForSelector('h1', { timeout: 60000 });
  // const pageTitle = await page.$eval('h1', el => el.textContent);
  // if (pageTitle.includes('企画回選択')) {

  //   await page.screenshot({ path: 'pal.png' });
  //   // 複数企画回の時
  //   await page.waitForSelector('a.singleClick', { timeout: 60000 });
  //   await page.evaluate(() => {
  //     document.querySelector('a.singleClick').click();
  //   });
  // }

  // await page.waitForTimeout(100000);
  // await page.screenshot({ path: 'after_login_pal.png' });

  // 商品ページ
  const lis = await page.$$('.item-unit');

  // 各li要素から情報を取得
  const items = [];
  for (const li of lis) {
    // 商品名を取得
    const nameElement = await li.$('.name a');
    let name = await nameElement.textContent();
    name = String(name).trim();

    // 税込金額を取得
    const priceElement = await li.$('.subprice .num');
    const price = String(await priceElement.textContent()).trim() + '円';

    items.push({
      name: name,
      price: price,
      amount: '',
    });
  }

  const filteredItems = items.filter(item => !filterItem(item.name, item.price));
  const sortedItems = sortItems(filteredItems);

  await browser.close();
  return sortedItems;
};

module.exports = getPalItems;