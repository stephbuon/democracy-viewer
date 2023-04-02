const files = require("../util/file_management");
const python = require("python-shell").PythonShell;

// Generate the data for a graph based on user input
const createGraph = async(models, dataset, params, user = null) => {
    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await models.datasets.getMetadata(dataset);
    if (!metadata.is_public && metadata.username !== user) {
        throw new Error(`User ${ user } does not have access to the dataset ${ dataset }`);
    }

    // If the metric is raw, return raw splits
    if (params.metric === "raw") {
        let results;
        if (params.word_list) {
            // If a word list was given, return splits for only given words
            results = await models.graphs.getGroupSplits(
                dataset, 
                params.group_name, 
                Array.isArray(params.group_list) ? params.group_list : [ params.group_list ],
                Array.isArray(params.word_list) ? params.word_list : [ params.word_list ]
            );
        } else {
            // Else, return all words for the given groups
            results = await models.graphs.getGroupSplits(
                dataset, 
                params.group_name, 
                Array.isArray(params.group_list) ? params.group_list : [ params.group_list ]
            );
        }
        
        return sumCol(results, "n");
    }

    // Create input file with data for python program
    const input = await models.graphs.getGroupSplits(dataset, params.group_name, params.group_list);
    const file1 = "graphs/files/input/" + dataset + "_" + Date.now() + ".csv";
    await files.generateCSV(file1, input);
    // Create input file with parameters for python program
    const file2 = file1.replace(".csv", ".json");
    files.generateJSON(file2, params);

    // Run python program that generates graph data
    try {
        await python.run("graphs/launch.py", {
            args: [ file1, file2 ]
        }).then(x => console.log(x));
    } catch(err) {
        files.deleteFiles([ file1, file2 ]);
        throw new Error(err);
    }
   
    // Read python output file and return results
    const file3 = file1.replace("/input/", "/output/");
    return await files.readCSV(file3).then(async(data) => {
        files.deleteFiles([ file1, file2 ]);

        return data;
        // return joinData(input, data, params.metric);
    });
}

// Take the sum of a column and add ids as an array
const sumCol = (data, col) => {
    let newData = [];
    // Iterate through original data
    data.forEach(x => {
        let found = false;

        // Iterate through new data
        for (let i = 0; i < newData.length; i++) {
            if (x.word === newData[i].word && x.group === newData[i].group) {
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

// // Join ids with calculated data
// const joinData = (original, calculated, metric) => {
//     let newData = [];

//     if (metric === "ll") {
//         calculated.forEach(x => {
//             let found = false;

//             for (let i = 0; i < original.length; i++) {
//                 if ()
//             }
//         })
//     } else if (metric === "jsd") {

//     } else if (metric === "ojsd") {

//     }
// }

module.exports = {
    createGraph
}