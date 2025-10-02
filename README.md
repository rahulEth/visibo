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

## steps for builiding from scratch 

```
npm init -y
npm install express cors dotenv

npm install -D typescript ts-node-dev @types/express @types/node @types/cors

npx tsc --init
```