import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import categoriesRouter from './routes/categories.js';
import workshopsRouter from './routes/workshops.js';
import mongoose from 'mongoose';
import { default as configs } from './configs/globals.js';
import hbs from 'hbs';
import passport from 'passport';
import session from 'express-session';
import User from './models/user.js';
import { Strategy as googleStrategy } from 'passport-google-oauth20';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv'; // Importar dotenv

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

const app = express();

// Obtén la ruta del directorio de manera compatible con ES Modules
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
  secret: process.env.SESSION_SECRET, // Usar la variable de entorno para el secreto de la sesión
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.use(new googleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID, // Usar la variable de entorno para el Google Client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Usar la variable de entorno para el Google Client Secret
    callbackURL: process.env.GOOGLE_CALLBACK_URL // Usar la variable de entorno para el callback URL
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

mongoose
  .connect(process.env.MONGO_URI, { // Usar la variable de entorno para la URI de MongoDB
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((message) => console.log('Connected Successfully!'))
  .catch((error) => console.log(`Error while connecting: ${error}`));

hbs.registerHelper('createOptionElement', (currentValue, selectedValue) => {
  var selectedProperty = '';
  if (currentValue == selectedValue.toString()) {
    selectedProperty = 'selected';
  }
  return new hbs.SafeString(
    `<option ${selectedProperty}>${currentValue}</option>`
  );
});

hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;
