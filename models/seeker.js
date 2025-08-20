const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/database");
require('dotenv').config();
const db = process.env.MONGO_URI 
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const seekerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    image: {
        type:String,
        default: "default.jpg"
    },
    role: {
        type: String,
        default: "seeker"
    },
    phone: {
        type: Number,
        required: true
    },
    jobs: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("seeker", seekerSchema);