import {Request, Response} from 'express'
import { GoogleGenAI, DynamicRetrievalConfigMode } from "@google/genai";
import mongoose from 'mongoose';
// import { GoogleGenAI } from '@google/generative-ai';
import {GEMINI_API_KEY} from '../config/env'
import {GEMINI_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import { checkCitations, uniqueUrlsFn, addCitations } from '../utils/crawler';
import Prompt from '../models/prompt'; 
import Matrix from '../models/matrix';
import {visibilityMatrix, citationScoreCalculate} from '../utils/rankCalculate'

interface CitationResult{
  status: string,
  value : {
    mentioned: boolean,
    url: string
  }
}
export const visibility = async (req: Request, res: Response)=>{
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});
  const {model, contents, country, version}  = req.query as {model: string, contents: string, country: string, version: string}
  if(!GEMINI_MODELS.includes(version.toLowerCase())){
    return res.status(400).json({ 
      error: `Invalid model version: ${version}` });
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
      model: version,
      contents,
      config
    });

    // console.log(response.text);
    const {textWithCitations, totalUrls, mentioned} = await addCitations(response);
    const uniqueUrls = await uniqueUrlsFn(response)
    const citationScore = citationScoreCalculate(uniqueUrls)
    const vResult = visibilityMatrix(textWithCitations,keywords) 
    let prompt = await Prompt.findOne({prompt: contents})
    if(prompt){
      return res.status(409).json({
        success: false,
        status: 409,
        message: `Entered prompt already exist`,
      });
    }
    prompt = new Prompt({
       prompt: contents,
       model,
       version,
       country,
      //  answer: textWithCitations,
      //  totalCitations: totalUrls,
      //  uniqueCitations: uniqueUrls,
      //  position: 3, 
      //  NoOfMentions: 0,
      //  NoOfCitations: 0,
      //  relevance: 1,
      //  sourceWeight: 1,
      //  authority: 1, 
      //  visibilityScore: '',
      //  citationScore: '',
      //  brandCitationScore: ''
    }) 
    // prompt = await prompt.save()
    const formatDecimal = (val:any) =>  mongoose.Types.Decimal128.fromString(val.toString())  
      // Insert new historical record
    const newMatrics = {
      answer: textWithCitations,
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
      totalCitations: totalUrls,
      uniqueCitations: uniqueUrls

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
        answer: textWithCitations,
        totalUrls: totalUrls,
        uniqueUrls, 
        mentioned,
        visibilityScore: vResult.visibilityScore,
        visibilityRank : vResult.targetRank,
        citationScore,
        citationRank: 0

      }
    );

  }catch(err){
     console.log('gemini-controller: ', err)
     res.status(500).json({
        error: err
     })
  }
}


// type Callback = (x: number) => number;
// type Pair = [string, number];

// const uniqueUrlsFn = async (response:any) => {
//   const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
//   const uniqueUrls = chunks.map((chunk:any) =>{
//         return chunk.web.uri
//         // return  {title: chunk.web.title, uri: chunk.web.uri}      
//   })
  
//   return await checkCitations(uniqueUrls, keywords) 
// }

// Average score over last 30 days
// MetricsHistory.aggregate([
//   { $match: { date: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
//   {
//     $group: {
//       _id: "$entityId",
//       avgCitation: { $avg: "$citationScore" },
//       avgVisibility: { $avg: "$visibilityScore" },
//       avgRank: { $avg: "$rank" }
//     }
//   }
// ]);
