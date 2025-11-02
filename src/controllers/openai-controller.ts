import {Request, Response} from 'express'
import OpenAI from "openai";
import {OPENAI_API_KEY} from '../config/env'
import {OEPNAI_MODELS} from '../config/models'
import { brandMentioned } from '../utils/brandVisibility';
import { keywords } from '../config/brand';
import mongoose from 'mongoose';
import { checkCitations, uniqueUrlsFn, addCitations, extractData} from '../utils/crawler';
import {visibilityMatrixChatGPT, citationScoreCalculate} from '../utils/rankCalculate'
import Prompt from '../models/prompt'; 
import Matrix from '../models/matrix';

export const visibility = async (req: Request, res: Response)=>{
    const client = new OpenAI({
       apiKey: OPENAI_API_KEY
    });
  const {model, contents, country, version}  = req.query as {model: string, contents: string, country:string, version:string}
  if(!OEPNAI_MODELS.includes(version.toLowerCase())){
    return res.status(400).json({ 
      error: `Invalid model: ${version}` });
  }
  try{
    const response:any = await client.responses.create({
        model: version,
        tool_choice: "auto", // none, auto: models decide itself , required 
        tools: [{
            type: "web_search_preview", // enable web search
            user_location: {
              type: "approximate",
              country: country,
            //  city:  city,
            //  region: city,
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

    let prompt = await Prompt.findOne({prompt: contents, model: model})
    if(prompt){
      return res.status(409).json({
        success: false,
        status: 409,
        message: `Entered prompt already exist`,
      });
    }
    // what all promnts it considering while answering
    const { searches, totalUrls } = extractData(response.output)

    const mentioned = brandMentioned(response.output_text, keywords)
    console.log("response.output_text....... ", response.output_text)
    console.log('urls------ ', totalUrls,searches, mentioned)
    const uniqueUrls = await checkCitations(totalUrls, keywords) 
    const citationScore = citationScoreCalculate(uniqueUrls)
    const vResult = visibilityMatrixChatGPT(response.output_text,keywords) 

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
      answer: response.output_text, //textWithCitations,
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
      uniqueCitations: uniqueUrls,
      quries: searches

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
        answer: response.output_text,                //textWithCitations,
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
     res.status(500).json({
        error: 'Internal server error',
        msg: err
     })
  }
}

