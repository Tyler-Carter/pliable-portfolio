const bcrypt = require('bcryptjs');
const { lowerCase, valuesIn } = require('lodash');
const { DataTypes } = require('sequelize'); //TODO: Change to use sequelize instead of mongoose
const sharp = require('sharp');
const validator = require('validator');

// A model definition is exported as a function
// The function will automatically receive the Sequelize connection object as a parameter
module.exports = (sequelize) => {
    sequelize.define('user' , {
        //The default ID section was included but can be omitted
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
        }
    });
};

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