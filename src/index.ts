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
import Prompt = require('./models/prompt');
import Matrix = require('./models/matrix');
import { GoogleGenAI } from "@google/genai";
import {GEMINI_API_KEY} from './config/env';
import { uniqueUrlsFn, addCitations} from './utils/crawler';
import {visibilityMatrix, citationScoreCalculate} from './utils/rankCalculate'
import { keywords } from './config/brand';


async function updateUserScores() {
  try {
    const promots = await Prompt.find({});
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY});
    if(promots.length){
        for (const prompt of promots) {
            
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
                promot: prompt._id,
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

// 6️⃣ Schedule cron job to run every 5 minutes
// cron.schedule('*/1 * * * *', async () => {
//   console.log('⏰ Running cron job -', new Date().toLocaleString());
//   await updateUserScores();
// });
cron.schedule('0 0 * * *', async ()=>{
      console.log('⏰ Running cron job -', new Date().toLocaleString());
  await updateUserScores();
})



app.listen(PORT, ()=>{
    console.log(`server running on PORT ${5000}`)
})

