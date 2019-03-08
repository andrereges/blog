const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    update_at: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('users', User)