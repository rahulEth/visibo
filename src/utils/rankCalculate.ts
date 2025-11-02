interface BrandRanks {
  [brandName: string]: number;
}
interface ExtractedResult {
//   targetBrand: string;
  visibilityScore: string,
  targetRank: number;
  allBrands: BrandRanks;
}

export function visibilityMatrix(text: string, targetBrand: string[]): ExtractedResult {
  // Match patterns like:
  // - 1. **Brand Name:** ...
  // - **Brand Name:** ...
  // - **Brand Name** ...
  const regex = /(?:\d+\.\s*)?\*\*(.*?)\*\*:?/g;
  const brandRanks: BrandRanks = {};
  let match: RegExpExecArray | null;
  let rank = 0;

  // Extract brand names in order of appearance
  while ((match = regex.exec(text)) !== null) {
    // console.log('match----- ', match)
    const brandName = match[1].trim().replace(/:$/, "");
    // console.log('banrdName---- ', brandName)
    // Avoid duplicate ranks for repeated brands
    if (!brandRanks[brandName]) {
      rank++;
      brandRanks[brandName] = rank;
    }
  }


  let targetRank = 0;
  let matchValue:string | undefined = '';
  console.log("brandRanks:----- ",  JSON.stringify(brandRanks, null, 2))
  for (const [name, r] of Object.entries(brandRanks)) {
    // console.log("name, normalizedTarget", name, normalizedTarget)
    
    // find first matching value (case-insensitive & punctuation-insensitive)
    matchValue = targetBrand.find(item => normalize(item).includes(normalize(name)));
    if (matchValue) {
      targetRank = r;
    }
  }
  // visibilityScore = f*w*r*p

  // f = freq-of-brand-metion (assuming only once brand is mentioned in answer)
  // w = wight-based-on-position 
  // r= relevance score of metion to the query /topic
  // p = platfrom weight 
  let visibilityScore = '0';
  if(targetRank){
    visibilityScore = ((1 * (1/targetRank) * 1 * 1)* 100).toFixed(2)
  }
  return {
    // targetBrand: matchValue,
    visibilityScore,
    targetRank,
    allBrands: brandRanks,
  };
}

export function visibilityMatrixChatGPT(text: string, targetBrand: string[]): ExtractedResult {
  // Split the text into lines starting with "-"
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("-"));

  const brandRanks: BrandRanks = {};

  lines.forEach((line, index) => {
    // Extract brand name before the first comma or parenthesis
    const match = line.match(/^- ([^,(\n]+)/);
    if (match && match[1]) {
      const brandName = match[1].trim();
      brandRanks[brandName] = index + 1;
    }
  });


  let targetRank = 0;
  let matchValue:string | undefined = '';
  console.log("brandRanks:----- ",  JSON.stringify(brandRanks, null, 2))
  for (const [name, r] of Object.entries(brandRanks)) {
    // console.log("name, normalizedTarget", name, normalizedTarget)
    
    // find first matching value (case-insensitive & punctuation-insensitive)
    matchValue = targetBrand.find(item => normalize(item).includes(normalize(name)));
    if (matchValue) {
      targetRank = r;
    }
  }
  // visibilityScore = f*w*r*p

  // f = freq-of-brand-metion (assuming only once brand is mentioned in answer)
  // w = wight-based-on-position 
  // r= relevance score of metion to the query /topic
  // p = platfrom weight 
  let visibilityScore = '0';
  if(targetRank){
    visibilityScore = ((1 * (1/targetRank) * 1 * 1)* 100).toFixed(2)
  }
  return {
    // targetBrand: matchValue,
    visibilityScore,
    targetRank,
    allBrands: brandRanks,
  };
}

