import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
//MUI Imports
import {Box, TextField, Typography, InputAdornment, Divider, Snackbar, Alert, Link} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Stack } from '@mui/system';
//Other Imports
import { GetSubsetOfDataByPage } from '../../api';
import { PaginatedDataTable } from '../common/tables';

const dataFetchSize = 1000; // Amount of data to fetch for client-side search

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumResults, setTotalNumResults] = useState(-1);
    const [columns, setColumns] = useState([]);
    const [selected, setSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term to avoid excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(globalSearchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [globalSearchTerm]);

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
                // Convert all data to strings and ensure consistency
                const processedData = res.data.map(row => {
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
                setSearchResults(processedData);
                setColumns(res.columns);
                setTotalNumResults(res.data.length);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setSearchResults([]);
            setTotalNumResults(0);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input changes
    const handleSearchChange = (event) => {
        setGlobalSearchTerm(event.target.value);
    };

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            // Update localStorage for download purposes
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            if (demoV) {
                demoV.downloadData = { 
                    simpleSearch: globalSearchTerm.trim() 
                };
                localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
            }
            setSnackBarOpen(true);
        }
    };

    const handleConcordanceViewClick = () => {
        navigate('/concordanceview');
        console.log('Navigating to concordance view...');
    };

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    // Check if user is logged in
    useEffect(() => {
        const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV && demoV.dataset) {
            setSelected(true);
        }
    }, []);

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

            {/* Title Section*/}
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
                        {props.dataset?.title || 'Dataset Search & Analysis'}
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
                            placeholder="Search dataset..."
                            variant="outlined"
                            value={globalSearchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Search Instructions */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ 
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#fff3cd',
                                    border: '1px solid #856404',
                                    borderRadius: '3px'
                                }} />
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Global search highlights
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#e3f2fd',
                                    border: '1px solid #1976d2',
                                    borderRadius: '3px'
                                }} />
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Column-specific highlights
                                </Typography>
                            </Box>
                        </Stack>
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
                    {/* <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading results...' : 
                         totalNumResults >= 0 ? `Showing ${Math.min(searchResults.length, 20)} of ${totalNumResults} results` : 'Ready to search'}
                    </Typography> */}
                </Box>
                
                {/* Results Section */}
                {selected && (
                    <Box sx={{ p: 3 }}>
                        <PaginatedDataTable
                            searchResults={searchResults}
                            pageLength={20}
                            GetNewPage={() => {}} // Not used in client-side pagination
                            downloadType="subset"
                            table_name={JSON.parse(localStorage.getItem('democracy-viewer'))?.dataset?.table_name || ''}
                            totalNumResults={totalNumResults}
                            columns={columns}
                            extLoading={loading}
                            globalSearchTerm={debouncedSearchTerm}
                        />
                    </Box>
                )}

                {/* No Dataset Selected Message */}
                {!selected && !loading && (
                    <Box sx={{ 
                        p: 4,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                            No Dataset Selected
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                            Please select a dataset to begin searching and analyzing data.
                        </Typography>
                        <Link
                            component="button"
                            variant="body1"
                            onClick={() => navigate('/datasets')}
                            sx={{ color: '#1976d2', textDecoration: 'underline' }}
                        >
                            Browse Available Datasets
                        </Link>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};