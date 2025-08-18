const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/database");
require('dotenv').config();
const db = process.env.MONGO_URI 
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const seekerSchema = mongoose.Schema({
    name: String,
    email: String,
    image: {
        type:String, 
    },
    role: {
        type: String,
        default: "seeker"
    },
    phone: Number,
    jobs: String,
    city: String,
    password: String,
});

module.exports = mongoose.model("seeker", seekerSchema);