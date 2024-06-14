//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useState } from 'react';
import { AlertDialog } from './AlertDialog';

export const PaginatedDataTable = ({ searchResults, page, totalNumOfPages, GetNewPage }) => {
    const [ clickRow, setClickRow ] = useState(-1);
    const [ clickCol, setClickCol ] = useState(-1);  
    const [ editOpen, setEditOpen ] = useState(false);
    const [ editStart, setEditStart ] = useState(-1);
    const [ editEnd, setEditEnd ] = useState(-1);
    const [ editText, setEditText ] = useState("");

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

    useEffect(() => {
        const cells = document.querySelectorAll(".p-datatable-wrapper td");
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                setClickRow(cell.closest('tr').rowIndex - 1);
                setClickCol(cell.cellIndex);
            });

            cell.addEventListener('mouseup', () =>
            {
                console.log(cell)
                const allText = cell.innerText;
                const selection = window.getSelection();
                const start_ = selection.anchorOffset;
                const end_ = selection.focusOffset;
                const start = Math.min([ start_, end_ ]);
                const end = Math.max([ start_, end_ ]);
                setEditStart(start);
                setEditEnd(end);
                setEditText(allText.substring(start, end));
                setEditOpen(true);
            })
        });
    }, [searchResults]);

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

        <AlertDialog
            open={editOpen}
            setOpen={setEditOpen}
            titleText={"Edit Dataset Content"}
            bodyText={""}
            action={() => {}}
        />
    </>
}