const database = require('../models')
const data = require('../../data/data.json')
const { badRequest } = require('../middlewares/handleError')
const generateCode = require('../helper/func')

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


}

module.exports = new BookController