// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import { PaginatedDataTable } from "../common/PaginatedDataTable.jsx";
import Highlighter from "react-highlight-words";
import { getTextCols } from "../api/api.js";
import { DownloadIds } from "../apiFolder/SubsetSearchAPI.js";
import { metricNames } from "../common/metrics.js";

const pageLength = 10;

export const Zoom = () => {
    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [graphData, setGraphData] = useState(undefined);
    const [totalPages, setTotalPages] = useState(1);
    const [textCols, setTextCols] = useState([]);

    const getPage = (currPage) => {
        const start = pageLength * (currPage - 1);
        const end = start + pageLength * currPage;
        const ids = graphData.ids.slice(start, end);

        getRecordsByIds(graphData.dataset, ids).then(async (res) => {
            if (res) {
                // Highlighting
                if (textCols.length > 0) {
                    res.map(row => {
                        textCols.forEach(col => {
                            row[col] = (
                                <Highlighter
                                    searchWords={graphData.words}
                                    textToHighlight={ row[col] }
                                />
                            )
                        });
                        return row;
                    })
                }
                setSearchResults(res)
            }
        })
    }

    // UseEffect: Gets record for all data.ids and populates searchResults
    useEffect(() => {
        const graphData_ = JSON.parse(localStorage.getItem('selected'));
        setGraphData({ ...graphData_ });
        getTextCols(graphData_.dataset).then(x => setTextCols(x));
    }, []);

    useEffect(() => {
        if (graphData && textCols.length > 0) {
            // Pagination
            getPage(1);
            setTotalPages(Math.ceil(graphData.ids.length / pageLength));
        }
    }, [graphData, textCols]);

    if (!graphData) {
        return <>Loading...</>
    }

    return <>
        <div>
            <div className="container text-center p-5">
                {/* Top labels */}
                <div className="row pb-2">
                    <div className="col"></div>
                    <div className="col">
                        <b>Metric</b>
                    </div>
                    <div className="col">
                        <b>X</b>
                    </div>
                    <div className="col">
                        <b>Y</b>
                    </div>
                    <div className="col">
                        <b>Word(s)</b>
                    </div>
                </div>

                {/* Word data */}
                <div className="row">
                    <div className="col">
                        <b>Selected Datapoint</b>
                    </div>
                    <div className="col">
                        {metricNames[graphData.metric]}
                    </div>
                    <div className="col">
                        {graphData.x}
                    </div>
                    <div className="col">
                        {graphData.y}
                    </div>
                    <div className="col">
                        {graphData.words.join(", ")}
                    </div>
                </div>

                
            </div>
        </div>
        <PaginatedDataTable
            searchResults = {searchResults}
            totalNumOfPages = {totalPages}
            GetNewPage = {getPage}
            table_name={graphData.dataset}
            downloadSubset={() => DownloadIds(graphData.dataset, graphData.ids)}
            totalNumResults={graphData.ids.length}
            columns = {searchResults.length > 0 ? Object.keys(searchResults[0]) : []}
            pageLength = {pageLength}
        />
    </>
}