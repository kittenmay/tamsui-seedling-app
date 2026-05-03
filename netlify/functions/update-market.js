const SUPABASE_URL = "https://ahldlvrflijamguspxyi.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobGRsdnJmbGlqYW1ndXNweHlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI2MTY1MywiZXhwIjoyMDkyODM3NjUzfQ.NC7syVXy6kkrnTt7mJkpUgw_uQoFAVevxRN2i5_SMbA";

const TARGET_MARKETS = ['三重區', '板橋區', '台北一', '台北二'];

const NAME_MAP = {
  '甘藍-初秋': '高麗菜',
  '甘藍-改良種': '高麗菜',
  '甘藍-紫色': '高麗菜',
  '蕹菜-小葉': '空心菜',
  '蕹菜-大葉': '空心菜',
  '蕹菜-水蕹菜': '空心菜',
  '蕹菜': '空心菜',
  '花胡瓜': '小黃瓜',
  '花胡瓜-其他': '小黃瓜',
  '番茄-牛番茄': '番茄',
  '番茄-黑柿': '番茄',
  '番茄-粉柿': '番茄',
  '萵苣菜-結球萵': '萵苣',
  '萵苣菜-油麥菜': '萵苣',
  '萵苣菜-本島尖葉': '萵苣',
  '萵苣菜-本島圓葉': '萵苣',
  '萵苣菜-蘿美': '萵苣',
  '萵苣菜-水耕': '萵苣',
  '絲瓜': '絲瓜',
  '絲瓜-角瓜': '絲瓜',
  '絲瓜-其他': '絲瓜',
  '小白菜-土白菜': '小白菜',
  '小白菜-奶油白': '小白菜',
  '小白菜-蚵仔白': '小白菜',
  '小白菜-其他': '小白菜',
  '青江白菜-小梗': '青江菜',
  '菠菜-角葉': '菠菜',
  '菠菜-圓葉': '菠菜',
  '芹菜-白梗': '芹菜',
  '芹菜-青梗': '芹菜',
  '芹菜-西洋芹菜': '芹菜',
  '青蔥-日蔥': '青蔥',
  '青蔥-北蔥': '青蔥',
  '青蔥-粉蔥': '青蔥',
  '青蔥-大蔥': '青蔥',
  '蘿蔔-矸仔': '白蘿蔔',
  '胡蘿蔔-清洗': '胡蘿蔔',
  '胡蘿蔔-未洗': '胡蘿蔔',
  '苦瓜-白大米': '苦瓜',
  '苦瓜-青大米': '苦瓜',
  '苦瓜-翠綠': '苦瓜',
  '苦瓜-山苦瓜': '苦瓜',
  '苦瓜-其他': '苦瓜',
  '茄子-胭脂茄': '茄子',
  '茄子-麻荸茄': '茄子',
  '茄子-日本種': '茄子',
  '茄子-其他': '茄子',
  '玉米-超甜白': '玉米',
  '玉米-甜軟殼': '玉米',
  '玉米-白玉米': '玉米',
  '玉米-糯米白': '玉米',
  '玉米-糯米黑': '玉米',
  '玉米-白龍王': '玉米',
  '玉米-其他': '玉米',
  '花椰菜-白梗': '花椰菜',
  '花椰菜-青梗': '花椰菜',
  '花椰菜-其他': '花椰菜',
  '青花苔': '青花菜',
  '青花苔-青花筍': '青花菜',
  '南瓜-木瓜形': '南瓜',
  '南瓜-東昇': '南瓜',
  '南瓜-栗子': '南瓜',
  '南瓜-其他': '南瓜',
  '辣椒-青龍': '辣椒',
  '辣椒-紅小': '辣椒',
  '辣椒-朝天椒': '辣椒',
  '辣椒-雞心': '辣椒',
  '辣椒-糯米椒': '辣椒',
  '辣椒-其他': '辣椒',
  '甜椒-青椒': '甜椒',
  '甜椒-彩色種': '甜椒',
  '甜椒-新香': '甜椒',
  '豌豆-白花': '豌豆',
  '豌豆-紅花': '豌豆',
  '豌豆-甜豌豆': '豌豆',
  '韭菜-白頭': '韭菜',
  '韭菜-青頭': '韭菜',
  '韭菜-韭菜花': '韭菜',
  '高麗菜-進口 初秋': '高麗菜',
  '豌豆-進口 甜豌豆': '豌豆',
};

function parseCropName(rawName) {
  const mapped = NAME_MAP[rawName];
  if (mapped) return { name: mapped, variety: rawName };

  const parts = rawName.split('-');
  if (parts.length === 2 && parts[1].length <= 6) {
    return { name: parts[0], variety: parts[1] };
  }
  if (rawName.includes('-進口')) {
    return { name: rawName.replace('-進口', ''), variety: '進口' };
  }
  return { name: rawName, variety: '一般' };
}

exports.handler = async () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const res = await fetch("https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx");
    if (!res.ok) throw new Error(`MOA API error: ${res.status}`);
    const all = await res.json();

    const filtered = all.filter(d =>
      TARGET_MARKETS.includes(d.市場名稱) &&
      d.種類代碼 === 'N04' &&
      d.平均價 > 0
    );

    const groups = new Map();
    for (const d of filtered) {
      const key = d.作物名稱;
      const vol = parseFloat(d.交易量) || 0;
      if (!groups.has(key)) {
        groups.set(key, { records: [], totalVolume: 0 });
      }
      const g = groups.get(key);
      g.records.push(d);
      g.totalVolume += vol;
    }

    const sorted = [...groups.entries()]
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume);

    const today = new Date().toISOString().split('T')[0];
    const rows = [];

    for (const [rawName, group] of sorted) {
      const parsed = parseCropName(rawName);
      const prices = group.records.map(d => d.平均價);
      const lows = group.records.map(d => d.上價 || d.平均價 * 0.7);
      const highs = group.records.map(d => d.下價 ? d.上價 : d.平均價 * 1.4);

      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const lowPrice = Math.round(lows.reduce((a, b) => a + b, 0) / lows.length);
      const highPrice = Math.round(highs.reduce((a, b) => a + b, 0) / highs.length);

      let trend = 'stable';
      const main = group.records.find(d => d.市場名稱 === '台北一') || group.records[0];
      const upper = main.上價 || avgPrice * 1.3;
      const mid = main.中價 || avgPrice;
      if (upper > avgPrice * 1.3) trend = 'up';
      else if (mid < avgPrice * 0.85) trend = 'down';

      rows.push({
        crop_name: parsed.name,
        variety: parsed.variety,
        market: '台北三重/板橋批發',
        price_low: lowPrice,
        price_high: highPrice,
        price_avg: avgPrice,
        trend,
        volume: Math.round(group.totalVolume),
        updated_at: today,
      });
    }

    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?id=gt.0`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    for (const row of rows) {
      await fetch(`${SUPABASE_URL}/rest/v1/market_prices`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(row),
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, count: rows.length, crops: rows.map(r => r.crop_name) }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
