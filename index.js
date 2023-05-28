const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 8000
const routes = require('./src/routes')
const DataBase = require('./sequelize_db')



// Connect DB
DataBase()

app.use(cors({
    origin: process.env.CLIENT_URL,
    method: ['GET', 'POST', 'PUT', 'DELETE']
}))

//Đọc data 
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//routes
routes(app)

//PORT
app.listen(PORT, () => {
    console.log('Server is running ...')
})