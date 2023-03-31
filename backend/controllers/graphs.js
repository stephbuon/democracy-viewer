const files = require("../util/file_management");
const terminal = require("child_process").execSync;

const createGraph = async(models, dataset, params, user = null) => {
    // Check dataset metadata to make sure user has access to this dataset
    const metadata = await models.datasets.getMetadata(dataset);
    if (!metadata.is_public && metadata.username !== user) {
        throw new Error(`User ${ user } does not have access to the dataset ${ dataset }`);
    }

    // If the metric is raw, return raw splits
    if (params.metric === "raw") {
        return await models.graphs.getGroupSplits(dataset, params.group_name, params.group_list);
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
        const python = terminal(`python3 graphs/launch.py ${ file1 } ${ file2 }`, { encoding: 'utf-8' });
        console.log(python);
    } catch(err) {
        files.deleteFiles([ file1, file2 ]);
        throw new Error(err);
    }
   
    // Read python output file and return results
    const file3 = file1.replace("/input/", "/output/");
    return await files.readCSV(file3).then(async(data) => {
        throw new Error()
        files.deleteFiles([ file1, file2, file3 ]);

        return data;
    });
}

module.exports = {
    createGraph
}