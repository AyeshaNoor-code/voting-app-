var express = require('express'); //make server
const app = express();
require('dotenv').config();
const db = require('./db');
const { jwtAuthMiddleware } = require('./jwt');



const bodyParser = require('body-parser'); //data formatting
app.use(bodyParser.json());



const userRoutes = require('./models/userRoutes'); 
app.use('/user', userRoutes);//give proper endpoint name-------



const candidateRoutes = require('./models/candidateRoutes'); 
app.use('/candidate', candidateRoutes);//give proper endpoint name-------



const PORT = process.env.PORT || 3000;//Take portNo from .env and if not then port will be 3000


app.listen(PORT, () => {
    console.log('Listening on port 3000');
});

