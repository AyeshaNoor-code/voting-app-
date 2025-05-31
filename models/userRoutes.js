const express = require('express');
const router = express.Router();
const User = require('./user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');


// Signup route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Get user data from request body

        // Check if the user already exists with the same CNIC or email
        const existingUser = await User.findOne({
            $or: [{ cnic: data.cnic }, { email: data.email }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'CNIC or Email already exists' });
        }

        // Create a new user
        const newUser = new User(data);
        const response = await newUser.save(); // Save the new user to the database
        console.log('Data Saved:', response); // Log the saved user response

        // Create a payload for the token with the user's ID
        const payload = { id: response._id }; // Use the saved user's ID
        const token = generateToken(payload); // Generate a token using the payload
        console.log('Generated Token:', token);

        // Respond with the saved user data and the token
        res.status(200).json({ response, token });
    } catch (err) {
        console.error('Error saving data:', err); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { cnic, password } = req.body; // Get CNIC and password from request body
        // Find the user by CNIC
        const user = await User.findOne({ cnic }); // Ensure 'cnic' is consistent

        // Check if user exists and if the password matches
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        console.log('User found:', user); // Log the found user

        // Create a payload for the token with the user's ID
        const payload = { id: user.id };
        const token = generateToken(payload); // Generate a token using the payload
        console.log('Generated Token:', token);

        // Respond with the generated token
        res.json({ token });
    } catch (err) {
        console.log(err); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user; // Get user data from the token
        const userId = userData.id; // Get user ID from token
        const user = await User.findById(userId); // Find user by user ID

        // Check if user was found
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User found:', user); // Log the found user
        // Respond with the user data
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error retrieving user data:', err); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update password route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from token
        const { currentPassword, newPassword } = req.body; // Get current and new passwords from request body

        const user = await User.findById(userId); // Find user by user ID

        // Check if the current password is correct
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Update user password
        user.password = newPassword; // Set the new password
        await user.save(); // Save the updated user record to the database

        console.log('Password updated'); // Log the password update
        // Respond with a success message
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router; // Export the router for use in other parts of the application
