# About

Monitor and improve your company visibility in AI/LLMs. Search is Shifting from Search Engines to AI. People are now asking LLMs over google about personal recommendation, suggestions. The monthly active users of AI / LLMs has grown to over 1 billion by June 2025. This tool help business/brands to improve and monitor their visibility accross all major LLMs like ChatGPT, Grok, Perplexity, Gemini, Claude and many more.
 


## Getting Started on local 

To run daap locally, you will need

- Node.js (v18 or above)
- typescript (v5.8.3)

# back-end

1. clone this repo

```
git clone https://github.com/rahulEth/promptmonitor.git
```

3. copy .env.example to .env 

4. running in dev mode

```
npm run dev
```

5. running in production 

```
npm run build
npm run start
```


## testing APIs

1. gemini
a. GET: 
http://localhost:5000/api/gemini/visibility?model=gemini-2.5-flash&contents=list top 5 veg restorent in Noida

RESULT: 

```
{
    "status": "success",
    "message": "gemini result successful",
    "data": "Noida has a good selection of vegetarian restaurants! \"Top\" can be subjective, depending on cuisine preference, ambiance, and budget, but here are 5 highly-regarded and popular pure-vegetarian restaurants:\n\n1.  **Haldiram's:** (Multiple locations across Noida)\n    *   **Known for:** A wide variety of Indian sweets, snacks (chaat, samosa), North Indian thalis, South Indian dishes, and fast food. It's a reliable option for a quick, diverse, and affordable pure-veg meal.\n    *   **Why it's popular:** Consistency, affordability, and extensive menu.\n\n2.  **Sagar Ratna:** (Multiple locations in Noida, e.g., Sector 18, GIP Mall)\n    *   **Known for:** Authentic South Indian cuisine, especially their dosas, idlis, vadas, and thalis.\n    *   **Why it's popular:** Long-standing reputation for quality and taste in South Indian pure-veg food.\n\n3.  **Carnatic Cafe:** (Often found in Sector 18/Mall of India area)\n    *   **Known for:** A more refined and authentic take on South Indian breakfast and meals. Their filter coffee, dosas, and specific items like 'Malleshwaram Dose' are highly praised.\n    *   **Why it's popular:** Focus on quality ingredients, authentic flavors, and a pleasant ambiance, making it a favorite for a leisurely meal.\n\n4.  **Naivedyam:** (Multiple locations in Noida, e.g., Sector 18, Wave Mall)\n    *   **Known for:** Another excellent choice for South Indian pure-veg dishes, offering a variety of dosas, uttapams, idlis, and full meals.\n    *   **Why it's popular:** Consistent taste, good service, and a comfortable family dining experience.\n\n5.  **Om Bikanervala:** (Multiple locations across Noida)\n    *   **Known for:** Very similar to Haldiram's in its offerings – a mix of North Indian snacks, sweets, thalis, chaat, and South Indian dishes.\n    *   **Why it's popular:** A strong competitor to Haldiram's, offering a similar wide range of popular pure-vegetarian Indian dishes and sweets in a casual setting.\n\n**Tips:**\n*   **Check Locations:** Most of these have multiple branches, so choose the one closest to you.\n*   **Cuisine Preference:** If you love South Indian, Carnatic Cafe, Sagar Ratna, and Naivedyam are top picks. For a broader Indian snack/meal experience, Haldiram's or Om Bikanervala are great.\n*   **Reviews:** Always check recent reviews and specific branch details online for the most up-to-date information."
}
```

1. chatGPT
a. GET: 
http://localhost:5000/api/openai/visibility?model=chatGPT&contents=list top 10 veg restorent in noida&country =IN&version=gpt-5

RESULT: 

