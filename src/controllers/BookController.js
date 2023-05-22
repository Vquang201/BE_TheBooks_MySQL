const database = require('../models')
const data = require('../../data/data.json')
const { badRequest, notFound } = require('../middlewares/handleError')
const generateCode = require('../helper/func')
const { Op, where } = require("sequelize");
class BookController {
    //[GET] /
    async insertData(req, res) {
        try {
            const categories = Object.keys(data)
            categories.forEach(async (element) => {
                await database.Category.create({
                    code: generateCode(element),
                    value: element
                })
            })

            // [key  , [1, 2, 3]]
            const dataArray = Object.entries(data)
            dataArray.forEach((element) => {
                element[1]?.map(async (book) => {
                    await database.Book.create({
                        id: book.upc,
                        title: book.bookTitle,
                        price: book.bookPrice,
                        available: book.available,
                        image: book.imageUrl,
                        description: book.bookDescription,
                        category_code: generateCode(element[0])
                    })
                })
            })

            res.status(200).json(categories)
        } catch (error) {
            return badRequest(error, res)
        }
    }

    // [GET]/books?page=1&limit=10&name=man&&order=ASC
    async getBooksAndQueries(req, res) {
        const limit = Number(req.query.limit)
        const offset = Number(req.query.page)
        const order = req.query.order
        const title = req.query.title
        const available = req.query.available

        const skip = (offset * limit) - limit

        //34p24

        if (offset && limit && !title) {
            console.log('1')
            const { count, rows } = await database.Book.findAndCountAll({
                where: {
                    // title: [
                    //     [Op.literal('laughReactionsCount'), order]
                    // ]

                },
                offset: skip,
                limit: limit,
                order: order ? [['title', order]] : undefined
            })
            return res.status(200).json({ rows, count })
        }

        else if (title) {
            console.log('title')
            const { count, rows } = await database.Book.findAndCountAll({
                where: {
                    title: {
                        [Op.substring]: title,
                    },

                },
                offset: skip,
                limit: limit,
                order: order ? [['title', order]] : undefined

            })
            return res.status(200).json({ rows, count })
        }
        else {
            return notFound(req, res)
        }

    }

    // async bookFilter (req , res) {
    //     const 
    // }


}

module.exports = new BookController