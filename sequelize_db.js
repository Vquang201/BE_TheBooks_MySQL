const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('store', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // khỏi bắn log 
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection DB successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectDB