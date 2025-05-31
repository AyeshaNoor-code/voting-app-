const express = require('express');
const router = express.Router();
const User = require('./user');
const Candidate = require('./candidate');
const { jwtAuthMiddleware } = require('../jwt');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(`User ID: ${userId}, User Role: ${user ? user.role : 'User not found'}`);
        return user && user.role === 'admin';
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false;
    }
};

// POST to save data of new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    console.log('Request User:', req.user); // Log req.user to see the content
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Not Allowed' });
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('Data Saved:', response);
        res.status(201).json({ message: 'Candidate created successfully', response });
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// PUT route to update a candidate
router.put('/:CandidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Not Allowed' });
        }

        const CandidateID = req.params.CandidateID; // Extract id from URL parameter
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(CandidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true // Run Mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate Data updated');
        res.status(200).json({ message: 'Candidate updated successfully', response });
    } catch (err) {
        console.error('Error updating candidate data:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// DELETE route to delete a candidate
router.delete('/:CandidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'Not Allowed' });
        }

        const CandidateID = req.params.CandidateID; // Extract id from URL parameter

        const response = await Candidate.findByIdAndDelete(CandidateID);
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate Data Deleted');
        res.status(200).json({ message: 'Candidate deleted successfully', response });
    } catch (err) {
        console.error('Error deleting candidate data:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// POST route to cast a vote
router.post('/vote/:CandidateID', jwtAuthMiddleware, async (req, res) => {
    // no admin can vote
    // user can only vote once

    const CandidateID = req.params.CandidateID;
    const userId = req.user.id;

    try {
        // Find candidate document with the help of CandidateID
        const candidate = await Candidate.findById(CandidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed' });
        }

        candidate.votes.push({ user: userId });
        candidate.voteCount++;

        // Save the updated candidate document
        await candidate.save();

        // Update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error('Error recording vote:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// GET route to get vote count
router.get('/vote/count', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their party and voteCount
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.error('Error getting vote count:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/candidates', async (req, res) => {
    try {
        // Fetch only the names of the candidates
        const response = await Candidate.find({}, 'name'); // This will only return the name field
        console.log(response);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error getting candidates:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
