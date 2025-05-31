const mongoose = require('mongoose');

// Define the vote schema
const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    votedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Define the candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [voteSchema],  // Use voteSchema as an array of subdocuments
    voteCount: {
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
