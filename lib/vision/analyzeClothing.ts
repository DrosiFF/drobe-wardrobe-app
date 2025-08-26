// lib/vision/analyzeClothing.ts
import * as vision from "@google-cloud/vision";

export type ClothingAnalysis = {
  summary: {
    type: string;
    category: "TOP"|"BOTTOM"|"ONE_PIECE"|"FOOTWEAR"|"ACCESSORY"|"OUTERWEAR"|"UNKNOWN";
    colors: string[];
    style: "Casual"|"Formal"|"Sport"|"Streetwear"|"Business"|"Evening"|"Unknown";
    season: "ALL_SEASONS"|"SUMMER"|"WINTER"|"SPRING"|"AUTUMN";
    occasion: "CASUAL"|"FORMAL"|"SPORT"|"WORK"|"EVENING"|"PARTY"|"Unknown";
    confidence: number; // 0..1 from label fusion
  };
  details: {
    brand: string;
    material: string;
    size: string;
    condition: "New"|"Excellent"|"Good"|"Fair"|"Unknown";
    year: string;
    model: string;
    notes?: string[];
  };
  pricing: {
    estimatedValue: number;  // your "$75"
    marketPrice: number;     // your "$50"
    retailPrice: number;     // your "$100"
    range: [number, number]; // e.g., [40, 90]
    trend: "Stable"|"Up"|"Down";
    currency: string;        // "USD"
  };
  meta: {
    tsISO: string;
    usedVision: boolean;
    featuresUsed: string[];
    raw?: Record<string, unknown>;
  };
};

// Client will be created inside analyzeClothingImage function to handle missing credentials

function getMockClothingAnalysis(): ClothingAnalysis {
  return {
    summary: {
      type: "T-Shirt",
      category: "TOP",
      colors: ["Gray", "Blue"],
      style: "Casual",
      season: "ALL_SEASONS",
      occasion: "CASUAL",
      confidence: 0.85
    },
    details: {
      brand: "Mock Brand",
      material: "Cotton",
      size: "M",
      condition: "Good",
      year: "2023",
      model: "Mock Model T-Shirt"
    },
    pricing: {
      estimatedValue: 45,
      marketPrice: 30,
      retailPrice: 60,
      range: [25, 55],
      trend: "Stable",
      currency: "USD"
    },
    meta: {
      tsISO: new Date().toISOString(),
      usedVision: false,
      featuresUsed: ["mock-analysis"]
    }
  };
}

const CLOTHING_MAP: Record<string, {type: string; category: ClothingAnalysis["summary"]["category"]}> = {
  "shirt": {type:"Shirt", category:"TOP"},
  "t-shirt": {type:"T-Shirt", category:"TOP"},
  "blouse": {type:"Blouse", category:"TOP"},
  "top": {type:"Top", category:"TOP"},
  "trousers": {type:"Trousers", category:"BOTTOM"},
  "pants": {type:"Pants", category:"BOTTOM"},
  "jeans": {type:"Jeans", category:"BOTTOM"},
  "shorts": {type:"Shorts", category:"BOTTOM"},
  "skirt": {type:"Skirt", category:"BOTTOM"},
  "dress": {type:"Dress", category:"ONE_PIECE"},
  "jacket": {type:"Jacket", category:"OUTERWEAR"},
  "hoodie": {type:"Hoodie", category:"OUTERWEAR"},
  "coat": {type:"Coat", category:"OUTERWEAR"},
  "sweater": {type:"Sweater", category:"TOP"},
  "shoe": {type:"Shoes", category:"FOOTWEAR"},
  "sneakers": {type:"Sneakers", category:"FOOTWEAR"},
  "belt": {type:"Belt", category:"ACCESSORY"},
  "bag": {type:"Bag", category:"ACCESSORY"},
};

const MATERIALS = ["cotton","polyester","wool","silk","linen","leather","denim","nylon","spandex","viscose","rayon","acrylic","cashmere","satin","suede","modal","elastane","hemp","bamboo","tencel","lyocell","mixed","blend"];
const BRAND_HINTS = ["Nike","Adidas","Puma","Zara","H&M","Uniqlo","Gucci","Prada","Louis Vuitton","Hermès","Chanel","Balenciaga","Calvin Klein","Tommy Hilfiger","Levi","Levi's","Ralph Lauren","New Balance","Asics","Reebok","Fendi","Burberry","Moncler","Stone Island","The North Face","Patagonia","Under Armour","Off-White","Bape","Carhartt","Diesel","Guess","Lacoste"];

