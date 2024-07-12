const python = require("python-shell").PythonShell;
const { encodeConnection } = require("../controllers/databases");
const { defaultConfig } = require("./database_config");

const runPython = async(script, args, database = undefined) => {
    // Add file names as command line arguments
    const options = { args }

    // If distributed connection, add encoded token to args
    if (database) {
        const token = await encodeConnection(require("knex")(defaultConfig()), database);
        options.args.push(token);
    }

    // If a python path is provided in .env, use it
    // Else use the default path
    if (process.env.PYTHON_PATH) {
        options["pythonPath"] = process.env.PYTHON_PATH;
    }

    // Run python program to upload dataset
    await python.run(`python/${ script }`, options).then(x => console.log(x)).catch(x => {
        console.error(x);
        throw new Error(x);
    });
}

module.exports = runPython;