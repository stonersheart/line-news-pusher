import fetch from 'node-fetch';
import Parser from 'rss-parser';

const parser = new Parser();
const WORKER_URL = process.env.WORKER_URL || 'https://line-news-pusher.stonersheart.workers.dev';

const rssFeeds = [
  {
    category: '總覽',
    url: 'https://rss-proxy.stonersheart.workers.dev/?url=https://www.ettoday.net/news/news-feed/rss2.xml'
  },
];


const keywordsByCategory = {
  股市: ['股價', '大盤', '指數', '法人', '收盤', '台股', '上市', '證交所'],
  科技: ['AI', '晶片', '台積電', 'iPhone', '演算法', 'ChatGPT', '科技'],
  政治: ['總統', '立法院', '立委', '選舉', '藍綠', '蔡英文', '賴清德'],
  娛樂: ['藝人', '演唱會', '八卦', '韓星', '戲劇', '偶像'],
};

function classify(entry) {
  const categories = [];
  for (const [cat, keywords] of Object.entries(keywordsByCategory)) {
    if (keywords.some(k => entry.title.includes(k) || (entry.contentSnippet || '').includes(k))) {
      categories.push(cat);
    }
  }
  return categories;
}

async function run() {
  const newsToday = [];

  for (const feed of rssFeeds) {
    const parsed = await parser.parseURL(feed.url);

    for (const entry of parsed.items) {
      const pubDate = new Date(entry.isoDate || entry.pubDate);
      const now = new Date();

      if (pubDate.toDateString() !== now.toDateString()) continue;

      const cats = classify(entry);
      newsToday.push({
        title: entry.title,
        link: entry.link,
        categories: cats,
      });
    }
  }

  const topNews = newsToday.slice(0, 3).map(n => `• ${n.title}\n🔗 ${n.link}`).join('\n\n');

  const lineMessage = `📰 今日精選摘要：\n\n${topNews}\n\n👉 回覆：「股市」、「科技」、「娛樂」、「政治」可獲得對應分類新聞。`;

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: lineMessage }),
  });

  console.log('推播結果:', response.status);
}

run().catch(console.error);
