import mongoose, { model } from 'mongoose';

const promptSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    model: {type: String, required: true},
    country: {type: String, required: true},
    answer: {type: String, required: true},
    mentioned: {type: Boolean, require:true, default: false}, // weather brand was mentioned for particular prompt by particular LLM on given date
    avrRank: {type: String},
    totalCitations: {type: Array, default:[]},
    uniqueCitations: {type: Array, default: []},
    visibilityScore: {type: String}, // visibility frequency
    citationScore: {type: String}, // citation frequency
    brandCitationScore: {type: String},
    createdAt:{
        type: Date,
        default: Date.now
    }

})

const Prompt = mongoose.model("Prompt", promptSchema)

export = Prompt