function pickType(labels: any[] | undefined) {
  let best = {type:"Unknown", category:"UNKNOWN" as ClothingAnalysis["summary"]["category"], conf:0};
  (labels||[]).forEach(l => {
    const key = l.description?.toLowerCase() || "";
    for (const k of Object.keys(CLOTHING_MAP)) {
      if (key.includes(k)) {
        const hit = CLOTHING_MAP[k];
        if ((l.score ?? 0) > best.conf) best = {type: hit.type, category: hit.category, conf: l.score ?? 0};
      }
    }
  });
  return {type: best.type, category: best.category, confidence: best.conf || 0.65};
}

function topColors(props: any | null | undefined): string[] {
  const cols = props?.dominantColors?.colors || [];
  return cols
    .sort((a: any, b: any) => (b.pixelFraction ?? 0) - (a.pixelFraction ?? 0))
    .slice(0, 3)
    .map((c: any) => {
      const rgb = c.color!;
      // simple nearest-name mapping
      const approx = (r: number, g: number, b: number): string => {
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max - min < 25 && max < 60) return "Black";
        if (max - min < 25 && max > 200) return "White";
        if (r > 150 && g < 100 && b < 100) return "Red";
        if (g > 150 && r < 120) return "Green";
        if (b > 150 && r < 120) return "Blue";
        if (r > 200 && g > 200 && b < 120) return "Yellow";
        if (r > 200 && g > 150 && b < 140) return "Beige";
        if (r > 160 && b > 160 && g < 140) return "Purple";
        return "Mixed";
      };
      return approx(rgb.red!, rgb.green!, rgb.blue!);
    });
}

function brandFrom(logo?: any[], web?: any, text?: string) {
  const logos = (logo||[]).map(l=>l.description).filter(Boolean) as string[];
  if (logos[0]) return logos[0];
  const bestGuess = web?.bestGuessLabels?.[0]?.label;
  if (bestGuess && BRAND_HINTS.some(b=>bestGuess.toLowerCase().includes(b.toLowerCase()))) return BRAND_HINTS.find(b=>bestGuess.toLowerCase().includes(b.toLowerCase()))!;
  for (const b of BRAND_HINTS) if ((text||"").toLowerCase().includes(b.toLowerCase())) return b;
  return "Unknown Brand";
}

function materialFrom(text: string) {
  const lower = text.toLowerCase();
  for (const m of MATERIALS) if (lower.includes(m)) return m[0].toUpperCase()+m.slice(1);
  if (lower.includes("mix") || lower.includes("blend")) return "Mixed Materials";
  return "Mixed Materials";
}

function sizeFrom(text: string) {
  const m = text.match(/\b(XXS|XS|S|M|L|XL|XXL|2XL|3XL|EU\s?\d{2}|US\s?\d{1,2}|UK\s?\d{1,2}|[34]\d)\b/i);
  return m ? m[0].toUpperCase() : "Unknown";
}

function styleSeasonOccasion(labelsText: string, colors: string[]) {
  const t = labelsText.toLowerCase();
  const style: ClothingAnalysis["summary"]["style"] = t.includes("formal") ? "Formal"
              : t.includes("sport") || t.includes("athletic") ? "Sport"
              : t.includes("street") || t.includes("hoodie") ? "Streetwear"
              : t.includes("business") ? "Business"
              : t.includes("evening") ? "Evening"
              : "Casual";
  const season: ClothingAnalysis["summary"]["season"] = colors.includes("Black") || t.includes("wool") || t.includes("coat") ? "WINTER"
                : t.includes("linen") || colors.includes("Beige") || colors.includes("White") ? "SUMMER"
                : "ALL_SEASONS";
  const occasion: ClothingAnalysis["summary"]["occasion"] = style === "Formal" ? "FORMAL"
                  : style === "Sport" ? "SPORT"
                  : style === "Business" ? "WORK"
                  : style === "Evening" ? "EVENING"
                  : "CASUAL";
  return {style, season, occasion};
}

