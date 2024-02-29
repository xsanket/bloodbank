const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true,
        enum: ['donar', 'organization', 'hospital', 'admin']
    },

    name: {
        type: String,
        required: function () {
            if (this.userType == 'admin' || this.userType == 'donar') {
                return true;
            }
            return false;
        },
    },

    hospitalName: {
        type: String,
        required: function () {
            if (this.userType == "hospital") {
                return true;
            }
            return false;
        },
    },

    organizationName: {
        type: String,
        required: function () {
            if (this.userType == "organization") {
                return true;
            }
            return false;
        },
    },

    website: {
        type: String,
        required: function () {
            if (this.userType == "organization" || this.userType == "hospital") {
                return true;
            }
            return false;
        },
    },

    address: {
        type: String,
        required: function () {
            if (this.userType == "organization" || this.userType == "hospital") {
                return true;
            }
            return false;
        },
    },







    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        requird: true
    },




},
    {
        timestamps: true,
},
);

module.exports = mongoose.model("users", userSchema);