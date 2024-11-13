import 'dotenv/config';

// Global configurations object contains Application Level variables such as:
// client secrets, passwords, connection strings, and misc flags

const configurations = {
  ConnectionStrings: {
    MongoDB: process.env.MONGO_URI, 
  },
  Authentication: {
    Google: {
      ClientId: process.env.GOOGLE_CLIENT_ID, 
      ClientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      CallbackURL: process.env.GOOGLE_CALLBACK_URL,
    }
  },
};
module.exports = configurations;
