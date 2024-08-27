'use strict';

const bcrypt = require('bcryptjs');
const _ = require('lodash');
const { DataTypes } = require('sequelize');
const sharp = require('sharp');
const validator = require('validator');

// This is an extension of the model created in the index.js
// The extension will be used to define attributes and pass on other included options
// Each model object requires its own node within the ./models directory
class User extends User{}

User.init(
    { // All of the model attributes are defined here
        userId: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                is: /^\w{5,}$/
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            lowerCase: true,
            trim: true,
            unique: true,
            validate: {
                validator: function(value) {
                    return validator.isEmail(value);
                },
                message: props => `${props.value} is not a valid email.`
            }
        },
        password: {
            type: DataTypes.STRING,
            required: true,
            validate: {
                validator: function(value) {
                    return validator.isStrongPassword(value);
                },
                message: props => `${props.value} is not a strong password, please try again.`
            }
        },
    },
    // Below are other model options that will be included
    { 
        User, // This passes on the connection instance for us
        modelName: 'User', // This names the model that is being passed on
    },
);

/* ---------- HOOKS ---------- */
/* ----- Pre ----- */

userSchema.pre('save', async function (next) {
    // Condition will hold true when new user is created or password modification
    if (this.isModified('password')) {0
        this.password = await bcrypt.hash(this.password, 10);
    }

    if (!this.isModified('profile.photo')) {
        this.profile = {photo: await sharp('public/assets/profile-photo.png').resize(400, 400).toBuffer()};
    }

    next();
});

/* ---------- FUNCTIONS ---------- */
/* ----- Instance Methods ----- */
userSchema.methods.verifyPassword = function (inputPassword, callback) {
    return bcrypt.compare(inputPassword, this.password, callback);
};

module.exports = mongoose.model('User', userSchema);