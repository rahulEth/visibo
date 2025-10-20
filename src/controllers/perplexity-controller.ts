import {Request, Response} from 'express'
import OpenAI from 'openai';
import {PERPLEXITY_API_KEY} from '../config/env'
import {PERPLEXITY_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations } from '../utils/crawler';
import Prompt from '../models/prompt'; 

// const client = new OpenAI({
//     apiKey: PERPLEXITY_API_KEY,
//     baseURL: "https://api.perplexity.ai"
// });


export const visibility = async (req: Request, res: Response)=>{

  const {model, contents, country}  = req.query as {model: string, contents: string, country: string}
    if(!PERPLEXITY_MODELS.includes(model.toLowerCase())){
      return res.status(400).json({ 
        error: `Invalid model: ${model}` });
    }

    const url = 'https://api.perplexity.ai/chat/completions';
    const headers = {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, // Replace with your actual API key
        'Content-Type': 'application/json'
    };

    // Define the request payload
    const payload = {
        model: model,
        messages: [
            { role: "system", content: "Be precise and concise."},
            { role: 'user', content: contents }
        ],
        search_mode: 'web' // web or academic
    };
    try{
        // Make the API call
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const visibility = brandMentioned(data.choices[0].message.content, keywords)
        const uniqueUrls = await checkCitations(data.citations, keywords) 
        // console.log(data); // replace with 
        const result = {
            // data: data.search_results,
            totalUrls: data.citations,
            uniqueUrls,
            answer:  data.choices[0].message.content,
            visibility,
            prompt: contents,

            
        }

        // Print the AI's response
        // console.log(data.choices[0].message.content)  
        const promot = new Prompt({
            prompt: contents,
            model,
            country,
            answer: data.choices[0].message.content,
            totalCitations: data.citations,
            uniqueCitations: uniqueUrls,
            visibilityScore: '',
            citationScore: '',
            brandCitationScore: ''
        }) 
        await promot.save()

        res.status(200).json({
            status: "success",
            message: "perplexity result successful",
            data: result
        })

    }catch(err){
     res.status(500).json({
        error: err
     })
  }    
}

// export const visibility = async (req: Request, res: Response)=>{

//   const {model, contents}  = req.query as {model: string, contents: string}
//   if(!PERPLEXITY_MODELS.includes(model.toLowerCase())){
//     return res.status(400).json({ 
//       error: `Invalid model: ${model}` });
//     }
//     try{
//         const response = await client.chat.completions.create({
//             model: "sonar-pro",
//             messages: [
//                 { role: "user", content: "Latest climate research findings" }
//             ],
//             // search_domain_filter: ["nature.com", "science.org"],
//             // search_recency_filter: "month",
//             return_citations: true,
//             // return_images: false
//         });
//         console.log(response.choices[0].message.content);
//         console.log(response.model);                      // Model name
//         console.log(response.usage);                      // Token usage
//         console.log(response.citations);                  // Perplexity citations
//         console.log(response.search_results);    

//     }catch(err){
//      res.status(500).json({
//         error: err
//      })
//   }    
// }