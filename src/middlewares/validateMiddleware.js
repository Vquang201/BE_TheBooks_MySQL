const joi = require('joi')

const schemaValidate = joi.object({
    email: joi.string()
        .pattern(new RegExp('gmail.com$'))
        .min(6)
        .required(),
    password: joi.string()
        .min(3)
        .required()
}).with('email', 'password')

module.exports = schemaValidate