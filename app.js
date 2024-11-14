// Import core modules and libraries needed for the app
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import categoriesRouter from './routes/categories.js';
import workshopsRouter from './routes/workshops.js';
import mongoose from 'mongoose';
import hbs from 'hbs';
import passport from 'passport';
import session from 'express-session';
import User from './models/user.js';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load dotenv only if the environment is not production
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

// Define configuration for production and development environments
const isProduction = true;
console.log(isProduction);

const configs = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: isProduction
      ? 'https://frameworks-local-authentication-eck1abiwr-caro-arces-projects.vercel.app/auth/google/callback' // Production URL
      : 'https://frameworks-local-authentication-eck1abiwr-caro-arces-projects.vercel.app/auth/google/callback' // Production URL
  },
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
};

// Initialize the Express application
const app = express();

// Set up __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware setup
app.use(logger('dev')); // Logger for development
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Configure session management
app.use(session({
  secret: configs.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport for local strategy (authentication) with Mongoose User model
passport.use(User.createStrategy());

// Configure Passport with Google OAuth 2.0 strategy
passport.use(new googleStrategy(
  {
    clientID: configs.google.clientID,
    clientSecret: configs.google.clientSecret,
    callbackURL: configs.google.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Check if the user exists in the database
    const user = await User.findOne({ oauthId: profile.id });
    if (user) {
      return done(null, user);
    } else {
      // Create and save a new user if not found
      const newUser = new User({
        username: profile.displayName,
        oauthId: profile.id,
        oauthProvider: 'Google',
        created: Date.now()
      });
      const savedUser = await newUser.save();
      return done(null, savedUser);
    }
  }
));

// Serialize and deserialize user for session management
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up routers for different routes in the app
app.use('/', indexRouter); // Home page
app.use('/categories', categoriesRouter); // Categories page
app.use('/workshops', workshopsRouter); // Workshops page

// Connect to MongoDB using Mongoose with environment URI
mongoose.connect(configs.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected Successfully!'))
.catch((error) => console.log(`Error while connecting: ${error}`));

// Register Handlebars helpers for view templates
hbs.registerHelper('createOptionElement', (currentValue, selectedValue) => {
  const selectedProperty = currentValue == selectedValue.toString() ? 'selected' : '';
  return new hbs.SafeString(`<option ${selectedProperty}>${currentValue}</option>`);
});

hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});

// Error handling middleware for 404 (not found)
app.use((req, res, next) => {
  next(createError(404));
});

// General error handler for other errors
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Export the app as a module for use in other files
export default app;