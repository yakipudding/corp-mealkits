const config = require('config');

const filterItem = (name, price) => {
  const filterWords = config.get('filter.words');
  const filterMenues = config.get('filter.menues');

  const filters = [...filterWords, ...filterMenues];
  for (const filterWord of filters) {
    if (name.includes(filterWord)) {
      return true;
    }
  }

  // 1500円以上はNG
  const match = price.match(/\d{1,3}(?:,\d{3})*/);
  const priceNumber = parseInt(match[0].replace(',', ''), 10);
  if (priceNumber >= 1500) {
    return true;
  }

  return false;
};

const sortItems = (items) => {
  const itsumonoMenues = config.get('sort.itsumonoMenues');
  const likeWords = config.get('sort.likeWords');
  const unlikeWords = config.get('sort.unlikeWords');
  
  const getSortOrder = (item) => {
    const name = item.name;
    if (itsumonoMenues.some(menu => name.includes(menu))) {
      return 0;
    } else if (likeWords.some(like => name.includes(like))) {
      return 1;
    } else if (!unlikeWords.some(unlike => name.includes(unlike))) {
      return 2;
    } else {
      return 3;
    }
  };

  const amountPriority = (item) => {
    const amount = item.amount;
    if (amount === "3人前") {
      return 0;
    } else if (amount === "2～3人前") {
      return 1;
    } else if (amount === "2人前") {
      return 2;
    } else {
      return 3;
    }
  };

  const uniqueItems = {};
  for (const item of items) {
    const name = item.name;
    if (!uniqueItems[name] || amountPriority(item) < amountPriority(uniqueItems[name])) {
      uniqueItems[name] = item;
    }
  }

  const uniqueItemsArray = Object.values(uniqueItems);
  uniqueItemsArray.sort((a, b) => {
    const sortOrderA = getSortOrder(a);
    const sortOrderB = getSortOrder(b);
    if (sortOrderA !== sortOrderB) {
      return sortOrderA - sortOrderB;
    } else {
      return amountPriority(a) - amountPriority(b);
    }
  });

  return uniqueItemsArray;
};

module.exports = { filterItem, sortItems };