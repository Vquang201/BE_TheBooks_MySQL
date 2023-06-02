const jwt = require('jsonwebtoken')
const { badRequest, unauthorized } = require('./handleError')

// CHECK TOKEN
const verifyToken = (req, res, next) => {
    const token = req.headers.token

    if (!token) {
        return badRequest('require Login !!!', res)
    }

    // Bearer đasadsa
    const accessToken = token.split(' ')[1]
    jwt.verify(accessToken, process.env.JWT_SCRET, (err, decode) => {
        const isChecked = err instanceof jwt.TokenExpiredError
        if (err) {
            if (isChecked) {
                return unauthorized('TOKEN EXPIRED', res)
            } else {
                return unauthorized('ACCESS TOKEN INVALID', res)
            }
        }


        req.user = decode
        next()
    })
}

const isAdmin = (req, res, next) => {
    if (req.user.role_code !== 'R1') {
        return unauthorized('require role admin', res)
    }
    next()
}

const isModerator = (req, res, next) => {
    if (req.user.role_code !== 'R1' && req.user.role_code !== 'R2') {
        return unauthorized('require role Moderator (R2)', res)
    }
    next()
}


module.exports = {
    verifyToken,
    isAdmin,
    isModerator
}