import express from  'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config({path: `.env.${NODE_ENV}`})

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())


import visibilityRoute from './routes/gemini-route';
import openaiRoute from './routes/openai-route';
import perplexityRoute from './routes/perplexity-route'
import grokRoute from './routes/grok-route'
import connectDB from './db'

connectDB()

app.use('/api/gemini', visibilityRoute);
app.use('/api/openai', openaiRoute);
app.use('/api/perplexity', perplexityRoute)
app.use('/api/grok', grokRoute)



import mongoose from 'mongoose';
import cron from 'node-cron';
import OpenAI from "openai";
import Prompt = require('./models/prompt');
import Matrix = require('./models/matrix');
import { GoogleGenAI } from "@google/genai";
import {GEMINI_API_KEY, OPENAI_API_KEY} from './config/env';
import { uniqueUrlsFn, addCitations, extractData, checkCitations} from './utils/crawler';
import {visibilityMatrix, citationScoreCalculate, visibilityMatrixChatGPT, visibilityMatrixPerplexity} from './utils/rankCalculate'
import { keywords } from './config/brand';
import { brandMentioned } from './utils/brandVisibility';
import {PERPLEXITY_API_KEY} from './config/env'


async function updateGemini() {
  try {
    const promots = await Prompt.find({model: 'gemini'});
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});
    if(promots.length){
        for (let prompt of promots) {
            
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
                    model: prompt.version,
                    contents: prompt.prompt,
                    config
                });
            
                // console.log(response.text);
                const {textWithCitations, totalUrls, mentioned} = await addCitations(response);
                const uniqueUrls = await uniqueUrlsFn(response)
                const citationScore = citationScoreCalculate(uniqueUrls)
                const vResult = visibilityMatrix(textWithCitations,keywords)
                
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
            } catch(err){
                     
            }    
        }
    }

  } catch (error) {
    console.error('⚠️ Error in cron job:', error);
  }
}

async function updateChatGPT() {
  try {
    const client = new OpenAI({
       apiKey: OPENAI_API_KEY
    });
    const promots = await Prompt.find({model: 'chatGPT'});
    if(promots.length){
        for(const prompt of promots){
            const response:any = await client.responses.create({
                model: prompt.version,
                tool_choice: "auto", // none, auto: models decide itself , required 
                tools: [{
                    type: "web_search_preview", // enable web search
                    user_location: {
                      type: "approximate",
                      country: prompt.country,
                    },
                    search_context_size: "medium",  // low , medium , high default is medium - how much web context to use 
                }],
                input: [
                {
                  role: "user",
                  content: prompt.prompt,
                },
              ],
            });
          
            // what all promnts it considering while answering
            const { searches, totalUrls } = extractData(response.output)
        
            const mentioned = brandMentioned(response.output_text, keywords)
            const uniqueUrls = await checkCitations(totalUrls, keywords) 
            const citationScore = citationScoreCalculate(uniqueUrls)
            const vResult = visibilityMatrixChatGPT(response.output_text,keywords) 
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
        }
    }

  } catch (error) {
    console.error('⚠️ Error in cron job:', error);
  }
}

async function updatePerplexity() {
  try {
    const client = new OpenAI({
       apiKey: OPENAI_API_KEY
    });
    const promots = await Prompt.find({model: 'perplexity'});
    if(promots.length){
      for(const prompt of promots){
        const url = 'https://api.perplexity.ai/chat/completions';
        const headers = {
           'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, // Replace with your actual API key
           'Content-Type': 'application/json'
        };
   
       // Define the request payload
       const payload = {
           model: prompt.version,
           messages: [
               { role: "system", content: "Be precise and concise."},
               { role: 'user', content: prompt.prompt }
           ],
           search_mode: 'web' // web or academic
       };
       
       // Make the API call
           const response = await fetch(url, {
               method: 'POST',
               headers,
               body: JSON.stringify(payload)
           });
   
           const data = await response.json();
          
        const mentioned = brandMentioned(data.choices[0].message.content, keywords)
        const uniqueUrls = await checkCitations(data.citations, keywords) 
        const citationScore = citationScoreCalculate(uniqueUrls)
        const vResult = visibilityMatrixPerplexity(data.choices[0].message.content,keywords) 
            // prompt = await prompt.save()
            const formatDecimal = (val:any) =>  mongoose.Types.Decimal128.fromString(val.toString())  
              // Insert new historical record
            const newMatrics = {
              answer: visibilityMatrixPerplexity, //textWithCitations,
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
      }
    }

  } catch (error) {
    console.error('⚠️ Error in cron job:', error);
  }
}


// 6️⃣ Schedule cron job to run every 5 minutes
// cron.schedule('*/1 * * * *', async () => {
//   console.log('⏰ Running cron job -', new Date().toLocaleString());
//   await updateGemini();
// });
cron.schedule('0 0 * * *', async ()=>{
      console.log('⏰ Running cron job -', new Date().toLocaleString());
  await updateGemini();
})

cron.schedule('0 0 * * *', async ()=>{
      console.log('⏰ Running cron job -', new Date().toLocaleString());
  await updateChatGPT();
})

cron.schedule('0 0 * * *', async ()=>{
      console.log('⏰ Running cron job -', new Date().toLocaleString());
  await updatePerplexity();
})


app.listen(PORT, ()=>{
    console.log(`server running on PORT ${5000}`)
})

