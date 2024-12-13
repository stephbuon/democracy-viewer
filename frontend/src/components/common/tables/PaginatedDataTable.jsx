//MUI Imports
import { Box, Button, TextField, Tooltip, Checkbox, FormControlLabel, Alert, Snackbar } from '@mui/material';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

import { useEffect, useState } from 'react';
import { AlertDialog } from '../AlertDialog';
import { addSuggestion } from '../../api/api';

export const PaginatedDataTable = ({ searchResults, pageLength, GetNewPage, downloadType, table_name, totalNumResults, columns, extLoading }) => {
    const [clickRow, setClickRow] = useState(-1);
    const [clickCol, setClickCol] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editStart, setEditStart] = useState(-1);
    const [editEnd, setEditEnd] = useState(-1);
    const [editText, setEditText] = useState("");
    const [newText, setNewText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [suggest, setSuggest] = useState(false);
    const [first, setFirst] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    const [alert, setAlert] = useState(0);
    const [loading, setLoading] = useState(true);

    const onPage = async(event) => {
        setLoading(true);
        await GetNewPage(event.page + 1);
        setFirst(pageLength * event.page);
        setLoading(false);
    }

    const getCellClick = (event) => {
        const cell = event.target;
        const row = cell.closest("tr").rowIndex - 1;
        setClickRow(searchResults[row].record_id);
        const col = cell.closest("td").cellIndex;
        setClickCol(columns[col]);
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
        addSuggestion({
            record_id: clickRow, col: clickCol,
            start: editStart, end: editEnd,
            new_text: newText, old_text: editText,
            table_name
        }).then(x => setAlert(1));
    }

    useEffect(() => {
        if (extLoading === true || (searchResults.length === 0 && totalNumResults !== 0)) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [searchResults, totalNumResults, extLoading]);

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

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (token && token.user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [])

    return <>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={alert !== 0}
            autoHideDuration={6000}
        >
            <Alert onClose={() => setAlert(0)} severity="success" sx={{ width: '100%' }}>
                Your suggestion has been submitted to the owner of this dataset for review.
                <br />
                You will be sent an email when it has been confirmed.
            </Alert>
        </Snackbar>

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
            > 
                {
                    totalNumResults === -1 &&
                    <>Waiting for results</>
                }

                {
                    totalNumResults !== -1 &&
                    <>{totalNumResults} results returned</>
                }
            </Box>
            <Button
                variant="contained"
                color="primary"
                sx={{

                    color: 'white',
                    marginLeft: '2em',
                    marginTop: '50px',
                    background: 'black'
                }}
                onClick={() => window.open(`${window.location.origin}/download/full`)}
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
                onClick={() => window.open(`${window.location.origin}/download/${downloadType}`)}
            >Download these {totalNumResults} results</Button>
        </Box>

        {(loading === true) && (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: "50px"
                }}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh"
                }}>
                    <div class="spinner-border" style={{
                        width: "5rem",
                        height: "5rem"
                    }}
                        role="status">
                        <span class="sr-only"></span>
                    </div>
                </div>
            </Box>
        )}
        {
            loggedIn === true &&
            <Tooltip arrow title="Highlight text to suggest changes to the dataset">
                <FormControlLabel
                    control={<Checkbox defaultChecked={suggest} />}
                    label="Suggest Changes"
                    onChange={event => setSuggest(!suggest)}
                    style={{ marginLeft: "100px" }}
                />
            </Tooltip>
        }

        {
            loggedIn === false &&
            <Tooltip arrow title="You must be logged in to suggest changes">
                <FormControlLabel
                    control={<Checkbox defaultChecked={false} disabled />}
                    label="Suggest Changes"
                    style={{ marginLeft: "100px" }}
                />
            </Tooltip>
        }

        {(loading === false) && (
            <DataTable
                value={searchResults}
                scrollable
                scrollHeight="80vh"
                showGridlines
                stripedRows
                style={{ marginLeft: "100px" }}
                lazy
                paginator
                rows={pageLength}
                totalRecords={totalNumResults}
                onPage={onPage}
                first={first}
                emptyMessage="No Records Found"
            >
                {
                    columns.map((col, i) => {
                        if (col === "record_id") {
                            return <></>
                        }
                        else {
                            return <Column
                                key={i}
                                field={col}
                                header={col}
                                style={{ minWidth: `${col.length * 15}px` }}
                                body={(rowData) => (
                                    <div style={{
                                        height: '125px',
                                        overflowY: 'auto',
                                        verticalAlign: 'top',
                                        paddingTop: '5px'
                                    }}>
                                        {rowData[col.toLowerCase()]}
                                    </div>
                                )}
                                headerStyle={{ verticalAlign: 'top' }}
                            />

                        }
                    })
                }
            </DataTable>
        )}

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