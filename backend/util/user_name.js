const users = require("../models/users");

// Get a user's formatted name
const getName = async(knex, email) => {
    const model = new users(knex);

    const record = await model.findUserByEmail(email);
    let name = `${ record.first_name } ${ record.last_name }`;
    if (record.title) {
        name = `${ record.title } ${ name }`;
    }
    if (record.suffix) {
        name = `${ name } ${ record.suffix }`;
    }

    return name;
}

module.exports = {
    getName
};