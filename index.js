const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');

app.use(express.json()); 

mongoose.connect('mongodb://localhost:27017/WebTechProj', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define the player schema
const userSchema = new mongoose.Schema({
    Name: String,
    National_Position: String,
    Rating: Number,
    Speed: Number,
    Shot_Power: Number,
    Short_Pass: Number,
    Dribbling: Number,
    Standing_Tackle: Number,
    Strength: Number
});

const UserModel = mongoose.model("users", userSchema);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/football', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'football.html'));
});

app.get('/comparison', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'comparison.html'));
});

app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aboutus.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/getPlayer', (req, res) => {
    const playerName = req.query.name; 
    UserModel.findOne({ Name: playerName }, 'National_Position Rating Speed Shot_Power Short_Pass Dribbling Standing_Tackle Strength')
        .then(function(player) {
            if (player) {
                res.json(player); 
            } else {
                res.status(404).json({ error: 'Player not found' });
            }
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

const validateSchema = new mongoose.Schema({
    username:String,
    password:String
});

const Validate = mongoose.model('validate', validateSchema);

// POST route to handle SignUp
app.post('/signup', async (req, res) => {
    console.log("Received data:", req.body); // Log incoming data

    const { username, password } = req.body;

    try {
        const existingUser = await Validate.findOne({ username });
        if (existingUser) {
            console.log("Username already exists");
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new Validate({ username, password });
        await newUser.save();
        console.log("User saved successfully to DB:", newUser); // Log success

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username and password are correct
        const user = await Validate.findOne({ username, password });

        if (user) {
            // If the user is found, send a 200 response
            return res.status(200).json({ message: 'Login successful' });
        } else {
            // If the user is not found, send a 401 Unauthorized response
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Error during sign-in:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});




app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
