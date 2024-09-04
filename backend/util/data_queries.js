const aws = require("./aws");

const uniqueColValues = async(table_name, col) => {
    const query = `
        SELECT DISTINCT ${ col }
        FROM datasets_${ table_name }
    `;

    return await aws.download(query);
}

const subsetSearch = async(table_name, input, cols = [], count = false, page = 1, pageLength = 10) => {
    let search;
    if (!input || !input.simpleSearch) {
        search = "";
    } else {
        search = String(input.simpleSearch);
    }
    
    let terms = search.toLowerCase().split(" ").map(x => x.trim());
    terms = terms.filter(x => x.length > 0);
    
    // let colFilter = "";
    // if (terms.length > 0 && cols.length > 0) {
    //     const filters = [];
    //     terms.forEach(term => {
    //         const colFilters = [];
    //         cols.forEach(col => {
    //             colFilters.push(`LOWER(${ col }) LIKE '%${ term }%'`);
    //         });
    //         filters.push(`(
    //             ${ colFilters.join(" OR \n") }
    //         )`);
    //     });

    //     colFilter = `WHERE ${ filters.join(" AND \n") }`;
    // }
    
    let query;
    if (count) {
        if (terms.length === 0) {
            query = `
                SELECT COUNT(*) AS "count"
                FROM datasets_${ table_name }
            `;
        } else {
            query = `
                SELECT COUNT(DISTINCT dataset.record_id) AS "count"
                FROM (
                    SELECT record_id, word
                    FROM tokens_${ table_name }
                    WHERE word IN (${ terms.map(x => `'${ x }'`).join(", ") })
                ) AS tokens
                JOIN (
                    SELECT *
                    FROM datasets_${ table_name }
                ) as dataset
                ON tokens.record_id = dataset.record_id
            `;
        }

        // query = `
        //     SELECT COUNT(*) AS "count"
        //     FROM datasets_${ table_name }
        //     ${ colFilter }
        // `;
    } else {
        if (terms.length === 0) {
            query = `
                SELECT *
                FROM datasets_${ table_name }
                ORDER BY record_id
                OFFSET ${ (page - 1) * pageLength }
                LIMIT ${ pageLength }
            `
        } else {
            query = `
                SELECT dataset.*
                FROM (
                    SELECT record_id, word
                    FROM tokens_${ table_name }
                    WHERE word IN ('${ terms.join(", ") }')
                ) AS tokens
                JOIN (
                    SELECT *
                    FROM datasets_${ table_name }
                ) as dataset
                ON tokens.record_id = dataset.record_id
                ORDER BY record_id
                OFFSET ${ (page - 1) * pageLength }
                LIMIT ${ pageLength }
            `;
        }

        // query = `
        //     SELECT *
        //     FROM (
        //         SELECT *
        //         FROM datasets_${ table_name }
        //         ${ colFilter }
        //         ORDER BY record_id
        //     ) AS filtered_data
        //     ORDER BY record_id
        //     OFFSET ${ (page - 1) * pageLength }
        //     LIMIT ${ pageLength}
        // `;
    }

    return await aws.download(query);
}

const getRecordsByIds = async(table_name, ids = []) => {
    const query = `
        SELECT *
        FROM datasets_${ table_name }
        WHERE record_id IN (${ ids.join(", ") })
    `;

    return await aws.download(query);
}

const getZoomIds = async(table_name, params) => {
    let datasetQuery;
    let tokenQuery;

    if (params.group_name && params.group_list.length > 0) {
        datasetQuery = `
            SELECT record_id
            FROM datasets_${ table_name }
            WHERE ${ params.group_name } IN (${ params.group_list.map(x => `'${ x }'`).join(", ") })
        `;
    }

    if (params.word_list.length > 0) {
        tokenQuery = `
            SELECT record_id
            FROM tokens_${ table_name }
            WHERE word IN (${ params.word_list.map(x => `'${ x }'`).join(", ") })
        `;
    }

    let query;
    if (datasetQuery && tokenQuery) {
        query = `
            SELECT dataset.record_id AS record_id
            FROM (
                ${ datasetQuery }
            ) AS dataset
            JOIN (
                ${ tokenQuery}
            ) AS tokens
            ON dataset.record_id = tokens.record_id
        `
    } else if (datasetQuery) {
        query = datasetQuery;
    } else if (tokenQuery) {
        query = tokenQuery;
    } else {
        query = `
            SELECT record_id
            FROM datasets_${ table_name }
        `;
    }

    return aws.download(query);
}

module.exports = {
    uniqueColValues,
    subsetSearch,
    getRecordsByIds,
    getZoomIds
}