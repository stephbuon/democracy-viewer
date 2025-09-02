//MUI Imports
import { Box, Button, TextField, Tooltip, Checkbox, FormControlLabel, Alert, Snackbar, Typography, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import { useEffect, useState } from 'react';
import { AlertDialog } from '../AlertDialog';
import { addSuggestion } from '../../../api';

export const PaginatedDataTable = ({ searchResults, pageLength, GetNewPage, downloadType, table_name, totalNumResults, columns, extLoading, globalSearchTerm = "" }) => {
    const [clickRow, setClickRow] = useState(-1);
    const [clickCol, setClickCol] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editStart, setEditStart] = useState(-1);
    const [editEnd, setEditEnd] = useState(-1);
    const [editText, setEditText] = useState("");
    const [newText, setNewText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [suggest, setSuggest] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    const [alert, setAlert] = useState(0);
    const [loading, setLoading] = useState(true);
    const [columnFilters, setColumnFilters] = useState({});
    const [debouncedColumnFilters, setDebouncedColumnFilters] = useState({});
    const [filteredResults, setFilteredResults] = useState([]);
    const [selectedPageSize, setSelectedPageSize] = useState(10);

    // Debounce column filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedColumnFilters(columnFilters);
        }, 300);

        return () => clearTimeout(timer);
    }, [columnFilters]);

    // Get global search terms for yellow highlighting
    const getGlobalSearchTerms = () => {
        return globalSearchTerm.trim() ? 
            [globalSearchTerm.trim()] : [];
    };

    // Get column-specific search terms for a specific column
    const getColumnSearchTerms = (columnName) => {
        const term = debouncedColumnFilters[columnName];
        return term && term.trim() !== '' ? [term.trim()] : [];
    };

    // Enhanced highlighting function with column-specific highlighting
const highlightText = (text, globalTerms, columnTerms, currentColumn) => {
    if (!text) return text;
    const textStr = text.toString();
    
    // Get terms for the current column only
    const currentColumnTerms = columnTerms[currentColumn] || [];
    
    const allTerms = [
        ...globalTerms.map(term => ({ term, type: 'global' })),
        ...currentColumnTerms.map(term => ({ term, type: 'column' }))
    ];
    
    // Sort by length (longest first) to handle overlapping matches better
    allTerms.sort((a, b) => b.term.length - a.term.length);

    if (allTerms.length === 0) return text;

    const matches = [];
    allTerms.forEach(({ term, type }) => {
        if (!term || term.trim() === '') return;
        
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let match;
        while ((match = regex.exec(textStr)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                type
            });
        }
    });

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches, prioritizing column matches over global matches
    const cleanMatches = [];
    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const overlapIndex = cleanMatches.findIndex(existing =>
            current.start < existing.end && current.end > existing.start
        );
        
        if (overlapIndex === -1) {
            cleanMatches.push(current);
        } else {
            // Replace if current is column type and existing is global type
            if (current.type === 'column' && cleanMatches[overlapIndex].type === 'global') {
                cleanMatches[overlapIndex] = current;
            }
        }
    }

    // Sort final matches by position
    cleanMatches.sort((a, b) => a.start - b.start);

    const parts = [];
    let lastEnd = 0;
    
    cleanMatches.forEach((match, index) => {
        // Add text before match
        if (match.start > lastEnd) {
            parts.push(textStr.slice(lastEnd, match.start));
        }
        
        // Add highlighted match
        parts.push(
            <span key={index} style={{
                backgroundColor: match.type === 'global' ? '#fff3cd' : '#e3f2fd',
                color: match.type === 'global' ? '#856404' : '#1976d2',
                fontWeight: 'bold',
                padding: '2px 4px',
                borderRadius: '3px'
            }}>
                {match.text}
            </span>
        );
        
        lastEnd = match.end;
    });
    
    // Add remaining text
    if (lastEnd < textStr.length) {
        parts.push(textStr.slice(lastEnd));
    }
    
    return parts.length > 0 ? <span>{parts}</span> : text;
};

    // Apply global search filter first
    const applyGlobalSearch = (data) => {
        if (!data || data.length === 0) return [];
        
        const globalTerms = getGlobalSearchTerms();
        if (globalTerms.length === 0) return data;
        
        return data.filter(row => {
            return columns.some(col => {
                if (col === "record_id") return false;
                const cellValue = getCellValue(row, col);
                if (!cellValue) return false;
                
                const cellText = cellValue.toString().toLowerCase();
                return globalTerms.some(term => 
                    cellText.includes(term.toLowerCase())
                );
            });
        });
    };

    // Apply column-specific filters
    const applyColumnFilters = (data) => {
        if (!data || data.length === 0) return [];
        
        let filtered = [...data];
        
        Object.entries(debouncedColumnFilters).forEach(([columnName, filterValue]) => {
            if (filterValue && filterValue.trim() !== '') {
                const searchTerm = filterValue.trim().toLowerCase();
                filtered = filtered.filter(row => {
                    const cellValue = getCellValue(row, columnName);
                    return cellValue && 
                        cellValue.toString().toLowerCase().includes(searchTerm);
                });
            }
        });

        return filtered;
    };

    // Get cell value handling different field name variations
    const getCellValue = (row, columnName) => {
        const possibleFieldNames = [
            columnName,
            columnName.toLowerCase(),
            columnName.toUpperCase(),
            columnName.charAt(0).toLowerCase() + columnName.slice(1),
            columnName.charAt(0).toUpperCase() + columnName.slice(1)
        ];
        
        for (const fieldName of possibleFieldNames) {
            if (row.hasOwnProperty(fieldName)) {
                return row[fieldName];
            }
        }
        
        const matchingKey = Object.keys(row).find(key => 
            key.toLowerCase() === columnName.toLowerCase()
        );
        return matchingKey ? row[matchingKey] : null;
    };

    // Handle page changes from DataTable
    const onPage = (event) => {
        setCurrentPage(event.page);
    };

    // Handle column filter changes
    const handleColumnFilterChange = (columnName, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [columnName]: value
        }));
        setCurrentPage(0);
    };

    // Clear individual column filter
    const clearColumnFilter = (columnName) => {
        setColumnFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[columnName];
            return newFilters;
        });
        setCurrentPage(0);
    };

    // Handle page size change
    const handlePageSizeChange = (event) => {
        setSelectedPageSize(event.target.value);
        setCurrentPage(0);
    };

    // Update filtered results
    useEffect(() => {
        if (!searchResults || searchResults.length === 0) {
            setFilteredResults([]);
            return;
        }

        const globalFiltered = applyGlobalSearch(searchResults);
        const columnFiltered = applyColumnFilters(globalFiltered);
        setFilteredResults(columnFiltered);
        setCurrentPage(0);
    }, [searchResults, globalSearchTerm, debouncedColumnFilters]);

    // Reset page when global search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [globalSearchTerm]);

    // Cell click and selection handlers
    const getCellClick = (event) => {
        const cell = event.target;
        const row = cell.closest("tr").rowIndex - 1;
        if (row >= 0) {
            const actualRowIndex = currentPage * selectedPageSize + row;
            if (actualRowIndex < filteredResults.length) {
                setClickRow(filteredResults[actualRowIndex].record_id);
                const col = cell.closest("td").cellIndex;
                setClickCol(columns[col]);
            }
        }
    };

    // Updated function to get all column search terms
    const getAllColumnSearchTerms = () => {
        const allColumnTerms = {};
        Object.entries(columnFilters).forEach(([columnName, filterValue]) => {
            if (filterValue && filterValue.trim() !== '') {
                allColumnTerms[columnName] = [filterValue.trim()];
            }
        });
        return allColumnTerms;
    };

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
    };

    const submitUpdate = () => {
        addSuggestion({
            record_id: clickRow, col: clickCol,
            start: editStart, end: editEnd,
            new_text: newText, old_text: editText,
            table_name
        }).then(x => setAlert(1));
    };

    // Header template for columns with search (improved from first file)
    const getColumnHeader = (columnName) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', minWidth: '120px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center' }}>{columnName}</Typography>
            <TextField
                size="small"
                placeholder={`Search ${columnName}...`}
                value={columnFilters[columnName] || ''}
                onChange={(e) => handleColumnFilterChange(columnName, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                    '& .MuiInputBase-root': { 
                        height: '28px', 
                        fontSize: '0.75rem', 
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: 'white' }
                    },
                    '& .MuiInputBase-input': { padding: '4px 8px' }
                }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: '14px', color: '#666' }} /></InputAdornment>,
                    endAdornment: columnFilters[columnName] && (
                        <InputAdornment position="end">
                            <ClearIcon
                                sx={{ fontSize: '14px', color: '#666', cursor: 'pointer', '&:hover': { color: '#333' } }}
                                onClick={(e) => { e.stopPropagation(); clearColumnFilter(columnName); }}
                            />
                        </InputAdornment>
                    )
                }}
            />
        </Box>
    );

    // Loading state management
    useEffect(() => {
        if (extLoading === true || (searchResults.length === 0 && totalNumResults !== 0)) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [searchResults, totalNumResults, extLoading]);

    // Event listeners for cell editing - Fixed to run after DataTable updates
    useEffect(() => {
        // Use setTimeout to ensure DOM is updated after DataTable renders
        const timeoutId = setTimeout(() => {
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
        }, 100); // Small delay to ensure DOM is ready

        return () => {
            clearTimeout(timeoutId);
            const cells = document.querySelectorAll(".p-datatable-wrapper td");
            cells.forEach(cell => {
                cell.removeEventListener('click', getCellClick);
                cell.removeEventListener('mouseup', getSelection);
            });
        };
    }, [filteredResults, suggest, currentPage]);

    // Edit validation
    useEffect(() => {
        if (newText === editText) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [newText]);

    // Authentication check
    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (token && token.user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, []);

    // Enhanced CSS for modern table styling with dual highlighting
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
                padding: 12px 8px !important;
                transition: all 0.2s ease;
                vertical-align: top !important;
                min-height: 80px !important;
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

            .global-highlight {
                background-color: #fff3cd !important;
                color: #856404 !important;
                font-weight: bold !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
            }

            .column-highlight {
                background-color: #e3f2fd !important;
                color: #1976d2 !important;
                font-weight: bold !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const hasGlobalSearch = globalSearchTerm.trim().length > 0;
    const hasColumnFilters = Object.keys(debouncedColumnFilters).some(key => debouncedColumnFilters[key]?.trim());
    const hasActiveFilters = hasGlobalSearch || hasColumnFilters;
    
    const displayCount = hasActiveFilters ? filteredResults.length : totalNumResults;

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

            <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1200px',
                mb: 3,
                mt: 2
            }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Results per page</InputLabel>
                    <Select
                        value={selectedPageSize}
                        label="Results per page"
                        onChange={handlePageSizeChange}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                    </Select>
                </FormControl>

                <Box>
                    {loggedIn ? (
                        <Tooltip arrow title="Highlight text to edit the dataset">
                            <FormControlLabel
                                control={<Checkbox checked={suggest} />}
                                label="Edit Dataset"
                                onChange={() => setSuggest(!suggest)}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip arrow title="You must be logged in to edit a dataset">
                            <FormControlLabel
                                control={<Checkbox checked={false} disabled />}
                                label="Edit Dataset"
                            />
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 2, sm: '20px' },
                    width: '100%',
                    maxWidth: '1200px',
                    mb: 2
                }}>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', order: { xs: 1, sm: 0 } }}>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        {totalNumResults === -1 ? 'Waiting for results' : 
                         hasActiveFilters ? 
                         `${displayCount} filtered results (${totalNumResults} total)` :
                         `${displayCount} results returned`}
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
                        '&:hover': { background: '#333' }
                    }}
                    onClick={() => window.open(`${window.location.origin}/download/full`)}
                >
                    Download full dataset
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        color: 'white',
                        background: 'black',
                        order: { xs: 3, sm: 0 },
                        minWidth: { xs: '200px', sm: 'auto' },
                        '&:hover': { background: '#333' }
                    }}
                    onClick={() => window.open(`${window.location.origin}/download/${downloadType}`)}
                >
                    Download results
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 3, sm: "50px" }, width: '100%' }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                        <div className="spinner-border" style={{ width: "5rem", height: "5rem" }} role="status">
                            <span className="sr-only"></span>
                        </div>
                    </div>
                </Box>
            )}

            {!loading && (
                <Box sx={{ 
                    width: '100%',
                    maxWidth: '95vw',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <DataTable
                        value={filteredResults}
                        scrollable
                        showGridlines
                        stripedRows
                        style={{ width: '100%', maxWidth: '100%' }}
                        lazy={false}
                        paginator={true}
                        rows={selectedPageSize}
                        totalRecords={filteredResults.length}
                        onPage={onPage}
                        first={currentPage * selectedPageSize}
                        emptyMessage="No Records Found"
                        resizableColumns
                        columnResizeMode="expand"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    >
                        {columns.map((col, i) => {
                            if (col === "record_id") return null;
                            
                            return (
                                <Column
                                    key={i}
                                    field={col}
                                    header={getColumnHeader(col)}
                                    style={{ 
                                        minWidth: `${Math.max(col.length * 12, 150)}px`,
                                        wordWrap: 'break-word'
                                    }}
                                    body={(rowData) => {
                                        const cellValue = getCellValue(rowData, col);
                                        const globalTerms = getGlobalSearchTerms();
                                        const allColumnTerms = getAllColumnSearchTerms();
                                        
                                        return (
                                            <Box sx={{
                                                minHeight: '60px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                verticalAlign: 'top',
                                                pt: 0.5,
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word',
                                                lineHeight: 1.4,
                                                fontSize: '0.875rem',
                                                '&::-webkit-scrollbar': { width: '6px' },
                                                '&::-webkit-scrollbar-track': { 
                                                    background: '#f1f1f1', 
                                                    borderRadius: '3px' 
                                                },
                                                '&::-webkit-scrollbar-thumb': { 
                                                    background: '#c1c1c1', 
                                                    borderRadius: '3px' 
                                                },
                                                '&::-webkit-scrollbar-thumb:hover': { 
                                                    background: '#a1a1a1' 
                                                }
                                            }}>
                                                {highlightText(cellValue, globalTerms, allColumnTerms, col)}
                                            </Box>
                                        );
                                    }}
                                    headerStyle={{ 
                                        verticalAlign: 'top',
                                        textAlign: 'center',
                                        padding: '12px 8px'
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
};