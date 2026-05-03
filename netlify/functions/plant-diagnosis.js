const PLANT_ID_API_KEY = "jf2mt4tav6C05s3ODF0qpRb3Rezqi3VyfZ4z9ZAS73NlZyOcOV";

const DISEASE_MAP = {
  "Powdery Mildew": "白粉病",
  "Downy Mildew": "霜霉病",
  "Rust": "銹病",
  "Leaf Spot": "葉斑病",
  "Blight": "枯萎病",
  "Root Rot": "根腐病",
  "Anthracnose": "炭疽病",
  "Bacterial Wilt": "細菌性萎凋病",
  "Mosaic Virus": "花葉病毒",
  "Aphids": "蚜蟲",
  "Spider Mites": "紅蜘蛛",
  "Whitefly": "白粉蝨",
  "Healthy": "健康",
  "Nutrient Deficiency": "養分缺乏",
  "Water Deficiency": "水分不足",
  "Overwatering": "澆水過多",
  "Sunburn": "日燒",
};

const DISEASE_ADVICE = {
  "Powdery Mildew": {
    description: "葉片或莖部表面出現白色粉末狀黴層，嚴重時葉片枯黃捲曲。好發於潮濕通風不良的環境。",
    treatment: "1.摘除嚴重感染葉片並銷毀。2.以稀釋50倍的葵花油或市售碳酸氫鉀噴灑。3.加強通風，避免傍晚澆水。"
  },
  "Downy Mildew": {
    description: "葉片正面出現黃色斑點，背面有灰紫色黴層。好發於低溫高濕季節，蔓延快速。",
    treatment: "1.立即摘除病葉。2.以亞磷酸混合氫氧化鉀噴灑葉背。3.避免密植，保持通風。4.清晨澆水，避免葉片長時間潮濕。"
  },
  "Rust": {
    description: "葉片出現橘紅色或褐色粉末狀斑點，嚴重時葉片枯黃。夏季高溫多濕易發病。",
    treatment: "1.拔除嚴重感染植株。2.噴灑市售碳酸氫鉀或硫磺製劑。3.避免密植，保持通風良好。"
  },
  "Leaf Spot": {
    description: "葉片上出現褐色或黑色圓形斑點，斑點邊緣可能帶有黃色暈圈。溼度過高容易擴散。",
    treatment: "1.摘除病葉減少感染源。2.避免直接澆水在葉片上。3.清潔田間落葉雜草。4.可施用銅劑或枯草桿菌。"
  },
  "Blight": {
    description: "整株或部分枝葉突然枯萎褐化，維管束變為褐色。高溫多雨的環境下發病嚴重。",
    treatment: "1.拔除並銷毀病株，不可堆肥。2.輪作改種非茄科作物。3.土壤可施用木黴菌或溶磷菌改善。4.加強田間排水。"
  },
  "Root Rot": {
    description: "根部變黑腐爛，植株萎凋枯死。澆水過多或排水不良是主要誘因。",
    treatment: "1.立即停止澆水，改善排水。2.挖除腐根，更換盆土。3.以木黴菌或枯草桿菌澆灌土壤。4.適度減少澆水頻率，見乾再澆。"
  },
  "Anthracnose": {
    description: "葉片或果實上出現黑色凹陷斑點，潮濕時斑點上會產生橘色孢子堆。高溫高濕環境易傳播。",
    treatment: "1.摘除病葉病果。2.避免密植保持通風。3.以銅劑或枯草桿菌預防噴灑。4.避免澆水過多及葉片長時間潮濕。"
  },
  "Bacterial Wilt": {
    description: "植株突然萎凋但葉片保持綠色，維管束變褐腐爛。借由土壤、雨水或蟲媒傳播。",
    treatment: "1.立即拔除銷毀病株。2.避免連作，進行輪作。3.嫁接抗病品種砧木。4.徹底清潔農具避免交叉感染。"
  },
  "Mosaic Virus": {
    description: "葉片出現深淺不一的嵌紋斑，葉緣扭曲變形，植株生長停滯。由蚜蟲等刺吸式害蟲傳播。",
    treatment: "1.拔除病株銷毀。2.加強防治蚜蟲、薊馬等媒介昆蟲。3.使用抗病品種。4.種子可用溫湯處理消毒。"
  },
  "Aphids": {
    description: "蚜蟲群聚於嫩葉和嫩芽上吸食汁液，導致葉片捲曲變形且分泌蜜露引發煤煙病。繁殖極快。",
    treatment: "1.用肥皂水或苦楝油稀釋噴灑。2.釋放瓢蟲、草蛉等天敵。3.懸掛黃色黏蟲板誘捕。4.嚴重時以窄域油處理。"
  },
  "Spider Mites": {
    description: "紅蜘蛛聚集在葉背吸食汁液，葉片出現黃白色細小斑點，嚴重時結網、落葉。乾燥高溫環境繁殖快速。",
    treatment: "1.增加濕度，對葉背噴水。2.噴灑苦楝油或泡舒稀釋液。3.清除田間雜草減少寄主。4.避免使用廣效性殺蟲劑傷害天敵。"
  },
  "Whitefly": {
    description: "粉蝨群聚在葉背吸食汁液，葉片黃化掉落，會分泌蜜露導致煤煙病，並可傳播多種病毒。",
    treatment: "1.懸掛黃色黏蟲板大量捕殺。2.以苦楝油或窄域油稀釋噴灑葉背。3.保護草蛉、小黑花椿象等天敵。4.交替使用不同類型藥劑防止抗藥性。"
  },
  "Nutrient Deficiency": {
    description: "植株生長遲緩、葉片黃化或出現異常色斑。缺少氮、磷、鉀、微量元素等都可能導致不同症狀。",
    treatment: "1.施用具三要素均衡的有機肥料。2.葉面噴灑微量元素補充液。3.檢測土壤酸鹼度並適度調整。4.定時追肥保持肥力。"
  },
  "Water Deficiency": {
    description: "葉片下垂變軟，葉尖葉緣乾枯呈褐色。土壤過於乾燥導致根系無法正常供水。",
    treatment: "1.立即澆透水直到水從排水孔流出。2.以稻草、落葉等覆蓋土表減少蒸發。3.夏季高溫時早晚各澆一次。4.選擇清晨或傍晚澆水。"
  },
  "Overwatering": {
    description: "葉片黃化下垂且質地柔軟，土壤長期潮濕，根部缺氧導致爛根。",
    treatment: "1.立即停止澆水直到土壤半乾。2.改善表土排水，必要時更換透氣性好的土壤。3.適度鬆土增加透氣。4.見乾見溼為原則，土表乾了再澆水。"
  },
  "Sunburn": {
    description: "葉片邊緣或向陽面出現黃褐色燒焦狀斑塊，發生於強光直射或高溫乾燥的環境。",
    treatment: "1.加設遮光網或移至半日照處。2.避免中午高溫時段澆水在葉片上。3.在植株周圍增加濕度。4.選擇較耐熱品種。"
  },
};

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

    const diagnoses = diseases.slice(0, 3).map((d) => {
      const zhName = DISEASE_MAP[d.name] || d.name;
      const advice = DISEASE_ADVICE[d.name];
      return {
        name: d.name,
        nameZh: zhName,
        probability: Math.round(d.probability * 100),
        details: {
          description: advice ? advice.description : (d.details?.description || ""),
          treatment: advice ? advice.treatment : (d.details?.treatment || ""),
        },
      };
    });

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
