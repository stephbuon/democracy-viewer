import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import {Box, TextField, Typography, InputAdornment, Divider, Snackbar, Alert, Link} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Stack } from '@mui/system';

//Other Imports
import { GetSubsetOfDataByPage } from '../../api';
import { PaginatedDataTable } from '../common/tables';
import Highlighter from "react-highlight-words";

const pageLength = 10;
const dataFetchSize = 1000; // Amount of data to fetch for client-side search

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allData, setAllData] = useState([]); // Store all fetched data
    const [filteredData, setFilteredData] = useState([]); // Store filtered results
    const [totalNumResults, setTotalNumResults] = useState(-1);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({});
    const [columns, setColumns] = useState([]);
    const [selected, setSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    const highlight = (results, terms) => {
        if (!terms || terms.length === 0) {
            // No search terms, return results as-is but convert to strings
            return results.map(row => {
                const processedRow = { ...row };
                Object.keys(processedRow).forEach(col => {
                    if (col !== "record_id") {
                        if (!processedRow[col]) {
                            processedRow[col] = "";
                        } else if (typeof processedRow[col] !== "string") {
                            processedRow[col] = processedRow[col].toString();
                        }
                    }
                });
                return processedRow;
            });
        }

        const highlightedResults = results.map(row => {
            const highlightedRow = { ...row };
            Object.keys(highlightedRow).forEach(col => {
                if (col !== "record_id") {
                    if (!highlightedRow[col]) {
                        highlightedRow[col] = "";
                    } else if (typeof highlightedRow[col] !== "string") {
                        highlightedRow[col] = highlightedRow[col].toString();
                    }
                    highlightedRow[col] = (
                        <Highlighter
                            searchWords={terms}
                            textToHighlight={highlightedRow[col]}
                            highlightClassName="highlight"
                            autoEscape={true}
                        />
                    )
                }
            });
            return highlightedRow;
        });
        return highlightedResults;
    }

    // Function to fetch all data for client-side search
    const fetchAllData = async () => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (!demoV || !demoV.dataset) return;

        setLoading(true);
        try {
            // Fetch a larger subset of data for client-side search
            const emptyQuery = {}; // Empty query to get all data
            const res = await GetSubsetOfDataByPage(demoV.dataset.table_name, emptyQuery, 1, dataFetchSize);
            
            if (res && res.data) {
                setAllData(res.data);
                setColumns(res.columns);
                
                // If there's no search term, show all data
                if (!searchTerm.trim()) {
                    const paginatedResults = res.data.slice(0, pageLength);
                    setSearchResults(highlight(paginatedResults, []));
                    setFilteredData(res.data);
                    setTotalNumResults(res.data.length);
                } else {
                    // Apply current search to the new data
                    performClientSideSearch(res.data, searchTerm);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setSearchResults([]);
            setAllData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to perform client-side search through all columns
    const performClientSideSearch = (dataToSearch, term) => {
        const searchWords = term.trim() ? term.trim().split(/\s+/).filter(word => word.length > 0) : [];
        
        if (searchWords.length === 0) {
            // No search term, show all data
            const paginatedResults = dataToSearch.slice(0, pageLength);
            setSearchResults(highlight(paginatedResults, []));
            setFilteredData(dataToSearch);
            setTotalNumResults(dataToSearch.length);
            setPage(1);
            return;
        }

        const matchingRows = [];

        dataToSearch.forEach(row => {
            let rowMatches = false;
            
            // Check each column for matches
            Object.keys(row).forEach(columnName => {
                if (columnName === 'record_id' || rowMatches) return; // Skip ID column, and if already matched
                
                const cellValue = row[columnName];
                if (!cellValue) return;
                
                const text = cellValue.toString().toLowerCase();
                
                // Check if any search word is found in this cell
                const hasMatch = searchWords.some(searchWord => {
                    return text.includes(searchWord.toLowerCase());
                });
                
                if (hasMatch) {
                    rowMatches = true;
                }
            });
            
            if (rowMatches) {
                matchingRows.push(row);
            }
        });

        // Update results with pagination and highlighting
        const paginatedResults = matchingRows.slice(0, pageLength);
        setSearchResults(highlight(paginatedResults, searchWords));
        setFilteredData(matchingRows);
        setTotalNumResults(matchingRows.length);
        setPage(1);
    };

    const fetchSubset = () => {
        let _query = {
            simpleSearch: searchTerm
        };

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.downloadData = _query;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV));

        // Use client-side search instead of API search
        performClientSideSearch(allData, searchTerm);
        setQuery(_query);
    }

    const GetNewPage = async (selectedPage) => {
        setLoading(true);
        try {
            // Use client-side pagination instead of API pagination
            const startIndex = (selectedPage - 1) * pageLength;
            const endIndex = startIndex + pageLength;
            const pageResults = filteredData.slice(startIndex, endIndex);
            
            // Get current search terms for highlighting
            const searchWords = searchTerm.trim() ? searchTerm.trim().split(/\s+/).filter(word => word.length > 0) : [];
            
            setPage(selectedPage);
            setSearchResults(highlight(pageResults, searchWords));
        } catch (error) {
            console.error('Error getting new page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            fetchSubset();
        }
    };

    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    const handleConcordanceViewClick = () => {
        navigate('/concordanceview');
        console.log('Navigating to concordance view...');
    };

    // Add debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (selected && allData.length > 0) {
                performClientSideSearch(allData, searchTerm);
            }
        }, 500); // 500ms delay after the user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, allData, selected]);

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (!demoV || !demoV.dataset) {
            navigate('/datasets/search');
            props.setNavigated(true);
            setSnackBarOpen(true);
        } else {
            setSelected(true);
        }
    }, []);

    // Fetch all data when component is selected
    useEffect(() => {
        if (selected) {
            fetchAllData();
        }
    }, [selected]);

    if (!selected) {
        return <></>;
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8f9fa',
            py: 13,
            position: 'relative'
        }}>
            {/* Concordance View Switch Button */}
            <Box sx={{ 
                position: 'absolute',
                top: 80,
                left: 16,
                zIndex: 1000
            }}>
                <Link
                    component="button"
                    onClick={handleConcordanceViewClick}
                    sx={{
                        fontSize: '0.875rem',
                        color: '#1976d2',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    Switch to Concordance View
                </Link>
            </Box>

            {/* Error Snackbar */}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
            >
                <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
                    You must choose a dataset first
                </Alert>
            </Snackbar>
            
            {/* Title Section */}
            <Box sx={{ 
                width: '100%', 
                textAlign: 'center', 
                mb: 4
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 1
                }}>
                    <Typography 
                        component="h1" 
                        variant="h3" 
                        sx={{ 
                            fontSize: '2.5rem', 
                            color: 'black',
                            fontWeight: 500
                        }}
                    >
                     {props.dataset.title}
                    </Typography>
                </Box>
            </Box>
            
            <Stack spacing={0}>
                {/* Search Section */}
                <Box sx={{ 
                    p: 4, 
                    backgroundColor: '#f8f9fa'
                }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3
                        }}
                    >
                        <TextField
                            sx={{ 
                                width: { xs: "100%", sm: "500px" },
                                backgroundColor: 'white'
                            }}
                            id="searchTerm"
                            placeholder="Search dataset content..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={event => { setSearchTerm(event.target.value) }}
                            onKeyDown={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>
                
                <Divider />
                
                {/* Results Summary */}
                <Box sx={{ 
                    px: 4, 
                    py: 2, 
                    backgroundColor: '#fafafa',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading results...' : 
                         totalNumResults >= 0 ? `Showing ${Math.min(searchResults.length, pageLength)} of ${totalNumResults} results` : 'Ready to search'}
                    </Typography>
                </Box>
                
                {/* Results Section */}
                <Box sx={{ p: 3 }}>
                    <PaginatedDataTable
                        searchResults={searchResults}
                        page={page}
                        GetNewPage={GetNewPage}
                        table_name={props.dataset.table_name}
                        downloadType="subset"
                        totalNumResults={totalNumResults}
                        pageLength={pageLength}
                        columns={columns}
                        extLoading={loading}
                    />
                </Box>
            </Stack>
        </Box>
    );
}