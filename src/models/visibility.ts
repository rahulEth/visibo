import mongoose, { model } from 'mongoose';

const promptSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    model: {type: String, required: true},
    country: {type: String, required: true},
    answer: {type: String, required: true},
    avrRank: {type: String},
    totalCitations: {type: Array},
    uniqueCitations: {Array},
    visibilityScore: {type: String}, // visibility frequency
    citationScore: {type: String}, // citation frequency
    brandCitationScore: {type: String},
    highAuthSource: {type: Array},
    mediumAuthSource: {type: Array}, 
    lowAuthSource: {type: Array}
})

const Prompt = mongoose.model("Prompt", promptSchema)

export = Prompt