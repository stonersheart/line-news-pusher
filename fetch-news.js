const FEEDS = {
  即時新聞: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/realtime',
  政治: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/politics',
  社會: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/society',
  國際: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/international',
  兩岸: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/twoshore',
  財經: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/finance',
  影視: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/entertainment',
  體育: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/sports',
  生活: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/leisure',
  休閒: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/relaxation',
  科技: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/technology',
  健康: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/health',
  新奇: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/oddlyenough',
  最多人瀏覽: 'https://rss-proxy.stonersheart.workers.dev/?url=http://tw.news.yahoo.com/rss/mostviewed',
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
  const newsText = await fetchNews(); // 預設抓「即時新聞」

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '即時新聞' }) // 發送分類給 Worker
  });

  if (!res.ok) {
    console.error(`❌ Failed to send message. Status: ${res.status}`);
    const errorText = await res.text();
    console.error(errorText);
  } else {
    console.log("✅ News sent successfully");
  }
})();
