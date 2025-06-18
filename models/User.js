const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
   surname: {
        type:DataTypes.STRING(50),
        allowNull: true,
   },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    
    is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // New fields for numeric reset codes
    resetPasswordCode: {
        type: DataTypes.STRING(6),
        allowNull: true
    },
    resetPasswordCodeExpires: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true, 
    hooks: {
        // Hash password before saving
        beforeCreate: async (user) => {
            if (user.password) {
                const saltRounds = 12; // Increased from 10 to 12
                user.password = await bcrypt.hash(user.password, saltRounds);
                user.passwordChangedAt = new Date();
            }
        },
        // Hash password before updating (only if password changed)
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const saltRounds = 12;
                user.password = await bcrypt.hash(user.password, saltRounds);
                user.passwordChangedAt = new Date();
            }
        }
    }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user without password
User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.emailVerificationToken;
    delete values.resetPasswordToken;
    return values;
};

// Instance method to check if account is locked
User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
User.prototype.incLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.update({
            $inc: { loginAttempts: 1 },
            lockUntil: null
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }
    
    return await this.update(updates);
};

// Instance method to reset login attempts
User.prototype.resetLoginAttempts = async function() {
    return await this.update({
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date()
    });
};

module.exports = User; 