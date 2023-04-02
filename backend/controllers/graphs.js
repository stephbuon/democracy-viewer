const files = require("../util/file_management");
const python = require("python-shell").PythonShell;

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
            results = await models.graphs.getGroupSplits(
                dataset, 
                params.group_name, 
                Array.isArray(params.group_list) ? params.group_list : [ params.group_list ],
                Array.isArray(params.word_list) ? params.word_list : [ params.word_list ]
            );
        } else {
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
    });
}

const sumCol = (data, col) => {
    let newData = [];
    data.forEach(x => {
        let found = false;
        newData.forEach((y, i) => {
            if (x.word === y.word && x.group === y.group) {
                found = true;
                newData[i].ids.push(x.id);
                newData[i][col] += Number.parseFloat(x[col]);
            }
        });

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