import {Request, Response} from 'express'
import { GoogleGenAI, DynamicRetrievalConfigMode } from "@google/genai";
// import { GoogleGenAI } from '@google/generative-ai';
import {GEMINI_API_KEY} from '../config/env'
import {GEMINI_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations } from '../utils/crawler';
import Prompt from '../models/visibility'; 


export const visibility = async (req: Request, res: Response)=>{
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});
  const {model, contents, country}  = req.query as {model: string, contents: string, country: string}
  if(!GEMINI_MODELS.includes(model.toLowerCase())){
    return res.status(400).json({ 
      error: `Invalid model: ${model}` });
  }
  // Define the grounding tool for enabling google search
  const groundingTool = {
    "googleSearch": {},
  };

  // Configure generation settings
  const config = {
    tools: [groundingTool],
  };
  try{
    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    // console.log(response.text);
    const {textWithCitations, totalUrls, visibility} = await addCitations(response);
    const uniqueUrls = await uniqueUrlsFn(response)
    const promot = new Prompt({
       prompt: contents,
       model,
       country,
       answer: textWithCitations,
       totalCitations: totalUrls,
       uniqueCitations: uniqueUrls,
       position: 3, 
       NoOfMentions: 0,
       NoOfCitations: 0,
       relevance: 1,
       sourceWeight: 1,
       authority: 1, 
       visibilityScore: '',
       citationScore: '',
       brandCitationScore: ''
    }) 
    await promot.save()
    res.status(200).json(
      {
        status: "success",
        message: "gemini result successful",
        prompt: contents,
        answer: textWithCitations,
        totalUrls: totalUrls,
        uniqueUrls, 
        visibility 
      }
    );

  }catch(err){
     res.status(500).json({
        error: err
     })
  }
}

async function addCitations(response:any) {
    let text = response.text;
    let visibility = false
    let totalUrls: string[] = []
    const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
    const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
    console.log({supports, chunks})

    // Sort supports by end_index in descending order to avoid shifting issues when inserting.
    const sortedSupports = [...supports].sort(
        (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
    );
    visibility = brandMentioned(text, keywords)
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

    return {textWithCitations: text, totalUrls, visibility};
}
// type Callback = (x: number) => number;
// type Pair = [string, number];

const uniqueUrlsFn = async (response:any) => {
  const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
  const uniqueUrls = chunks.map((chunk:any) =>{
        return chunk.web.uri
        // return  {title: chunk.web.title, uri: chunk.web.uri}      
  })
  
  return await checkCitations(uniqueUrls, keywords) 
}
