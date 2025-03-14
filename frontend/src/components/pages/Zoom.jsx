// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds, getTextCols, getZoomIds, getZoomRecords } from "../../api";
import { PaginatedDataTable } from "../common/tables/PaginatedDataTable.jsx";
import Highlighter from "react-highlight-words";
import { metricNames } from "./subcomponents/graphs/metrics.js";
import { useNavigate } from "react-router-dom";

const pageLength = 10;

export const Zoom = (props) => {
    const navigate = useNavigate();

    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [graphData, setGraphData] = useState(undefined);
    const [totalPages, setTotalPages] = useState(1);
    const [textCols, setTextCols] = useState([]);

    const highlightText = (records) => {
        if (textCols.length > 0) {
            records.map(row => {
                textCols.forEach(x => {
                    const col = x.toLowerCase();
                    row[col] = (
                        <Highlighter
                            searchWords={graphData.word_list}
                            textToHighlight={ row[col] }
                        />
                    )
                });
                return row;
            });

            setSearchResults(records);
        }
    }

    const getPage = async(page, retry = true) => {
        const params = {
            name: graphData.name,
            page,
            pageLength
        };
        getZoomRecords(graphData.dataset, params)
            .then(records => highlightText(records))
            .catch(err => {
                if (retry && err.response.data.message.includes("Zoom ids no longer loaded")) {
                    getZoomIds(graphData.dataset, {
                        group_name: graphData.group_name,
                        group_list: graphData.group_list,
                        word_list: graphData.word_list
                    }).then(x => getPage(page, false));
                } else {
                    throw new Error(err.response.data.message);
                }
            });
    }

    // UseEffect: Gets record for all data.ids and populates searchResults
    useEffect(() => {
        const graphData_ = JSON.parse(localStorage.getItem('selected'));
        const gs = JSON.parse(localStorage.getItem('graph-settings'));
        const dv = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (
            !graphData_ || !graphData_.dataset || 
            !gs || gs.table_name !== graphData_.dataset ||
            !dv || !dv.dataset || dv.dataset.table_name !== graphData_.dataset
        ) {
            localStorage.removeItem("selected");
            navigate('/graph')
            props.setNavigated(true);
        } else {
            setGraphData({ ...graphData_ });
            getTextCols(graphData_.dataset).then(x => setTextCols(x));
        }
    }, []);

    useEffect(() => {
        if (graphData && textCols.length > 0) {
            // Pagination
            getPage(1);
            setTotalPages(Math.ceil(graphData.count / pageLength));
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
                        {graphData.word_list.join(", ")}
                    </div>
                </div>

                
            </div>
        </div>
        <PaginatedDataTable
            searchResults = {searchResults}
            totalNumOfPages = {totalPages}
            GetNewPage = {getPage}
            table_name={graphData.dataset}
            downloadType="ids"
            totalNumResults={graphData.count}
            columns = {searchResults.length > 0 ? Object.keys(searchResults[0]) : []}
            pageLength = {pageLength}
        />
    </>
}