export function visibilityMatrixPerplexity(text: string, targetBrand: string[]): ExtractedResult {
  // Split the text into lines starting with "-"
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("-"));

  const brandRanks: BrandRanks = {};

  lines.forEach((line, index) => {
    // Extract brand name before the first comma or parenthesis
    const match = line.match(/^- ([^,(\n]+)/);
    if (match && match[1]) {
      const brandName = match[1].trim();
      brandRanks[brandName] = index + 1;
    }
  });


  let targetRank = 0;
  let matchValue:string | undefined = '';
  console.log("brandRanks:----- ",  JSON.stringify(brandRanks, null, 2))
  for (const [name, r] of Object.entries(brandRanks)) {
    // console.log("name, normalizedTarget", name, normalizedTarget)
    
    // find first matching value (case-insensitive & punctuation-insensitive)
    matchValue = targetBrand.find(item => normalize(item).includes(normalize(name)));
    if (matchValue) {
      targetRank = r;
    }
  }
  // visibilityScore = f*w*r*p

  // f = freq-of-brand-metion (assuming only once brand is mentioned in answer)
  // w = wight-based-on-position 
  // r= relevance score of metion to the query /topic
  // p = platfrom weight 
  let visibilityScore = '0';
  if(targetRank){
    visibilityScore = ((1 * (1/targetRank) * 1 * 1)* 100).toFixed(2)
  }
  return {
    // targetBrand: matchValue,
    visibilityScore,
    targetRank,
    allBrands: brandRanks,
  };
}

// Example usage
const text = 
`**Bikanervala:** Famous for Indian sweets and snacks.
**Govinda's Restaurant:** Known for sattvik meals.
**Saravana Bhavan:** Authentic South Indian food.
**Sagar Ratna:** Great for dosas and idlis.`
;
const text1 = 
`- Burma Burma Restaurant & Tea Room, DLF Mall of India, Sector 18 (Burmese; 100% vegetarian). ([happycow.net](https://www.happycow.net/reviews/burma-burma-noida-409822?utm_source=openai))
- Naivedyam, Sector 63 (South Indian; veg only). ([zomato.com](https://www.zomato.com/ncr/naivedyam-sector-63-noida?utm_source=openai))
- Sagar Ratna, Ansal Fortune Arcade, Sector 18 (South Indian; pure veg). ([swiggy.com](https://www.swiggy.com/restaurants/sagar-ratna-sector-18-noida-687058/dineout?utm_source=openai))
- Shree Rathnam, DLF Mall of India, Sector 18 (South Indian; pure veg). ([swiggy.com](https://www.swiggy.com/restaurants/shree-rathnam-sector-18-noida-687294/dineout?utm_source=openai))
- Bikanervala, Wave Silver Tower, Sector 18 (Indian snacks, meals & sweets; veg only). ([bikanervala.com](https://bikanervala.com/pages/sector-18-noida?utm_source=openai))
- Haldiram’s, Sector 18 and DLF Mall of India (multi‑cuisine & sweets; veg only). ([hrstores.haldiram.com](https://hrstores.haldiram.com/location/uttar-pradesh/noida/sector-18?utm_source=openai))
- Imly, DLF Mall of India, Sector 18 (Indian street food; veg only). ([zomato.com](https://www.zomato.com/ncr/imly-sector-18-noida?utm_source=openai))
- Dasaprakash, Sector 104 (Udupi/South Indian; veg only). ([stores.thedasaprakash.com](https://stores.thedasaprakash.com/store-pages/dasaprakash-sector-104-noida-noida/?utm_source=openai))
- Udipi’s Aahar, Sector 104 (South Indian; veg only). ([zomato.com](https://www.zomato.com/ncr/udipis-aahar-hajipur-noida?utm_source=openai))
- Udupi Krishna Restaurant, Sector 137 (near Metro; South Indian; veg only). ([zomato.com](https://www.zomato.com/ncr/udupi-krishna-restaurant-sector-135-noida?utm_source=openai))`

// console.log(visibilityMatrixChatGPT(text1, ["Sagar Ratna", "sagarratna.in", "sagar ratna"]));
// console.log(extractBrandRanks(text, "Mantraflix"));

// normalize by lowercasing and removing spaces/punctuation
function normalize(str:string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface CitationResult{
  status: string,
  value : {
    mentioned: boolean,
    url: string
  }
}
export function citationScoreCalculate(arr : any[]){
    const result = arr.reduce((acc:any, obj:any) =>{
      if(obj.value.mentioned) acc.citationCount++
        acc.total++
      return acc ; 
    },{citationCount:0, total:0})
    
   const percentage =  ((result.citationCount/result.total) * 100).toFixed(2);
   return percentage;
}