function pricingHeuristic(brand: string, category: ClothingAnalysis["summary"]["category"], condition: ClothingAnalysis["details"]["condition"]) {
  const brandBase = (() => {
    if (["Gucci","Prada","Louis Vuitton","Chanel","Hermès","Fendi","Burberry","Moncler"].includes(brand)) return 250;
    if (["Nike","Adidas","Puma","New Balance","Reebok","Asics","The North Face","Patagonia","Stone Island"].includes(brand)) return 120;
    if (["Zara","H&M","Uniqlo","Levi","Levi's","Calvin Klein","Tommy Hilfiger","Lacoste","Diesel","Guess","Carhartt"].includes(brand)) return 80;
    if (brand === "Unknown Brand") return 45;
    return 95;
  })();
  const catFactor = {TOP:0.9, BOTTOM:1.0, ONE_PIECE:1.2, FOOTWEAR:1.3, ACCESSORY:0.8, OUTERWEAR:1.5, UNKNOWN:1.0}[category];
  const condFactor = {New:1.2, Excellent:1.0, Good:0.85, Fair:0.6, Unknown:0.85}[condition];
  const marketPrice = Math.round(brandBase * catFactor * condFactor);
  const estimatedValue = Math.round(marketPrice * 1.5);
  const retailPrice = Math.round(marketPrice * 2);
  const low = Math.max(10, Math.round(marketPrice * 0.8));
  const high = Math.round(marketPrice * 1.8);
  const trend: ClothingAnalysis["pricing"]["trend"] = "Stable";
  return {estimatedValue, marketPrice, retailPrice, range:[low, high] as [number,number], trend, currency:"USD"};
}

export async function analyzeClothingImage(input: {gcsUri?: string; httpUrl?: string; base64?: string;}): Promise<ClothingAnalysis> {
  const imageRequest = input.gcsUri ? {source: {imageUri: input.gcsUri}}
                     : input.httpUrl ? {source: {imageUri: input.httpUrl}}
                     : input.base64 ? {content: input.base64}
                     : undefined;
  if (!imageRequest) throw new Error("No image provided");

  // Check if Google Cloud credentials are available
  const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_VISION_CREDENTIALS;
  if (!hasCredentials) {
    console.log('Google Vision credentials not found, returning mock analysis');
    return getMockClothingAnalysis();
  }

  let labels: any[] = [];
  let props: any = null;
  let logos: any[] = [];
  let web: any = null;
  let text = "";

  try {
    // Create client inside function to handle missing credentials gracefully
    const client = new vision.ImageAnnotatorClient();
    
    const [labelsRes, propsRes, logosRes, webRes, textRes] = await Promise.all([
      client.labelDetection({image: imageRequest}),
      client.imageProperties({image: imageRequest}),
      client.logoDetection({image: imageRequest}),
      client.webDetection({image: imageRequest}),
      client.textDetection({image: imageRequest}),
    ]);

    labels = labelsRes[0].labelAnnotations || [];
    props = propsRes[0].imagePropertiesAnnotation;
    logos = logosRes[0].logoAnnotations || [];
    web = webRes[0].webDetection;
    text = (textRes[0].fullTextAnnotation?.text || "").replace(/\s+/g," ").trim();
  } catch (error) {
    console.error('Google Vision API error:', error);
    return getMockClothingAnalysis();
  }

  const ocrText = text;

  const {type, category, confidence} = pickType(labels);
  const colors = topColors(props);
  const brand = brandFrom(logos, web, ocrText);
  const material = materialFrom(ocrText);
  const size = sizeFrom(ocrText);
  const {style, season, occasion} = styleSeasonOccasion(
    labels.map(l=>l.description).join(" ") + " " + (web?.bestGuessLabels?.map(b=>b.label).join(" ")||""),
    colors
  );

  // very light heuristics for these; your UI shows defaults already
  const condition: ClothingAnalysis["details"]["condition"] =
    ocrText.match(/\b(new|unworn|with tags)\b/i) ? "New" :
    ocrText.match(/\b(excellent|like new)\b/i) ? "Excellent" :
    "Good";
  const year = (ocrText.match(/\b(20\d{2}|19\d{2})\b/)?.[0]) || new Date().getFullYear().toString();
  const model = (ocrText.match(/\b(model|style|fit)\s*[:\-]?\s*([A-Za-z0-9\- ]{2,25})/i)?.[2]) || (type==="Unknown" ? "" : `${type} ${colors[0]||""}`.trim());

  const pricing = pricingHeuristic(brand, category, condition);

  return {
    summary: {type, category, colors, style, season, occasion, confidence},
    details: {brand, material, size, condition, year, model},
    pricing,
    meta: {
      tsISO: new Date().toISOString(),
      usedVision: true,
      featuresUsed: ["labelDetection","imageProperties","logoDetection","webDetection","textDetection"],
    }
  };
}
