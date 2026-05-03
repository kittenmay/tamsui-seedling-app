const PLANT_ID_API_KEY = "jf2mt4tav6C05s3ODF0qpRb3Rezqi3VyfZ4z9ZAS73NlZyOcOV";

const DISEASE_MAP = {
  "powdery mildew": "白粉病",
  "downy mildew": "霜霉病",
  "rust": "銹病",
  "leaf spot": "葉斑病",
  "blight": "枯萎病",
  "root rot": "根腐病",
  "anthracnose": "炭疽病",
  "bacterial wilt": "細菌性萎凋病",
  "mosaic virus": "花葉病毒",
  "aphids": "蚜蟲",
  "spider mites": "紅蜘蛛",
  "whitefly": "白粉蝨",
  "healthy": "健康",
  "nutrient deficiency": "養分缺乏",
  "water deficiency": "水分不足",
  "overwatering": "澆水過多",
  "sunburn": "日燒",
};

function translateDisease(name) {
  const lower = (name || "").toLowerCase();
  for (const [en, zh] of Object.entries(DISEASE_MAP)) {
    if (lower.includes(en)) return zh;
  }
  return name || "未知病害";
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }

  try {
    const { image } = await request.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");

    const plantRes = await fetch("https://api.plant.id/v3/health_assessment", {
      method: "POST",
      headers: {
        "Api-Key": PLANT_ID_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: [cleanImage],
        similar_images: true,
      }),
    });

    const data = await plantRes.json();

    if (!plantRes.ok) {
      return new Response(JSON.stringify({ error: "Plant.id API error", detail: data }), {
        status: plantRes.status,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    const result = data.result;
    const isHealthy = result?.is_healthy?.binary ?? false;
    const diseases = result?.disease?.suggestions || [];

    const diagnoses = diseases.slice(0, 3).map((d) => ({
      name: d.name,
      nameZh: translateDisease(d.name),
      probability: Math.round((d.probability || 0) * 100),
      details: {
        description: d.details?.description || "",
        treatment: d.details?.treatment
          ? (Array.isArray(d.details.treatment)
              ? d.details.treatment.map((t) => t.value || t).join("；")
              : d.details.treatment)
          : "",
      },
    }));

    if (diagnoses.length === 0) {
      return new Response(JSON.stringify({
        isHealthy: true,
        diagnoses: [],
        message: "分析完成，但未能確定具體問題。建議諮詢專業農技人員。",
      }), {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ isHealthy, diagnoses }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
}
