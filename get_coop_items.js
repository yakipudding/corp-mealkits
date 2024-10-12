const { chromium } = require('playwright');
const config = require('config');
const { filterItem, sortItems } = require('./common');

const getCoopItems = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const userId = config.get('coop.user_id');
  const password = config.get('coop.password');
  const loginBaseURL = 'https://ec.coopdeli.jp';
  const baseURL = 'https://weekly.coopdeli.jp'

  try {
    await page.goto(`${loginBaseURL}/auth/login.html`);
    await page.fill('input[name="j_username"]', userId);
    await page.fill('input[name="j_password"]', password);

    // タイムアウトを延長し、クリック前に要素が存在することを確認
    await page.waitForSelector('a.FW_submitLink', { timeout: 60000 });
    await page.click('a.FW_submitLink');
    await page.waitForTimeout(1000); // 1秒待機

    const coopLink = await page.getAttribute('a:has-text("ウイークリーコープ")', 'href');
    await page.goto(`${coopLink}`);
    await page.waitForTimeout(1000);

    const mealKitLink = await page.getAttribute('a:has-text("ミールキット　冷蔵")', 'href');
    await page.goto(`${baseURL}${mealKitLink}`);
    await page.waitForTimeout(1000);

    const eightyItemsLink = await page.getAttribute('a:has-text("80件")', 'href');
    await page.goto(`${baseURL}${eightyItemsLink}`);
    await page.waitForTimeout(1000);

    // 商品ページ
    const lis = await page.$$('div.itemListSet.col4 ul.slides > li');

    // 各li要素から情報を取得
    const items = [];
    for (const li of lis) {
      // 商品名
      const productNameElement = await li.$('p.itm_name a');
      let productName = await productNameElement.textContent();
      productName = productName.trim();

      // 何人前
      const productTypeElement = await li.$('p.itm_type');
      const productType = await productTypeElement.textContent();

      // 商品コード
      const productCodeElement = await li.$('p.itm_code em');
      const productCode = await productCodeElement.textContent();

      // 商品詳細ページのURL
      const productUrl = await productNameElement.getAttribute('href');

      // 金額
      const productPriceElement = await li.$('p.taxin');
      const productPrice = await productPriceElement.textContent();

      const filtered = filterItem(productName, productPrice);

      if (!filtered) {
        items.push({
          name: productName,
          amount: productType,
          code: productCode,
          url: `${baseURL}${productUrl}`,
          price: productPrice,
        });
      }
    }

    const sortedItems = sortItems(items);

    await browser.close();
    return sortedItems;

  } catch (error) {
    console.error('Error during getCoopItems:', error);
    await page.screenshot({ path: 'error_screenshot.png' }); // エラー時のスクリーンショット
    await browser.close();
    throw error;
  }
};

module.exports = getCoopItems;