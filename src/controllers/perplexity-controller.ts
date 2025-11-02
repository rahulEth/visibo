import {Request, Response} from 'express'
import OpenAI from 'openai';
import {PERPLEXITY_API_KEY} from '../config/env'
import {PERPLEXITY_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations } from '../utils/crawler';
import Prompt from '../models/prompt'; 
import {visibilityMatrixPerplexity, citationScoreCalculate} from '../utils/rankCalculate';
import Matrix from '../models/matrix';
import mongoose from 'mongoose';

// const client = new OpenAI({
//     apiKey: PERPLEXITY_API_KEY,
//     baseURL: "https://api.perplexity.ai"
// });


export const visibility = async (req: Request, res: Response)=>{

    const {model, contents, country, version}  = req.query as {model: string, contents: string, country: string, version: string}
    if(!PERPLEXITY_MODELS.includes(version.toLowerCase())){
      return res.status(400).json({ 
        error: `Invalid model: ${version}` });
    }
   
    const url = 'https://api.perplexity.ai/chat/completions';
    const headers = {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, // Replace with your actual API key
        'Content-Type': 'application/json'
    };

    // Define the request payload
    const payload = {
        model: version,
        messages: [
            { role: "system", content: "Be precise and concise."},
            { role: 'user', content: contents }
        ],
        search_mode: 'web' // web or academic
    };
    let prompt = await Prompt.findOne({prompt: contents, model: model})
    if(prompt){
      return res.status(409).json({
        success: false,
        status: 409,
        message: `Entered prompt already exist`,
      });
    }        
    // Make the API call
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("data------------- ", data)
        console.log("choice------------ ", data.choices[0])
        console.log("data.choices[0].message.content---- ", data.choices[0].message.content)
        const mentioned = brandMentioned(data.choices[0].message.content, keywords)
        const uniqueUrls = await checkCitations(data.citations, keywords) 
        const citationScore = citationScoreCalculate(uniqueUrls)
        const vResult = visibilityMatrixPerplexity(data.choices[0].message.content,keywords) 

        prompt = new Prompt({
            prompt: contents,
            model,
            version,
            country
        }) 
        // prompt = await prompt.save()
        const formatDecimal = (val:any) =>  mongoose.Types.Decimal128.fromString(val.toString())  
            // Insert new historical record
        const newMatrics = {
            answer: data.choices[0].message.content, //textWithCitations,
            mentioned: mentioned, // weather brand was mentioned for particular prompt by particular LLM on given date
            
            visibilityScore: formatDecimal(vResult.visibilityScore),
            competitorBrands: vResult.allBrands,
            visibilityRank: formatDecimal(vResult.targetRank),
            brandCitationScore: formatDecimal(0),
            citationRank: formatDecimal(0), // where execlty your brand website rank amoung amoung all citation
            citationScore: formatDecimal(citationScore),
        }
        await Matrix.create({
            prompt: prompt._id,
            date: new Date(),
            ...newMatrics,
            totalCitations: data.citations,
            uniqueCitations: uniqueUrls,
            quries: []

        });

        prompt.latestMetrics = {
            ...newMatrics,
            updatedAt: new Date()
        }
        await prompt.save()

        res.status(200).json(
            {
                status: "success",
                message: "gemini result successful",
                prompt: contents,
                answer: data.choices[0].message.content,                //textWithCitations,
                totalUrls: data.citations,
                uniqueUrls, 
                mentioned,
                visibilityScore: vResult.visibilityScore,
                visibilityRank : vResult.targetRank,
                citationScore,
                citationRank: 0

            }
        );
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