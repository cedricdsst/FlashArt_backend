const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cookieParser());
app.use(express.json());


const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;



// Connexion à MongoDB
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@${dbHost}/flashArt?retryWrites=true&w=majority&appName=Cluster0`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée  !', err));

// Configuration CORS
const corsOptions = {
    origin: ['http://localhost:8081', 'http://localhost:8080'],
    credentials: true, // Permettre les cookies et les en-têtes d'authentification
};
app.use(cors(corsOptions));

// Rendre les fichiers dans 'topicFiles' accessibles publiquement
app.use('/topicFiles', express.static(path.join(__dirname, 'topicFiles')));

// Routes

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const flashRoutes = require('./routes/flash');
const rdvRoutes = require('./routes/rdv');
const tagRoutes = require('./routes/tag');


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/api/flash', flashRoutes);
app.use('/api/rdv', rdvRoutes);
app.use('/api/tag', tagRoutes);

module.exports = app;
