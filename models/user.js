// Import mongoose
import mongoose from 'mongoose';
import plm from 'passport-local-mongoose';

// Schema 
const dataSchemaObj = {
    username: { type: String },
    password: { type: String },
    oauthId: { type: String },
    oauthProvider: { type: String },
    created: { type: Date },
};

// Create mongoose schema
const userSchema = new mongoose.Schema(dataSchemaObj);
userSchema.plugin(plm);

export default mongoose.model('User', userSchema);
