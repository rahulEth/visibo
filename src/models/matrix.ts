import mongoose from "mongoose";

const matrixSchema = new mongoose.Schema({
    promptID: '', // map to relevemt promt

    visibilityScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    citationScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    avgRank:{
        type: mongoose.Schema.Types.Number,
        required: false, 
    },
    brandCitationScore: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    citationRank: {
        type: mongoose.Schema.Types.Number, // where exectly your website rank amoung all citations
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})