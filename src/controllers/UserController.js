const database = require('../models')
class UserController {
    //[GET] /
    async getAllUser(req, res) {
        const users = await database.User.findAll({})
        res.status(200).json(users)
    }

    //[GET] /users/user-logined
    async getAnUser(req, res) {
        const user = await database.User.findOne({
            where: { id: req.user.id },
            attributes: {
                // trừ filed password
                exclude: ['password']
            },
            include: [
                {
                    model: database.Role,
                    as: 'role_data',
                    // lấy 3 filed [id code value ]
                    attributes: ['id', 'code', 'value']
                }

            ]
        })
        res.status(200).json(user)
    }
}

module.exports = new UserController