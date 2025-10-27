import * as cheerio from "cheerio";
import { response } from "express";
import { keywords } from '../config/brand';
import { brandMentioned } from '../utils/brandVisibility';
// Define your brand name patterns
const brandPatterns = ["Sagar Ratna", "sagarratna.in", "sagar ratna"];

async function brandMentionedInURL(url: string, brandPatterns: string[]) {
  try {
      // 1. Fetch page HTML
      const response = await fetch(url, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml'
        },
        // redirect: "follow" 
      }
    );
    console.log("respone url ", response.url)
    const html = await response.text()
    // console.log("html------ ", html)
    if (!response.ok) {
       throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    // 2. Extract text
    const $ = cheerio.load(html);
    let text = $("body").text();

    // 3. Build safe regex (case-insensitive)
    const regex = new RegExp(brandPatterns.join("|"), "i");
    console.log("regex------------- ", regex);

    const mentioned =  regex.test(text);
    return {mentioned, url: response.url}
  } catch (err:any) {
    console.error(`Error fetching ${url}:`, err.message);
    return {mentioned: false, url};
  }
}

export async function uniqueUrlsFn(response:any){
  const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
  const uniqueUrls = chunks.map((chunk:any) =>{
        return chunk.web.uri
        // return  {title: chunk.web.title, uri: chunk.web.uri}      
  })
  
  return await checkCitations(uniqueUrls, keywords) 
}

export async function checkCitations(citations: string[], brandPatterns: string[]) {
  const results = await Promise.allSettled(
    citations.map(uri => brandMentionedInURL(uri, brandPatterns))
  );
//   console.log("result----- ", results)
//   return citations.map((url: string, i:number) => ({
//     url: results[i].value.url,
//     mentioned: results[i].status === "fulfilled" ? results[i].value.status : false
//   }));
   return results
}


export async function addCitations(response:any) {
    let text = response.text;
    let mentioned = false
    let totalUrls: string[] = []
    const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
    const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
    console.log({supports, chunks})

    // Sort supports by end_index in descending order to avoid shifting issues when inserting.
    const sortedSupports = [...supports].sort(
        (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
    );
    mentioned = brandMentioned(text, keywords)
    for (const support of sortedSupports) {
        //  console.log("------------ segment", support.segment)
        //  console.log("------------ groundingChunkIndices", support.groundingChunkIndices)
        const endIndex = support.segment?.endIndex;
        if (endIndex === undefined || !support.groundingChunkIndices?.length) {
        continue;
        }
        const citationLinks =  await Promise.all(
          support.groundingChunkIndices
          .map(async (i:number) => {
              // console.log("citationLinks ---- ", chunks[i]?.web?.uri, chunks[i]?.web?.title)
              const uri = chunks[i]?.web?.uri;
              const tittle = chunks[i]?.web?.title;
  
              if (uri) {
              const resp =  await fetch(uri, {redirect:"follow"})
              return `${tittle}[${i + 1}](${resp.url})`;
              }
              return null;
          })
         .filter(Boolean))
        //  console.log("citationLinks------- ", citationLinks)
        totalUrls = [...totalUrls, ...citationLinks]
        if (citationLinks.length > 0) {
          const citationString = citationLinks.join(", ");
          // console.log("startwith ---------", endIndex)
          text = text.slice(0, endIndex) + ' ' + citationString + text.slice(endIndex);
        }
    }

    return {textWithCitations: text, totalUrls, mentioned};
}

export function extractData(events: any) {
  // Collect search queries
  const searches = events
    .filter((e:any) => e.type === "web_search_call" && e.status === "completed")
    .map((e:any) => e.action?.query)
    .filter(Boolean); // remove undefined

  // Collect URLs from message annotations
  let totalUrls:any = [];
  const message = events.find((e:any) => e.type === "message" && e.status === "completed");
  if (message && message.content) {
    message.content.forEach((block:any) => {
      if (block.annotations) {
        block.annotations.forEach((a:any) => {
          if (a.type === "url_citation") {
            // urls.push({ title: a.title, url: a.url });
            totalUrls.push(a.url);
          }
        });
      }
    });
  }

  return { searches, totalUrls };
}

// Example usage
const citations = [
  "https://www.quora.com/What-is-an-all-vegetarian-multicuisine-restaurant-in-Noida"
];

// checkCitations(citations, brandPatterns).then(console.log);

import puppeteer from "puppeteer";

const URL = "https://www.quora.com/What-is-an-all-vegetarian-multicuisine-restaurant-in-Noida";
const SEARCH_TERM = "Sagar Ratna";

async function checkForSagarRatna() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // 👈 Fix for your error
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36"
  );

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const bodyText = await page.evaluate(() => document.body.innerText);

  if (bodyText.includes(SEARCH_TERM)) {
    console.log(`✅ "${SEARCH_TERM}" was found on the page.`);
  } else {
    console.log(`❌ "${SEARCH_TERM}" was NOT found on the page.`);
  }

  await browser.close();
}

// checkForSagarRatna();


