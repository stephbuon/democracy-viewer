import "../../../styles/Loading.css";
import { GraphResult } from "./GraphResult";
import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { useState, useEffect } from 'react';
import "primereact/resources/themes/lara-light-indigo/theme.css";

export const GraphTable = ({ loadingResults, searchResults, setGraph, GetNewPage, editable, pageLength, totalNumResults, deleteCallback }) => {
    const [formattedResults, setFormattedResults] = useState([...Array(pageLength).keys()]);
    const [first, setFirst] = useState(0);

    const onPage = (event) => {
        GetNewPage(event.page + 1);
        setFirst(pageLength * event.page);
    }

    const ResultTemplate = (result) => {
        if (loadingResults) {
            return <div
                className = {`loadingData${ (result % 8) + 1 }`}
            >&nbsp;</div>
        } else if (typeof result === "object") {
            return <GraphResult
                result = {result} 
                setGraph={(x) => setGraph(x)} 
                editable={editable}
                deleteCallback={deleteCallback}
            />
        } else {
            return <>&nbsp;</>
        }
    }

    useEffect(() => {
        const searchResults_ = [ ...searchResults ];
        for (let i = searchResults.length; i < pageLength; i++) {
            searchResults_.push(i);
        }
        setFormattedResults(searchResults_);
    }, [searchResults]);

    useEffect(() => {
        if (loadingResults) {
            setFormattedResults([...Array(pageLength).keys()]);
        }
    }, [loadingResults])

    return <>
        <DataTable
            value={formattedResults} 
            scrollHeight="750px" 
            showGridlines 
            stripedRows 
            style={{
                color: 'rgb(0, 0, 0)',
                marginTop: '2rem',
                width: "100%"
            }}
            lazy
            paginator
            rows={pageLength}
            totalRecords={totalNumResults}
            onPage={onPage}
            first={first}
            emptyMessage="No Graphs Found"
        >
            <Column
                header="Results"
                body={ResultTemplate}
            />
        </DataTable>
    </>
} 