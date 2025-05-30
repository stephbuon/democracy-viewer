//MUI Imports
import { 
    Box, 
    Button, 
    TextField, 
    Tooltip, 
    Checkbox, 
    FormControlLabel, 
    Alert, 
    Snackbar,
    Typography,
    Paper,
    CircularProgress,
    Stack,
    Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

import { useEffect, useState } from 'react';
import { AlertDialog } from '../AlertDialog';
import { addSuggestion } from '../../../api';

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

    // Enhanced CSS for modern table styling
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .p-datatable {
                border-radius: 12px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                border: 1px solid #e5e7eb !important;
            }
            
            .p-datatable .p-datatable-thead > tr > th {
                position: relative;
                background: #f8f9fa !important;
                border-right: 1px solid #e9ecef !important;
                border-bottom: 2px solid #e9ecef !important;
                font-weight: 600 !important;
                color: #374151 !important;
                padding: 16px 12px !important;
                transition: all 0.2s ease;
            }
            
            .p-datatable .p-datatable-thead > tr > th:hover {
                background: #e9ecef !important;
                border-right-color: #1976d2 !important;
            }
            
            .p-datatable .p-datatable-tbody > tr > td {
                border-bottom: 1px solid #f3f4f6 !important;
                border-right: 1px solid #f3f4f6 !important;
                padding: 12px !important;
            }
            
            .p-datatable .p-datatable-tbody > tr:hover {
                background: #f8f9fa !important;
            }
            
            .p-datatable .p-datatable-thead > tr > th .p-column-resizer {
                position: absolute;
                top: 0;
                right: -2px;
                width: 4px;
                height: 100%;
                cursor: col-resize;
                background: transparent;
                border-right: 2px solid transparent;
                transition: all 0.2s ease;
            }
            
            .p-datatable .p-datatable-thead > tr > th .p-column-resizer:hover {
                background: rgba(25, 118, 210, 0.1);
                border-right-color: #1976d2;
            }
            
            .p-datatable .p-datatable-thead > tr > th .p-column-resizer:active {
                background: rgba(25, 118, 210, 0.2);
                border-right-color: #1565c0;
            }
            
            .p-paginator {
                background: #f8f9fa !important;
                border-top: 1px solid #e9ecef !important;
                padding: 16px !important;
                border-bottom-left-radius: 12px !important;
                border-bottom-right-radius: 12px !important;
            }
            
            .p-paginator .p-paginator-pages .p-paginator-page {
                border-radius: 6px !important;
                margin: 0 2px !important;
                min-width: 36px !important;
                height: 36px !important;
            }
            
            .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
                background: #1976d2 !important;
                border-color: #1976d2 !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100vw',
            overflowX: 'hidden'
        }}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={alert !== 0}
                autoHideDuration={6000}
                onClose={() => setAlert(0)}
            >
                <Alert onClose={() => setAlert(0)} severity="success" sx={{ width: '100%' }}>
                    Your suggestion has been submitted to the owner of this dataset for review.
                    <br />
                    You will be sent an email when it has been confirmed.
                </Alert>
            </Snackbar>

            {/* Download Section - Centered and Responsive */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 2, sm: '20px' },
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        order: { xs: 1, sm: 0 }
                    }}
                > 
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        {totalNumResults === -1 ? 'Waiting for results' : `${totalNumResults} results returned`}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        color: 'white',
                        background: 'black',
                        order: { xs: 2, sm: 0 },
                        minWidth: { xs: '200px', sm: 'auto' },
                        '&:hover': {
                            background: '#333'
                        }
                    }}
                    onClick={() => window.open(`${window.location.origin}/download/full`)}
                >Download full dataset</Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        color: 'white',
                        background: 'black',
                        order: { xs: 3, sm: 0 },
                        minWidth: { xs: '200px', sm: 'auto' },
                        '&:hover': {
                            background: '#333'
                        }
                    }}
                    onClick={() => window.open(`${window.location.origin}/download/${downloadType}`)}
                >Download results</Button>
            </Box>

            {/* Loading State */}
            {(loading === true) && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: { xs: 3, sm: "50px" },
                        width: '100%'
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "60vh"
                    }}>
                        <div className="spinner-border" style={{
                            width: "5rem",
                            height: "5rem"
                        }}
                            role="status">
                            <span className="sr-only"></span>
                        </div>
                    </div>
                </Box>
            )}
            
            {/* Edit Dataset Checkbox - Centered */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                width: '100%',
                mt: 2,
                mb: 2
            }}>
                {
                    loggedIn === true &&
                    <Tooltip arrow title="Highlight text to edit the dataset">
                        <FormControlLabel
                            control={<Checkbox defaultChecked={suggest} />}
                            label="Edit Dataset"
                            onChange={event => setSuggest(!suggest)}
                        />
                    </Tooltip>
                }

                {
                    loggedIn === false &&
                    <Tooltip arrow title="You must be logged in to edit a dataset">
                        <FormControlLabel
                            control={<Checkbox defaultChecked={false} disabled />}
                            label="Edit Dataset"
                        />
                    </Tooltip>
                }
            </Box>

            {/* Data Table with Enhanced Styling - Responsive */}
            {(loading === false) && (
                <Box sx={{ 
                    width: '100%',
                    maxWidth: '95vw',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <DataTable
                        value={searchResults}
                        scrollable
                        scrollHeight="70vh"
                        showGridlines
                        stripedRows
                        style={{ 
                            width: '100%',
                            maxWidth: '100%'
                        }}
                        lazy
                        paginator
                        rows={pageLength}
                        totalRecords={totalNumResults}
                        onPage={onPage}
                        first={first}
                        emptyMessage="No Records Found"
                        resizableColumns
                        columnResizeMode="expand"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    >
                        {columns.map((col, i) => {
                            if (col === "record_id") {
                                return null;
                            }
                            return (
                                <Column
                                    key={i}
                                    field={col}
                                    header={col}
                                    style={{ 
                                        minWidth: `${Math.max(col.length * 12, 150)}px`,
                                        wordWrap: 'break-word'
                                    }}
                                    body={(rowData) => (
                                        <Box sx={{
                                            height: '120px',
                                            overflowY: 'auto',
                                            verticalAlign: 'top',
                                            pt: 0.5,
                                            whiteSpace: 'normal',
                                            wordWrap: 'break-word',
                                            lineHeight: 1.4,
                                            fontSize: '0.875rem',
                                            '&::-webkit-scrollbar': {
                                                width: '6px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: '#f1f1f1',
                                                borderRadius: '3px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: '#c1c1c1',
                                                borderRadius: '3px',
                                            },
                                            '&::-webkit-scrollbar-thumb:hover': {
                                                background: '#a1a1a1',
                                            },
                                        }}>
                                            {rowData[col.toLowerCase()]}
                                        </Box>
                                    )}
                                    headerStyle={{ 
                                        verticalAlign: 'top',
                                        textAlign: 'center'
                                    }}
                                    resizeable
                                />
                            );
                        })}
                    </DataTable>
                </Box>
            )}

            <AlertDialog
                open={editOpen}
                setOpen={setEditOpen}
                titleText={"Edit Dataset Text"}
                bodyText={
                    <>
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
                    </>
                }
                action={() => submitUpdate()}
                disabled={disabled}
            />
        </Box>
    );
}