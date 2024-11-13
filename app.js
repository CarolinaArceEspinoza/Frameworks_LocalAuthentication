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

// Solo cargar dotenv si el entorno no es producción
if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

// Configuración de variables para el entorno de producción y desarrollo
const isProduction = process.env.NODE_ENV === 'production';

const configs = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: isProduction
      ? 'https://tuapp.vercel.app/auth/google/callback' // URL de producción en Vercel
      : 'http://localhost:3000/auth/google/callback'    // URL local para desarrollo
  },
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
};

const app = express();

// Obtener __dirname para trabajar con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: configs.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.use(new googleStrategy(
  {
    clientID: configs.google.clientID,
    clientSecret: configs.google.clientSecret,
    callbackURL: configs.google.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({ oauthId: profile.id });
    if (user) {
      return done(null, user);
    } else {
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

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/categories', categoriesRouter);
app.use('/workshops', workshopsRouter);

mongoose.connect(configs.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected Successfully!'))
.catch((error) => console.log(`Error while connecting: ${error}`));

hbs.registerHelper('createOptionElement', (currentValue, selectedValue) => {
  const selectedProperty = currentValue == selectedValue.toString() ? 'selected' : '';
  return new hbs.SafeString(`<option ${selectedProperty}>${currentValue}</option>`);
});

hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;
