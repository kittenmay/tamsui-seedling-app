const PLANT_ID_API_KEY = "jf2mt4tav6C05s3ODF0qpRb3Rezqi3VyfZ4z9ZAS73NlZyOcOV";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { image } = JSON.parse(event.body);
    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No image provided" }) };
    }

    const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://api.plant.id/v3/health_assessment", {
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

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "Plant.id API error", detail: data }),
      };
    }

    const result = data.result;
    const isHealthy = result?.is_healthy?.binary ?? false;
    const diseases = result?.disease?.suggestions || [];

    const zhhantNames = {
      "Powdery Mildew": "白粉病",
      "Downy Mildew": "霜霉病",
      "Rust": "锈病",
      "Leaf Spot": "叶斑病",
      "Blight": "枯萎病",
      "Root Rot": "根腐病",
      "Anthracnose": "炭疽病",
      "Bacterial Wilt": "细菌性萎凋病",
      "Mosaic Virus": "花叶病毒",
      "Aphids": "蚜虫",
      "Spider Mites": "红蜘蛛",
      "Whitefly": "白粉虱",
      "Healthy": "健康",
      "Nutrient Deficiency": "养分缺乏",
      "Water Deficiency": "水分不足",
      "Overwatering": "浇水过多",
      "Sunburn": "日烧",
    };

    const diagnoses = diseases.slice(0, 3).map((d) => ({
      name: d.name,
      nameZh: zhhantNames[d.name] || d.name,
      probability: Math.round(d.probability * 100),
      details: d.details || {},
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isHealthy,
        diagnoses,
        result: {
          isPlant: result?.is_plant?.binary ?? null,
          isHealthy: isHealthy,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error", message: err.message }),
    };
  }
};
