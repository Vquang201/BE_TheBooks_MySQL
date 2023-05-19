const generateCode = (value) => {
    let output = ''
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ').forEach(element => {
        output += element.charAt(1) + element.charAt(0)
    })

    return output.toLocaleUpperCase() + value.length
}

module.exports = generateCode