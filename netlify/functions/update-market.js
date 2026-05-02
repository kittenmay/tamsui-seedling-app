const SUPABASE_URL = "https://ahldlvrflijamguspxyi.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobGRsdnJmbGlqYW1ndXNweHlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI2MTY1MywiZXhwIjoyMDkyODM3NjUzfQ.NC7syVXy6kkrnTt7mJkpUgw_uQoFAVevxRN2i5_SMbA";

const CROP_MAP = [
  { name: '空心菜', variety: '小葉種', keys: ['蕹菜-小葉', '蕹菜'] },
  { name: '小黃瓜', variety: '一般', keys: ['花胡瓜'] },
  { name: '絲瓜', variety: '一般', keys: ['絲瓜'] },
  { name: '番茄', variety: '牛番茄', keys: ['番茄-牛番茄'] },
  { name: '高麗菜', variety: '初秋', keys: ['甘藍-初秋'] },
  { name: '萵苣', variety: '結球萵', keys: ['萵苣菜-結球萵'] },
];

const TARGET_MARKETS = ['三重區', '板橋區', '台北一', '台北二'];

function computeTrend(current, previous) {
  if (!previous || previous === 0) return 'stable';
  const diff = current - previous;
  if (diff > 3) return 'up';
  if (diff < -3) return 'down';
  return 'stable';
}

exports.handler = async () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const res = await fetch("https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx");
    if (!res.ok) throw new Error(`MOA API error: ${res.status}`);
    const data = await res.json();

    const marketName = '台北三重/板橋批發';

    for (const crop of CROP_MAP) {
      const matched = data.filter(d =>
        TARGET_MARKETS.includes(d.市場名稱) &&
        crop.keys.some(k => d.作物名稱 === k) &&
        d.平均價 > 0
      );

      if (matched.length === 0) continue;

      const prices = matched.map(d => d.平均價);
      const lows = matched.map(d => d.上價 || d.平均價 * 0.7);
      const highs = matched.map(d => d.下價 ? d.上價 : d.平均價 * 1.4);

      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const lowPrice = Math.round(lows.reduce((a, b) => a + b, 0) / lows.length);
      const highPrice = Math.round(highs.reduce((a, b) => a + b, 0) / highs.length);

      let trend = 'stable';
      const mainMarket = matched.find(d => d.市場名稱 === '台北一') || matched[0];
      const upper = mainMarket.上價 || avgPrice * 1.3;
      const mid = mainMarket.中價 || avgPrice;
      if (upper > avgPrice * 1.3) trend = 'up';
      else if (mid < avgPrice * 0.85) trend = 'down';

      const supabaseBody = JSON.stringify({
        crop_name: crop.name,
        variety: crop.variety,
        market: marketName,
        price_low: lowPrice,
        price_high: highPrice,
        price_avg: avgPrice,
        trend,
        updated_at: new Date().toISOString().split('T')[0],
      });

      const supabaseRes = await fetch(
        `${SUPABASE_URL}/rest/v1/market_prices?crop_name=eq.${encodeURIComponent(crop.name)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: supabaseBody,
        }
      );

      if (!supabaseRes.ok && supabaseRes.status !== 404) {
        const insertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/market_prices`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: supabaseBody,
          }
        );
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, updated: CROP_MAP.map(c => c.name) }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
