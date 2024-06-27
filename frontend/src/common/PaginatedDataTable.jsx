//MUI Imports
import { Box, Button, TextField, Tooltip, Checkbox, FormControlLabel } from '@mui/material';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

import { useEffect, useState } from 'react';
import { AlertDialog } from './AlertDialog';
import { DownloadSubset } from '../apiFolder/SubsetSearchAPI';
import { updateText } from '../api/api';

export const PaginatedDataTable = ({ searchResults, page, pageLength, GetNewPage, downloadSubset, table_name, totalNumResults, columns }) => {
    const [clickRow, setClickRow] = useState(-1);
    const [clickCol, setClickCol] = useState(-1);
    const [editOpen, setEditOpen] = useState(false);
    const [editStart, setEditStart] = useState(-1);
    const [editEnd, setEditEnd] = useState(-1);
    const [editText, setEditText] = useState("");
    const [newText, setNewText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [suggest, setSuggest] = useState(false);

    const onPage = (event) => {
        GetNewPage(event.page + 1);
    }

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
    }, [newText]);

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
            > {totalNumResults} results returned</Box>
            <Button
                variant="contained"
                color="primary"
                sx={{

                    color: 'white',
                    marginLeft: '2em',
                    marginTop: '50px',
                    background: 'black'
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
                    background: 'black'
                    
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
        <DataTable 
            value={searchResults} 
            scrollable 
            scrollHeight="750px" 
            showGridlines 
            stripedRows 
            style={{ marginLeft: "100px" }}
            lazy
            paginator
            rows={pageLength}
            totalRecords={totalNumResults}
            onPage={onPage}
        >
            {
                columns.map((col, i) => {
                    if (col === "__id__") {
                        return <></>
                    }
                    else {
                        return <Column
                            key={col}
                            field={col}
                            header={col}
                            style={{ minWidth: `${col.length * 15}px` }}
                            body={(rowData) => (
                                <div style={{ 
                                    maxHeight: '125px', 
                                    overflowY: 'auto', 
                                    verticalAlign: 'top', 
                                    paddingTop: '5px' 
                                }}>
                                    {rowData[col]}
                                </div>
                        )}
                            headerStyle={{verticalAlign: 'top'}}
                        />

                    }
                })
            }
        </DataTable>

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