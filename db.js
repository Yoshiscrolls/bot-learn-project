const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telegrambot',
    'postgres',
    '822333',
    {
        host: 'localhost',
        port: 5432,
        dialect: "postgres"
    }
)