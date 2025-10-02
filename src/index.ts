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



app.listen(PORT, ()=>{
    console.log(`server running on PORT ${5000}`)
})

