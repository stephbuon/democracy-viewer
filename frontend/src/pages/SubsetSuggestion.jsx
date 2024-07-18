// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import { PaginatedDataTable } from "../common/tables/PaginatedDataTable.jsx";
import Highlighter from "react-highlight-words";
import { DownloadIds } from "../apiFolder/SubsetSearchAPI.js";
import { useNavigate, useParams } from "react-router-dom";
import { getSuggestion } from "../api/api.js";

const pageLength = 10;

export const SubsetSuggestion = () => {
    const params = useParams();
    const navigate = useNavigate();

    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [suggestion, setSuggestion] = useState(undefined);

    // UseEffect: Gets record for all data.ids and populates searchResults
    useEffect(() => {
        if (params.id) {
            getSuggestion(params.id).then(x => setSuggestion(x)).catch(x => navigate("/"));
        } else {
            setSuggestion(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (suggestion) {
            getRecordsByIds(suggestion.table_name, [suggestion.record_id]).then(x => {
                const record = x[0];
                const col = Object.keys(record)[suggestion.col];
                const str = String(record[col]);
                const beforeHighlight = str.slice(0, suggestion.start);
                const highlight = str.slice(suggestion.start, suggestion.end);
                const afterHighlight = str.slice(suggestion.end);
                record[col] = <span>{ beforeHighlight }<mark>{ highlight }</mark>{ afterHighlight }</span>;
                setSearchResults([record]);
            });
        } else {
            setSearchResults([]);
        }
    }, [suggestion]);

    if (!suggestion) {
        return <>Loading...</>
    }

    return <>
        <div>
            <div className="container text-center p-5">
                {/* Top labels */}
                <div className="row pb-2">
                    <div className="col">
                        <b>Record Number</b>
                    </div>
                    <div className="col">
                        <b>Old Text</b>
                    </div>
                    <div className="col">
                        <b>New Text</b>
                    </div>
                </div>

                {/* Word data */}
                <div className="row">
                    <div className="col">
                        { suggestion.record_id + 1 }
                    </div>
                    <div className="col">
                        "{ suggestion.old_text }"
                    </div>
                    <div className="col">
                        "{ suggestion.new_text }"
                    </div>
                </div>

                
            </div>
        </div>
        <PaginatedDataTable
            searchResults = {searchResults}
            totalNumOfPages = {1}
            // GetNewPage = {getPage}
            table_name={suggestion.table_name}
            downloadSubset={() => DownloadIds(suggestion.table_name, [suggestion.record_id])}
            totalNumResults={1}
            columns = {searchResults.length > 0 ? Object.keys(searchResults[0]) : []}
            pageLength = {pageLength}
        />
    </>
}