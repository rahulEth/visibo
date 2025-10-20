import mongoose, { model, Mongoose } from 'mongoose';

const promptSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    model: {type: String, required: true},
    version: {type: String, default:null},
    country: {type: String, required: false},
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    latestMetrics: {
        answer: { type: mongoose.Schema.Types.String},
        mentioned: {type: mongoose.Schema.Types.Boolean, default:false},
        visibilityScore: {type: mongoose.Schema.Types.Decimal128, default:0}, // visibility frequency
        visibilityRank: {type: mongoose.Schema.Types.Decimal128, default:0}, // rank in AI generated result
        brandCitationScore: {type: mongoose.Schema.Types.Decimal128, default:0},
        citationRank: {type: mongoose.Schema.Types.Decimal128, default:0},
        citationScore: {type: mongoose.Schema.Types.Decimal128, default:0}, // citation frequency
        competitorBrands: {type: Object, default: {}, require: false},
        updatedAt: { type: Date, default: Date.now }
    }

}, { timestamps: true })

//EntitySchema.index({ text: 1 });
//EntitySchema.index({ text: 'text' }); // optional full-text search if you want fuzzy search

const Prompt = mongoose.model("Prompt", promptSchema)

export = Prompt