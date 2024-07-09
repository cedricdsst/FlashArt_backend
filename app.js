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
    origin: 'http://localhost:5173', // Remplacez par l'origine de votre frontend
    credentials: true, // Permettre les cookies et les en-têtes d'authentification
};
app.use(cors(corsOptions));

// Rendre les fichiers dans 'topicFiles' accessibles publiquement
app.use('/topicFiles', express.static(path.join(__dirname, 'topicFiles')));

// Routes
const topicRoutes = require('./routes/topic');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const vinRoutes = require('./routes/vin');
const ecoleRoutes = require('./routes/ecole');
const atelierRoutes = require('./routes/atelier');
const flashRoutes = require('./routes/flash');
const rdvRoutes = require('./routes/rdv');

app.use('/api/topic', topicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vin', vinRoutes);
app.use('/api/ecole', ecoleRoutes);
app.use('/api/atelier', atelierRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/rdv', rdvRoutes);

module.exports = app;
