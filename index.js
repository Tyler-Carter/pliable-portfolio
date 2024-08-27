/* ---------- MODULES ---------- */
const bodyParser = require('body-parser');
const chalk = require('chalk');
const compression = require('compression');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const fs = require('fs-extra');
const helmet = require('helmet');
const methodOverride = require('method-override');
const { Sequelize } = require('sequelize');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const session = require('express-session');

/* ---------- CLASSES & INSTANCES ---------- */
const app = express();

/* ---------- CONSTANTS ---------- */
const DB_NAME = 'postgres';
const DOTENV_RESULT = dotenv.config();
const POSTGRES_URI = process.env.POSTGRES_URI || `postgresql://127.0.0.1:5432/${DB_NAME}`;
const PORT = process.env.PORT || 3000;

/* ---------- FUNCTIONS ---------- */
const passportInit = require('./auth/init');
const passportLocal = require('./auth/local');

function updateFontAwesome() {
    fs.copy('./node_modules/@fortawesome/fontawesome-free/css/all.min.css', 'public/styles/fontawesome.css', (err) => {
        if (err) throw err;
    });

    fs.copy('./node_modules/@fortawesome/fontawesome-free/webfonts', 'public/webfonts', (err) => {
        if (err) throw err;
    });
}

/* ---------- INITIALIZATION ---------- */
//updateFontAwesome();

/* ----- Dotenv ----- */
if (DOTENV_RESULT.error) {
    console.error(chalk.red(`${DOTENV_RESULT.error}`)); // Create a .env file to stop this error.
}

/* ----- Express ----- */
app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, 'public'))); // URL path begins at /public.

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(bodyParser.urlencoded({extended: false})); // Parse application/x-www-form-urlencoded.
app.use(bodyParser.json()); // Parse application/json.
app.use(cors());
app.use(compression()); // Compress all responses.
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.ico'))); // Go to http://localhost:3000/assets/favicon.ico to refresh icon.
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use(flash());
app.use(methodOverride('_method', {methods: ['POST', 'GET']})); // Process POST request suffixed with ?_method=DELETE or ?_method=PUT.
app.use(morgan('dev'));
app.use(session({
    name: 'qid',
    secret: process.env.SESSION_SECRET || 'dQw4w9WgXcQ', // run `node -e "console.log(crypto.randomBytes(32).toString('hex'))"` in console to generate secret.
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 2 * 365 // 2 years
    }
}));


/* ----- Sequelize ----- */
// New sequelize instance that pulls db connect info from dotenv node

class User {
    const user = new Sequelize(DB_NAME, )
}

/**const User = new Sequelize({
    dialect: 'postgres',
    storage: POSTGRES_URI,
    logQueryParameters: true,
    benchmark: true
});**/

//Imports model definition files from the local models directory
const modelDefiners = [
    require('./models/User.model'),
];

// This expression defines each model according to its associated file
for (const modelDefiner of modelDefiners) {
    modelDefiner(User);
}

module.exports = User;


/* ----- Passport ----- */
app.use(passport.initialize());
app.use(passport.session());

passport.use(passportLocal());
passportInit();

/* ---------- ROUTES ---------- */
app.use('/', require('./routes/index'));
// app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// Redirect invalid pages
app.use((req, res) => {
    res.format({
        html: () => {
            res.status(404);
            res.render('404');
        },
        json: () => {
            res.json({error: 'Not found'});
        },
        default: () => {
            res.type('txt').send('Not found');
        }
    });
});

/* ---------- LAUNCH ---------- */
app.listen(PORT, () => {
    console.log(chalk.blue(`🚀 Server running at http://localhost:${PORT}/`));
});