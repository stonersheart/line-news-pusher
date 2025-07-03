const WORKER_URL = process.env.WORKER_URL || 'https://你的worker子網域.workers.dev';

const category = '新聞';  // 可改為 "科技"、"財經" 等

(async () => {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: category })
  });

  if (!res.ok) {
    console.error(`❌ 推播失敗，狀態碼: ${res.status}`);
    const errorText = await res.text();
    console.error(errorText);
  } else {
    console.log("✅ 已成功推播每日新聞");
  }
})();