```
{
    "status": "success",
    "message": "gemini result successful",
    "prompt": "list top 10 veg restorent in noida",
    "answer": "Here are 10 popular pure‑veg restaurants in Noida you can try:\n\n- Burma Burma, DLF Mall of India (Sector 18) – Burmese vegetarian menu, lots of vegan options. ([zomato.com](https://www.zomato.com/ncr/burma-burma-noida-sector-18-noida?utm_source=openai))\n- Naivedyam, Sector 63 – classic South Indian thalis and dosas; family‑friendly. ([zomato.com](https://www.zomato.com/ncr/naivedyam-sector-63-noida?utm_source=openai))\n- Sagar Ratna, Sector 18 (also at Starling Mall, Sec 104/110) – dependable South Indian chain, Jain options. ([zomato.com](https://www.zomato.com/ncr/sagar-ratna-sector-18-noida?utm_source=openai))\n- Shree Rathnam, DLF Mall of India (Sector 18) – pure‑veg South/North Indian. ([zomato.com](https://www.zomato.com/ncr/shree-rathnam-sector-18-noida?utm_source=openai))\n- Bikanervala, Silver Tower (Sector 18) – veg multi‑cuisine, chaat and sweets. ([zomato.com](https://www.zomato.com/ncr/bikanervala-sector-18-noida?utm_source=openai))\n- Haldiram’s, Sector 18 (and MOI) – large veg menu; quick service. ([zomato.com](https://www.zomato.com/ncr/haldirams-3-sector-18-noida?utm_source=openai))\n- Lakshmi Coffee House, Brahmaputra Market (Sector 29) – old‑favorite Udupi spot; filter coffee. ([zomato.com](https://www.zomato.com/ncr/lakshmi-coffee-house-sector-29-noida?utm_source=openai))\n- Imly, DLF Mall of India (Sector 18) – vegetarian street‑food style menu. ([zomato.com](https://www.zomato.com/ncr/imly-sector-18-noida?utm_source=openai))\n- Govinda’s (ISKCON Noida, Sector 33) – sattvik, no onion/garlic; peaceful ambience. ([zomato.com](https://www.zomato.com/tr/ncr/govindas-restaurant-sector-33-noida/order?utm_source=openai))\n- Udupi Krishna Restaurant (Sector 101/137) – pure‑veg South Indian near the metro. ([ukr.co.in](https://www.ukr.co.in/?utm_source=openai))\n\nIf you tell me your area, budget, or cuisine (South Indian, chaat, thali, etc.), I can narrow this to the best 3–5 for you.",
    "totalUrls": [
        "https://www.zomato.com/ncr/burma-burma-noida-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/ncr/naivedyam-sector-63-noida?utm_source=openai",
        "https://www.zomato.com/ncr/sagar-ratna-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/ncr/shree-rathnam-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/ncr/bikanervala-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/ncr/haldirams-3-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/ncr/lakshmi-coffee-house-sector-29-noida?utm_source=openai",
        "https://www.zomato.com/ncr/imly-sector-18-noida?utm_source=openai",
        "https://www.zomato.com/tr/ncr/govindas-restaurant-sector-33-noida/order?utm_source=openai",
        "https://www.ukr.co.in/?utm_source=openai"
    ],
    "uniqueUrls": [
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/burma-burma-noida-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/naivedyam-sector-63-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/sagar-ratna-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": true,
                "url": "https://www.zomato.com/ncr/shree-rathnam-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/bikanervala-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/haldirams-3-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/lakshmi-coffee-house-sector-29-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/ncr/imly-sector-18-noida?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.zomato.com/tr/ncr/govindas-restaurant-sector-33-noida/order?utm_source=openai"
            }
        },
        {
            "status": "fulfilled",
            "value": {
                "mentioned": false,
                "url": "https://www.ukr.co.in/?utm_source=openai"
            }
        }
    ],
    "mentioned": true,
    "visibilityScore": "33.33",
    "visibilityRank": 3,
    "citationScore": "10.00",
    "citationRank": 0
}
```
## steps for builiding from scratch 

```
npm init -y
npm install express cors dotenv

npm install -D typescript ts-node-dev @types/express @types/node @types/cors

npx tsc --init
```