const users = require('./users')
const auth = require('./auth')
const book = require('./book')
const { notFound } = require('../middlewares/handleError')


function routes(app) {
    app.use('/api/v1/users', users)
    app.use('/api/v1/auth', auth)
    app.use('/api/v1/books', book)
    // nếu không phù hợp 2 routes trên thì NOT FOUND (middleware)
    app.use(notFound)
}


module.exports = routes


