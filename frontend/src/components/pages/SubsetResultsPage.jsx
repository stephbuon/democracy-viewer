import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import {Box, TextField, Typography, InputAdornment, Divider, Snackbar, Alert} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Stack } from '@mui/system';

//Other Imports
import { GetSubsetOfDataByPage } from '../../api';
import { PaginatedDataTable } from '../common/tables';
import Highlighter from "react-highlight-words";

const pageLength = 10;

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumResults, setTotalNumResults] = useState(-1);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({});
    const [columns, setColumns] = useState([]);
    const [selected, setSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    const highlight = (results) => {
        const terms = searchTerm.split(" ");
        results.map(row => {
            Object.keys(row).forEach(col => {
                if (col !== "record_id") {
                    if (!row[col]) {
                        row[col] = "";
                    } else if (typeof row[col] !== "string") {
                        row[col] = row[col].toString();
                    }
                    row[col] = (
                        <Highlighter
                            searchWords={terms}
                            textToHighlight={row[col]}
                        />
                    )
                }
            });
            return row;
        });
        setSearchResults(results);
    }

    const fetchSubset = () => {
        let _query = {
            simpleSearch: searchTerm
        };

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.downloadData = _query;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV));

        setLoading(true);
        GetSubsetOfDataByPage(demoV.dataset.table_name, _query, 1, pageLength).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            } else {
                highlight(res.data);
                setTotalNumResults(res.count);
                setColumns(res.columns);
            }
            setPage(1);
        }).finally(() => setLoading(false));

        setQuery(_query);
    }

    const GetNewPage = async (selectedPage) => {
        setLoading(true);
        try {
            const res = await GetSubsetOfDataByPage(props.dataset.table_name, query, selectedPage, pageLength);
            if (res) {
                setPage(selectedPage);
                highlight(res.data);
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
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

    // Add debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 0 && selected) {
                fetchSubset();
            }
        }, 500); // 500ms delay after the user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (!demoV || !demoV.dataset) {
            navigate('/datasets/search');
            props.setNavigated(true);
            setSnackBarOpen(true);
        } else {
            fetchSubset();
            setSelected(true);
        }
    }, []);

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
                         totalNumResults >= 0 ? `Showing ${searchResults.length} of ${totalNumResults} results` : 'Ready to search'}
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
