import './Loading.css'
import { Result } from "./Result";
import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { useState, useEffect } from 'react';
import "primereact/resources/themes/lara-light-indigo/theme.css";

export const DatasetTable = ({ loadingResults, searchResults, setDataset, GetNewPage, editable, pageLength, totalNumResults }) => {
    const [formattedResults, setFormattedResults] = useState([...Array(pageLength).keys()]);

    const onPage = (event) => {
        GetNewPage(event.page + 1);
    }

    const ResultTemplate = (result) => {
        if (loadingResults) {
            return <div
                className = {`loadingData${ (result % 8) + 1 }`}
            >&nbsp;</div>
        } else if (typeof result === "object") {
            return <Result
                result = {result} 
                setDataset={(x) => setDataset(x)} 
                editable={editable}
            />
        } else {
            return <>...</>
        }
    }

    useEffect(() => {
        const searchResults_ = [ ...searchResults ];
        for (let i = searchResults.length; i < pageLength; i++) {
            searchResults_.push(i);
        }
        setFormattedResults(searchResults_);
    }, [searchResults]);

    return <>
        <DataTable
            value={formattedResults} 
            scrollHeight="750px" 
            showGridlines 
            stripedRows 
            style={{
                color: 'rgb(0, 0, 0)',
                marginTop: '2rem',
                width: "80%"
            }}
            lazy
            paginator
            rows={pageLength}
            totalRecords={totalNumResults}
            onPage={onPage}
        >
            <Column
                header="Results"
                body={ResultTemplate}
            />
        </DataTable>
    </>
} 