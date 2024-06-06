// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import Parser from 'html-react-parser';
import { PaginatedDataTable } from "../common/PaginatedDataTable.jsx";

export const Zoom = () => {
    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [page, setPage] = useState(1);
    const [graphData, setGraphData] = useState(undefined);
    const [totalPages, setTotalPages] = useState(1);
    const max_page_size = 50;

    const getPage = (currPage) => {
        const ids = graphData.ids.slice(max_page_size * (currPage - 1), max_page_size * currPage);

        getRecordsByIds(graphData.dataset, ids).then(async (res) => {
            if (!res) {
                console.log("Zoom error, no results found");
            }
            else {
                setSearchResults(res)
            }
        })
    }

    const nextPage = () => {
        getPage(page + 1);
        setPage(page + 1);
    }

    // UseEffect: Gets record for all data.ids and populates searchResults
    useEffect(() => {
        setGraphData(JSON.parse(localStorage.getItem('selected')));
    }, []);

    useEffect(() => {
        if (graphData) {
            getPage(page);
            setTotalPages(Math.ceil(graphData.ids.length / max_page_size));
        }
    }, [graphData]);

    // Funcion definitions
    const highlight = (result) => { // Cleans result and highlights all instances of data.word
        let output = "";
        let text = result.text.replaceAll("\"", '')
        let lowerText = text.toLowerCase()
        let i = lowerText.indexOf(graphData.word)

        while(i != -1){
            output += text.substring(0, i)
            output += "<mark>" + graphData.word + "</mark>";
            
            text = text.substring(i + graphData.word.length)
            lowerText = lowerText.substring(i + graphData.word.length)
            i = lowerText.indexOf(graphData.word)
        }
        return output + text;
      }

    if (!graphData) {
        return <>Loading...</>
    }

    return (<>
        <div>
            <div className="container text-center p-5">
                {/* Top labels */}
                <div className="row pb-2">
                    <div className="col"></div>
                    <div className="col">
                        <b>x</b>
                    </div>
                    <div className="col">
                        <b>y</b>
                    </div>
                </div>

                {/* Word data */}
                <div className="row">
                    <div className="col">
                        <b>Selected datapoint</b>
                    </div>
                    <div className="col">
                        {graphData.x}
                    </div>
                    <div className="col">
                        {graphData.y}
                    </div>
                </div>

                <PaginatedDataTable
                    searchResults = {searchResults}
                    page = {page}
                    totalNumOfPages = {totalPages}
                    GetNewPage = {nextPage}
                />
            </div>
        </div>
        </>
    );
}