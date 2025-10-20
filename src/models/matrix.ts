import mongoose from "mongoose";

const matrixSchema = new mongoose.Schema({
    answer: {type: String, required: false},
    mentioned: {type: Boolean, require:true, default: false}, // weather brand was mentioned for particular prompt by particular LLM on given date
    totalCitations: {type: Array, default:[]},
    uniqueCitations: {type: Array, default: []},
    visibilityScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: false
    },

    visibilityRank:{
        type: mongoose.Schema.Types.Number,  // where your website rank in AI answers
        required: false, 
    },
    brandCitationScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: false
    },
    citationScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: false
    },
    citationRank: {
        type: mongoose.Schema.Types.Number, // where exectly your website rank amoung all citations
        required: false
    },
    competitorBrands:{
        type: Object,
        required: false
    },
    prompt: {
        type: mongoose.Schema.Types.ObjectId,  // Primary–Foreign Key Mapping
        ref: 'Prompt'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Speeds up time-based queries
    },

}, { timestamps: true })

// Composite Index: For quick lookup by entity + date range
matrixSchema.index({ prompt: 1, date: -1 });

// Optional TTL Index: auto-delete records after 1 year (365 days)
// matrixSchema.index(
//   { createdAt: 1 },
//   { expireAfterSeconds: 365 * 24 * 60 * 60 }
// );
const Matrix = mongoose.model('Matrix', matrixSchema)
export = Matrix