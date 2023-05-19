const createError = require('http-errors')

const badRequest = (err, res) => {
    const error = createError.BadRequest(err)
    return res.status(error.status).json({ mes: error.message })
}

const internalSeverError = (req, res) => {
    const error = createError.InternalServerError()
    return res.status(error.status).json({ mes: error.message })
}

const notFound = (req, res) => {
    const error = createError.NotFound('NOT FOUND')
    return res.status(error.status).json({ mes: error.message })
}

const unauthorized = (err, res) => {
    const error = createError.Unauthorized(err)
    return res.status(error.status).json({ mes: error.message })
}

module.exports = {
    badRequest,
    internalSeverError,
    notFound,
    unauthorized
}