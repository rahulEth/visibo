import * as cheerio from "cheerio";
import { response } from "express";

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
