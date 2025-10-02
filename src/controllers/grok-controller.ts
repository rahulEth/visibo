import {Request, Response} from 'express'
import OpenAI from 'openai';
import {GROK_API_KEY, OPENROUTER_API_KEY} from '../config/env'
import {GROK_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations } from '../utils/crawler';

// const client = new OpenAI({
//     apiKey: PERPLEXITY_API_KEY,
//     baseURL: "https://api.perplexity.ai"
// });


export const visibility = async (req: Request, res: Response)=>{

  const {model, contents, country}  = req.query as {model: string, contents: string, country:string}
    if(!GROK_MODELS.includes(model.toLowerCase())){
      return res.status(400).json({ 
        error: `Invalid model: ${model}` });
    }

    const url = 'https://api.x.ai/v1/chat/completions';
    const headers = {
        'Authorization': `Bearer ${GROK_API_KEY}`, // Replace with your actual API key
        'Content-Type': 'application/json'
    };

    // const url = 'https://openrouter.ai/api/v1/chat/completions';
    // const headers = {
    //     'Authorization': `Bearer ${OPENROUTER_API_KEY}`, // Replace with your actual API key
    //     'Content-Type': 'application/json'
    // };

    // Define the request payload
    const payload = {
        model: model,
        messages: [
            // { role: "system", content: "Be precise and concise."},
            { role: 'user', content: contents }
        ],
        "search_parameters": {
            "mode": "on",    // for live search ex- off, auto, on, default is auto
            "return_citations": true,  // default value is also true
            "max_search_results": 10  // max data source to consider while query default 20
        },  
        "sources": [   // default is web and x
            {"type": "web", "country": country},  // country supported by web and news
            // {"type": "x"},
            // {"type": "news"},  // searching from news source
            // {"type": "rss"}    // retrieving data from the RSS feed
        ]
    };
    try{
        // Make the API call
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if(data?.code){
            return res.status(403).json({
                error: data.error,
                code: data.code
            })
        }
        // console.log("response----- ", data)
        const visibility = brandMentioned(data.choices[0].message.content, keywords)
        const uniqueUrls = await checkCitations(data.citations, keywords) 
        const result = {
            status: "success",
            message: `${model} result successful`,
            data: data.choices[0].message.content,
            totalUrls: data.citations,
            uniqueUrls,
            visibility,
            prompt : contents
        }

        // Print the AI's response
        // console.log(data.choices[0].message.content)  


        res.status(200).json({
            data: result
        })

    }catch(err){
     res.status(500).json({
        error: err
     })
  }    
}