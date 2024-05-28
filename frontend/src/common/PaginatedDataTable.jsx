//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import "primereact/resources/themes/lara-light-indigo/theme.css";

export const PaginatedDataTable = ({ searchResults, page, totalNumOfPages, GetNewPage }) => {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        let startPage, endPage;

        if (totalNumOfPages <= 10) {
            startPage = 1;
            endPage = totalNumOfPages;
        } else {
            if (page <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (page + 4 >= totalNumOfPages) {
                startPage = totalNumOfPages - 9;
                endPage = totalNumOfPages;
            } else {
                startPage = page - 5;
                endPage = page + 4;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers.map(num => (
            <Button
                key={num}
                variant={page === num ? "contained" : "outlined"}
                onClick={() => GetNewPage(num)}
                disabled={page === num}
            >
                {num}
            </Button>
        ));
    };

    if (!searchResults || searchResults.length === 0) {
        return <></>
    }

    return <>
        <DataTable value={searchResults} scrollable scrollHeight="750px" showGridlines stripedRows style = {{ marginLeft: "100px" }}>
            {
                Object.keys(searchResults[0]).map((col, i) => (
                    <Column 
                        key = {col} 
                        field = {col} 
                        header = {col}
                        style = {{ minWidth: `${ col.length * 15 }px` }}
                    />
                ))
            }
        </DataTable>

        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            {renderPageNumbers()}
        </Box>
    </>
}