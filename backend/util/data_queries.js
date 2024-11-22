const aws = require("./aws");

const uniqueColValues = async(table_name, col) => {
    const query = `
        SELECT DISTINCT "${ col }"
        FROM democracy_viewer_athena.datasets_${ table_name }
        ORDER BY "${ col }"
    `;

    return await aws.download(query);
}

const subsetSearch = async(table_name, input, count = false, page = 1, pageLength = 10) => {
    let search;
    if (!input || !input.simpleSearch) {
        search = "";
    } else {
        search = String(input.simpleSearch);
    }
    
    let terms = search.toLowerCase().split(" ").map(x => x.trim());
    terms = terms.filter(x => x.length > 0);
    
    let query;
    if (count) {
        if (terms.length === 0) {
            query = `
                SELECT COUNT(*) AS "count"
                FROM democracy_viewer_athena.datasets_${ table_name }
            `;
        } else {
            query = `
                SELECT COUNT(DISTINCT dataset.record_id) AS "count"
                FROM (
                    SELECT record_id, word
                    FROM democracy_viewer_athena.tokens_${ table_name }
                    WHERE word IN (${ terms.map(x => `'${ x }'`).join(", ") })
                ) AS tokens
                JOIN (
                    SELECT *
                    FROM democracy_viewer_athena.datasets_${ table_name }
                ) as dataset
                ON tokens.record_id = dataset.record_id
            `;
        }
    } else {
        if (terms.length === 0) {
            query = `
                SELECT *
                FROM democracy_viewer_athena.datasets_${ table_name }
                ORDER BY record_id
                OFFSET ${ (page - 1) * pageLength }
                LIMIT ${ pageLength }
            `
        } else {
            query = `
                SELECT dataset.*
                FROM (
                    SELECT record_id, word
                    FROM democracy_viewer_athena.tokens_${ table_name }
                    WHERE word IN ('${ terms.join(", ") }')
                ) AS tokens
                JOIN (
                    SELECT *
                    FROM democracy_viewer_athena.datasets_${ table_name }
                ) as dataset
                ON tokens.record_id = dataset.record_id
                ORDER BY record_id
                OFFSET ${ (page - 1) * pageLength }
                LIMIT ${ pageLength }
            `;
        }
    }

    return await aws.download(query);
}

const downloadSubset = async(table_name, input) => {
    let search;
    if (!input || !input.simpleSearch) {
        search = "";
    } else {
        search = String(input.simpleSearch);
    }
    
    let terms = search.toLowerCase().split(" ").map(x => x.trim());
    terms = terms.filter(x => x.length > 0);

    let query;
    if (terms.length === 0) {
        query = `
            SELECT *
            FROM democracy_viewer_athena.datasets_${ table_name }
            ORDER BY record_id
        `
    } else {
        query = `
            SELECT dataset.*
            FROM (
                SELECT DISTINCT record_id
                FROM democracy_viewer_athena.tokens_${ table_name }
                WHERE word IN ('${ terms.join(", ") }')
            ) AS tokens
            JOIN (
                SELECT *
                FROM democracy_viewer_athena.datasets_${ table_name }
            ) as dataset
            ON tokens.record_id = dataset.record_id
            ORDER BY record_id
        `;
    }

    return await aws.downloadFileDirect(query);
}

const getRecordsByIds = async(table_name, ids = []) => {
    const query = `
        SELECT *
        FROM democracy_viewer_athena.datasets_${ table_name }
        WHERE record_id IN (${ ids.join(", ") })
        ORDER BY record_id
    `;

    return await aws.download(query);
}

const downloadRecordsByIds = async(table_name, ids = []) => {
    const query = `
        SELECT *
        FROM democracy_viewer_athena.datasets_${ table_name }
        WHERE record_id IN (${ ids.join(", ") })
        ORDER BY record_id
    `;

    return await aws.downloadFileDirect(query);
}

const getZoomIds = async(table_name, params) => {
    let datasetQuery;
    let tokenQuery;

    if (params.group_name && params.group_list.length > 0) {
        datasetQuery = `
            SELECT record_id
            FROM democracy_viewer_athena.datasets_${ table_name }
            WHERE "${ params.group_name }" IN (${ params.group_list.map(x => `'${ x }'`).join(", ") })
            ORDER BY record_id
        `;
    }

    if (params.word_list.length > 0) {
        tokenQuery = `
            SELECT DISTINCT record_id
            FROM democracy_viewer_athena.tokens_${ table_name }
            WHERE word IN (${ params.word_list.map(x => `'${ x.toLowerCase() }'`).join(", ") })
            ORDER BY record_id
        `;
    }

    let query;
    if (datasetQuery && tokenQuery) {
        query = `
            SELECT DISTINCT dataset.record_id AS record_id
            FROM (
                ${ datasetQuery }
            ) AS dataset
            JOIN (
                ${ tokenQuery}
            ) AS tokens
            ON dataset.record_id = tokens.record_id
            ORDER BY dataset.record_id
        `
    } else if (datasetQuery) {
        query = datasetQuery;
    } else if (tokenQuery) {
        query = tokenQuery;
    } else {
        query = `
            SELECT record_id
            FROM democracy_viewer_athena.datasets_${ table_name }
            ORDER BY record_id
        `;
    }

    return aws.download(query);
}

const getTopWords = async(table_name, search, column, values, page, pageLength) => {
    let datasetQuery = "";
    let tokenQuery;

    if (column && values && values.length > 0) {
        datasetQuery = `
            JOIN (
                SELECT record_id
                FROM datasets_${ table_name }
                WHERE "${ column }" IN (${ values.map(x => `'${ x }'`).join(", ") })
            ) AS datasets
            ON tokens.record_id = datasets.record_id
        `;
    }

    tokenQuery = `
        SELECT record_id, word, "count"
        FROM tokens_${ table_name }
        WHERE word LIKE '%${ search }%'
    `;

    const query = `
        SELECT tokens.word AS word, SUM(tokens.count) AS "count"
        FROM (
            ${ tokenQuery }
        ) AS tokens
        ${ datasetQuery }
        GROUP BY tokens.word
        ORDER BY "count" DESC, tokens.word
        OFFSET ${ (page - 1) * pageLength }
        LIMIT ${ pageLength }
    `;

    return aws.download(query);
}

module.exports = {
    uniqueColValues,
    subsetSearch,
    downloadSubset,
    getRecordsByIds,
    downloadRecordsByIds,
    getZoomIds,
    getTopWords
}