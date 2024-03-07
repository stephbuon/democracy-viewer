const files = require("../util/file_management");
const python = require("python-shell").PythonShell;
require('dotenv').config();

const datasets = require("../models/datasets");
const graphs = require("../models/graphs");

// Generate the data for a graph based on user input
const createGraph = async(knex, dataset, params, user = null) => {
    const model_datasets = new datasets(knex); 
    const model_graphs = new graphs(knex); 

    // Check if the provided metrics is valid
    const metrics = [
        "counts",
        "proportion",
        "tf-idf",
        "ll",
        "jsd",
        "ojsd"
    ];
    if (!metrics.includes(params.metric)) {
        throw new Error(`Invalid metric ${ params.metric }`);
    }

    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await model_datasets.getMetadata(dataset);
    if (!metadata.is_public && metadata.username !== user) {
        throw new Error(`User ${ user } does not have access to the dataset ${ dataset }`);
    }

    params.table_name = dataset;
    // Convert params.group_list and params.word_list to arrays if they aren't already
    params.group_list = Array.isArray(params.group_list) ? params.group_list : params.group_list ? [ params.group_list ] : [];
    params.word_list = Array.isArray(params.word_list) ? params.word_list : params.word_list ? [ params.word_list ] : [];

    // let input;
    // // Get split text records
    // input = await model_graphs.getGroupSplits(
    //     dataset, 
    //     params.group_name, 
    //     params.group_list
    // );

    // if (params.metric === "counts" && params.word_list.length === 0) {
    //     return sumCol(input, "n");
    // }

    // If input has no results, return an empty array
    // if (input.length === 0) {
    //     return [];
    // }
    // Create input file with data for python program
    const file1 = "graphs/files/input/" + dataset + "_" + Date.now() + ".json";
    // await files.generateCSV(file1, input);
    // Create input file with parameters for python program
    // const file2 = file1.replace(".csv", ".json");
    files.generateJSON(file1, params);

    // Add file names as command line arguments
    const options = {
        args: [ file1 ]
    }

    // If distributed connection, add encoded token to args
    if (user && user.database) {
        const token = await encodeConnection(require("knex")(defaultConfig()), user.database);
        options.args.push(token);
    }
    
    // If a python path is provided in .env, use it
    // Else use the default path
    if (process.env.PYTHON_PATH) {
        options["pythonPath"] = process.env.PYTHON_PATH;
    }

    // Run python program that generates graph data
    try {
        await python.run("graphs/launch.py", options).then(x => console.log(x)).catch(x => {
            console.log(x);
            throw new Error(x);
        });
    } catch(err) {
        if (!files.fileExists(file1.replace("/input/", "/output/"))) {
            files.deleteFiles([ file1 ]);
            throw new Error(err);
        } else {
            console.log(err)
        }
    }
   
    // Read python output files and return results
    // const file3 = file1.replace("/input/", "/output/");
    // const file4 = file2.replace("/input/", "/output/");
    // return await files.readCSV(file3).then(async(data) => {
    //     const ids = files.readJSON(file4);
    //     files.deleteFiles([ file1, file2 ]);

    //     return joinData(data, params, ids);
    // });
    const file2 = file1.replace("/input/", "/output/");
    return files.readJSON(file2);
}

// Join ids with calculated data
const joinData = (calculated, params, ids) => {
    let newData = [ ...calculated ];

    if (params.metric === "ll") {
        newData = newData.map(x => {
            x.ids = [];
            ids.forEach(y => {
                if (y.word === x.word) {
                    x.ids = [ ...x.ids, ...y.ids ];
                }
            }); 
            x.ids = x.ids.map(y => parseInt(y));
            x.ids = [ ...new Set(x.ids) ].sort();

            return x;
        });
    } else if (params.metric === "jsd") {
        newData = newData.map(x => {
            const groups = Object.keys(x)[1].split("_").splice(1).map(x => x.toLowerCase());
            x.ids = [];
            ids.forEach(y => {
                if (y.word === x.word && groups.includes(y.group.replace(" ", ".").toLowerCase())) {
                    x.ids = [ ...x.ids, ...y.ids ];
                }
            }); 
            x.ids = x.ids.map(y => parseInt(y));
            x.ids = [ ...new Set(x.ids) ].sort();

            return x;
        });
    } else if (params.metric === "ojsd") {
        newData = newData.map(x => {
            const groups = Object.keys(x)[0].split("_").splice(1).map(x => x.toLowerCase());
            x.ids = [];
            ids.forEach(y => {
                if (params.word_list.length === 0 || (params.word_list.includes(y.word) && groups.includes(y.group.replace(" ", ".").toLowerCase()))) {
                    x.ids = [ ...x.ids, ...y.ids ];
                }
            }); 
            x.ids = x.ids.map(y => parseInt(y));
            x.ids = [ ...new Set(x.ids) ].sort();

            return x;
        });
    } else if (params.metric === "counts") {
        newData = newData.map(x => {
            x.ids = [];
            ids.forEach(y => {
                if (x.word === y.word && x.group === y.group) {
                    x.ids = [ ...x.ids, ...y.ids ];
                }
            });
            x.ids = x.ids.map(y => parseInt(y));
            x.ids = [ ...new Set(x.ids) ].sort();

            return x;
        });
    } else if (params.metric === "tf-idf" || params.metric === "proportion") {
        newData = newData.map(x => {
            x.ids = [];
            ids.forEach(y => {
                if (x.word === y.word && x.group === y.group) {
                    x.ids = [ ...x.ids, ...y.ids ];
                }
            }); 
            x.ids = [ ...new Set(x.ids) ].sort((a,b) => a - b);

            return x;
        });
    } else {
        throw new Error(`Invalid metric ${ params.metric }`);
    }

    return newData;
}

// Take the sum of a column and add ids as an array
const sumCol = (data, col) => {
    let newData = [];
    // Iterate through original data
    data.forEach(x => {
        let found = false;

        // Iterate through new data
        for (let i = 0; i < newData.length; i++) {
            if (x.word === newData[i].word && (!x.group || x.group.toLowerCase() === newData[i].group.toLowerCase())) {
                // If the word and group match, add id and increment count
                found = true;
                newData[i].ids.push(x.id);
                newData[i][col] += Number.parseFloat(x[col]);
                break;
            }
        }

        // If no word and group match was found, create a new record
        if (!found) {
            newData.push({
                ids: [ x.id ],
                [col]: Number.parseFloat(x[col]),
                word: x.word,
                group: x.group
            });
        }
    });

    return newData;
}

module.exports = {
    createGraph
}