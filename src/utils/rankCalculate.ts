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


// Example usage
const text = 
`**Bikanervala:** Famous for Indian sweets and snacks.
**Govinda's Restaurant:** Known for sattvik meals.
**Saravana Bhavan:** Authentic South Indian food.
**Sagar Ratna:** Great for dosas and idlis.`
;

// console.log(extractBrandRanks(text, ["Sagar Ratna", "sagarratna.in", "sagar ratna"]));
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

