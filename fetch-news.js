const FEEDS = {
  新聞: 'https://tw.news.yahoo.com/rss/',
  政治: 'https://tw.news.yahoo.com/rss/politics',
  財經: 'https://tw.news.yahoo.com/rss/finance',
  娛樂: 'https://tw.news.yahoo.com/rss/entertainment',
  運動: 'https://tw.news.yahoo.com/rss/sports',
  社會: 'https://tw.news.yahoo.com/rss/society',
  國際: 'https://tw.news.yahoo.com/rss/world',
  生活: 'https://tw.news.yahoo.com/rss/lifestyle',
  健康: 'https://tw.news.yahoo.com/rss/health',
  科技: 'https://tw.news.yahoo.com/rss/technology',
  品味: 'https://tw.news.yahoo.com/rss/style',
  最新: 'https://tw.stock.yahoo.com/rss?category=news',
  台股: 'https://tw.stock.yahoo.com/rss?category=tw-market',
  小資: 'https://tw.stock.yahoo.com/rss?category=personal-finance',
  基金: 'https://tw.stock.yahoo.com/rss?category=funds-news',
};

async function fetchNews(category = '新聞') {
  const url = FEEDS[category];
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GitHubAction/1.0)'
    }
  });
  const xml = await res.text();

  const items = Array.from(xml.matchAll(/<item>(.*?)<\/item>/gs)).slice(0, 3);
  const articles = items.map(item => {
    const title = item[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                  item[1].match(/<title>(.*?)<\/title>/)?.[1] || '無標題';
    const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || '#';
    return `• ${title}\n${link}`;
  });

  return articles.join('\n\n');
}

const WORKER_URL = process.env.WORKER_URL;

(async () => {
  const newsText = await fetchNews("新聞"); // 可改為其他類別
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `新聞\n${newsText}` })
  });

  if (!res.ok) {
    console.error(`❌ Failed to send message. Status: ${res.status}`);
    const errorText = await res.text();
    console.error(errorText);
  } else {
    console.log("✅ News sent successfully");
  }
})();
