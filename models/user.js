const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/database");
const userSchema = mongoose.Schema({
    name: String,
    email: String,
    image: {
        type:String,
    },
    role: {
        type: String,
        default: "user"
    },
    phone: Number,
    password: String,
});

module.exports = mongoose.model("user", userSchema);