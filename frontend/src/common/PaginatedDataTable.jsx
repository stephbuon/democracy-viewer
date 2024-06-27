//MUI Imports
import { Box, Button, TextField, Tooltip, Checkbox, FormControlLabel } from '@mui/material';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useEffect, useState } from 'react';
import { AlertDialog } from './AlertDialog';
import { DownloadSubset } from '../apiFolder/SubsetSearchAPI';
import { updateText } from '../api/api';

export const PaginatedDataTable = ({ searchResults, page, totalNumOfPages, GetNewPage, downloadSubset, table_name, totalNumResults }) => {
    const [clickRow, setClickRow] = useState(-1);
    const [clickCol, setClickCol] = useState(-1);
    const [editOpen, setEditOpen] = useState(false);
    const [editStart, setEditStart] = useState(-1);
    const [editEnd, setEditEnd] = useState(-1);
    const [editText, setEditText] = useState("");
    const [newText, setNewText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [suggest, setSuggest] = useState(false);

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

    const getCellClick = (event) => {
        const cell = event.target;
        const row = cell.closest("tr").rowIndex - 1;
        setClickRow(searchResults[row].__id__);
        setClickCol(cell.closest("td").cellIndex);
    }

    const getSelection = (event) => {
        const cell = event.target;
        const allText = cell.innerText;
        const selection = window.getSelection();
        const start_ = selection.anchorOffset;
        const end_ = selection.focusOffset;
        if (start_ - end_ !== 0) {
            const start = Math.min(start_, end_);
            const end = Math.max(start_, end_);
            const text = allText.substring(start, end);
            setEditStart(start);
            setEditEnd(end);
            setEditText(text);
            setNewText(text);
            setEditOpen(true);
        }
    }

    const submitUpdate = () => {
        updateText(table_name, {
            row: clickRow, col: clickCol,
            start: editStart, end: editEnd,
            text: newText
        }).then(x => GetNewPage(page));
    }

    useEffect(() => {
        const cells = document.querySelectorAll(".p-datatable-wrapper td");
        if (suggest) {
            cells.forEach(cell => {
                cell.addEventListener('click', getCellClick);
                cell.addEventListener('mouseup', getSelection);
            });
        } else {
            cells.forEach(cell => {
                cell.removeEventListener('click', getCellClick);
                cell.removeEventListener('mouseup', getSelection);
            });
        }

        return () => {
            cells.forEach(cell => {
                cell.removeEventListener('click', getCellClick);
                cell.removeEventListener('mouseup', getSelection);
            });
        }
    }, [searchResults, suggest]);

    useEffect(() => {
        if (newText === editText) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [newText])

    if (!searchResults || searchResults.length === 0) {
        return <></>
    }

    return <>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px'
            }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '50px',
                }}
            >{totalNumResults} results returned</Box>
            <Button
                variant="contained"
                color="primary"
                sx={{

                    color: 'white',
                    marginLeft: '2em',
                    marginTop: '50px',
                    '&:hover': {
                        background: 'rgb(200, 200, 200)'
                    }
                }}
                onClick={() => DownloadSubset(table_name, {})}
            >Download full dataset</Button>
            <Button
                variant="contained"
                color="primary"
                sx={{

                    color: 'white',
                    marginLeft: '2em',
                    marginTop: '50px',
                    '&:hover': {
                        background: 'rgb(200, 200, 200)'
                    }
                }}
                onClick={() => downloadSubset()}
            >Download these {totalNumResults} results</Button>
        </Box>

        <Tooltip arrow title="Highlight text to suggest changes to the dataset">
            <FormControlLabel
                control={<Checkbox defaultChecked={suggest} />}
                label="Suggest Changes"
                onChange={event => setSuggest(!suggest)}
                style={{ marginLeft: "100px" }}
            />
        </Tooltip>

        <DataTable value={searchResults} scrollable scrollHeight="750px" showGridlines stripedRows style={{ marginLeft: "100px" }}>
            {
                Object.keys(searchResults[0]).map((col, i) => {
                    if (col === "__id__") {
                        return <></>
                    } else {
                        return <Column
                            key={col}
                            field={col}
                            header={col}
                            style={{ minWidth: `${col.length * 15}px` }}
                        />
                    }
                })
            }
        </DataTable>

        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            {renderPageNumbers()}
        </Box>

        <AlertDialog
            open={editOpen}
            setOpen={setEditOpen}
            titleText={"Edit Dataset Text"}
            bodyText={<>
                <span>Suggest change to text "{editText}"</span>
                <TextField
                    id="text"
                    label="New Text"
                    variant="filled"
                    fullWidth
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    value={newText}
                    onChange={event => setNewText(event.target.value)}
                />
            </>}
            action={() => submitUpdate()}
            disabled={disabled}
        />
    </>
}