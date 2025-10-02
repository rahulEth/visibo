import {Request, Response} from 'express'
import OpenAI from "openai";
import {OPENAI_API_KEY} from '../config/env'
import {OEPNAI_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations } from '../utils/crawler';

export const visibility = async (req: Request, res: Response)=>{
    const client = new OpenAI({
       apiKey: OPENAI_API_KEY
    });
  const {model, contents, country, city}  = req.query as {model: string, contents: string, country:string, city:string}
  if(!OEPNAI_MODELS.includes(model.toLowerCase())){
    return res.status(400).json({ 
      error: `Invalid model: ${model}` });
  }
  try{
    const response:any = await client.responses.create({
        model: model,
        tool_choice: "auto", // none, auto: models decide itself , required 
        tools: [{
            type: "web_search_preview", // enable web search
            user_location: {
              type: "approximate",
              country: country,
             city:  city,
             region: city,
            },
            search_context_size: "medium",  // low , medium , high default is medium - how much web context to use 
        }],
        input: [
        {
          role: "user",
          content: contents,
        },
      ],
    });
  
    //console.log("---------------1---------------------")
    // console.log("output 0======== ", response.output[0]) // contain query asked
    //console.log("---------------2---------------------")

    // console.log("----------------", response) // output text
    //console.log("---------------3---------------------")

    // console.log("respo------ ", response.output[1].content[0]) //url,location and location of the ploace
    const { searches, urls } = extractData(response.output)
    const visibility = brandMentioned(response.output_text, keywords)
    console.log('urls------ ', urls)
    const uniqueUrls = await checkCitations(urls, keywords) 
    
    res.status(200).json(
      {
        status: "success",
        message: "openai result successful",
        data: response.output_text,
        totalUrls: urls,
        uniqueUrls,
        visibility,
        prompt : contents
      }
    );
  }catch(err){
     res.status(500).json({
        error: 'Internal server error',
        msg: err
     })
  }
}

function extractData(events: any) {
  // Collect search queries
  const searches = events
    .filter((e:any) => e.type === "web_search_call" && e.status === "completed")
    .map((e:any) => e.action?.query)
    .filter(Boolean); // remove undefined

  // Collect URLs from message annotations
  let urls:any = [];
  const message = events.find((e:any) => e.type === "message" && e.status === "completed");
  if (message && message.content) {
    message.content.forEach((block:any) => {
      if (block.annotations) {
        block.annotations.forEach((a:any) => {
          if (a.type === "url_citation") {
            // urls.push({ title: a.title, url: a.url });
            urls.push(a.url);
          }
        });
      }
    });
  }

  return { searches, urls };
}