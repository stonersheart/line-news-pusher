const FEEDS = {
  即時新聞: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/realtime',
  // 可視需要補上其他分類
};

async function fetchNews(category = '即時新聞') {
  const url = FEEDS[category];
  const res = await fetch(url);
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
  const newsText = await fetchNews();  // 預設即時新聞
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '即時新聞' }) // 請求類別
  });

  if (!res.ok) {
    console.error(`❌ Failed to send message. Status: ${res.status}`);
    const errorText = await res.text();
    console.error(errorText);
  } else {
    console.log("✅ News sent successfully");
  }
})();
