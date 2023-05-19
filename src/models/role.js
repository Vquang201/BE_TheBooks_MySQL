'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
        }
    }
    Role.init({
        code: DataTypes.STRING,
        value: DataTypes.STRING

    }, {
        sequelize,
        modelName: 'Role',
    });
    return Role;
};