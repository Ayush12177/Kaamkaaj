const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/database");
const userSchema = mongoose.Schema({
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
        default: "user"
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model("user", userSchema);