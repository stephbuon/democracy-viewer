import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import { Box, TextField, Typography, InputAdornment, Divider, Snackbar, Alert, Link, Button, Paper, Chip, Grid, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { Stack } from '@mui/system';
import { GetSubsetOfDataByPage } from '../../api';
import Highlighter from "react-highlight-words";

const pageLength = 10;

export default function ConcordanceView(props) {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [windowSize, setWindowSize] = useState(5);
    const [concordanceResults, setConcordanceResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [totalNumResults, setTotalNumResults] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [selected, setSelected] = useState(false);
    const [dataset, setDataset] = useState(null);
    const [allData, setAllData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [expandedResults, setExpandedResults] = useState(new Set());

    // Toggle expansion of full context
    const toggleExpansion = (resultId) => {
        setExpandedResults(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resultId)) {
                newSet.delete(resultId);
            } else {
                newSet.add(resultId);
            }
            return newSet;
        });
    };

    // Truncate text to a certain number of characters for context preview
    const truncateText = (text, maxLength = 365) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Fetch all data for concordance analysis
    const fetchAllDataForConcordance = async () => {
        if (!dataset) return;
        
        setLoading(true);
        try {
            // Fetch a larger subset or all data for concordance analysis
            const query = { simpleSearch: '' };
            const res = await GetSubsetOfDataByPage(dataset.table_name, query, 1, 1000);
            
            if (res && res.data) {
                setAllData(res.data);
                setColumns(res.columns);
            }
        } catch (error) {
            console.error('Error fetching data for concordance:', error);
        } finally {
            setLoading(false);
        }
    };

    //Create concordance from the dataset
    const runKWIC = () => {
        if (!searchTerm.trim() || allData.length === 0) return;

        setLoading(true);
        const searchWords = searchTerm.trim().toLowerCase().split(/\s+/);
        const results = [];

        // Process each row in the dataset
        allData.forEach((row, rowIndex) => {
            // Check each text column for matches
            Object.keys(row).forEach(columnName => {
                if (columnName === 'record_id') return; // Skip ID column
                
                const cellValue = row[columnName];
                if (!cellValue || typeof cellValue !== 'string') return;
                
                const text = cellValue.toString();
                const tokens = text.split(/(\s+|[.,!?;:])/); // Split on whitespace and punctuation
                const words = tokens.filter(token => /\w/.test(token)); // Filter to actual words
                
                words.forEach((word, wordIndex) => {
                    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                    
                    // Check if this word exactly matches any of our search terms (whole word matching)
                    const matchesSearch = searchWords.some(searchWord => {
                        const cleanSearchWord = searchWord.toLowerCase().replace(/[^\w]/g, '');
                        // Use word boundary matching to avoid partial matches
                        return cleanWord === cleanSearchWord || 
                               (cleanWord.length >= 3 && cleanSearchWord.length >= 3 && 
                                cleanWord.includes(cleanSearchWord));
                    });
                    
                    if (matchesSearch) {
                        // Find the position of this word in the original tokens array
                        let tokenIndex = 0;
                        let wordCount = 0;
                        for (let i = 0; i < tokens.length; i++) {
                            if (/\w/.test(tokens[i])) {
                                if (wordCount === wordIndex) {
                                    tokenIndex = i;
                                    break;
                                }
                                wordCount++;
                            }
                        }
                        
                        // Extract context window
                        const contextStart = Math.max(0, tokenIndex - (windowSize * 2)); // Account for spaces
                        const contextEnd = Math.min(tokens.length, tokenIndex + (windowSize * 2) + 1);
                        
                        const beforeTokens = tokens.slice(contextStart, tokenIndex);
                        const keywordToken = tokens[tokenIndex];
                        const afterTokens = tokens.slice(tokenIndex + 1, contextEnd);
                        
                        const before = beforeTokens.join('').trim();
                        const after = afterTokens.join('').trim();
                        
                        results.push({
                            id: `${rowIndex}-${columnName}-${wordIndex}`,
                            recordId: row.record_id || rowIndex,
                            column: columnName,
                            before,
                            keyword: keywordToken,
                            after,
                            fullText: text,
                            rowData: row
                        });
                    }
                });
            });
        });

        setConcordanceResults(results);
        setTotalNumResults(results.length);
        setCurrentPage(1);
        updateDisplayedResults(results, 1);
        setExpandedResults(new Set());
        setLoading(false);
    };

    // Update displayed results based on current page
    const updateDisplayedResults = (results, page) => {
        const startIndex = (page - 1) * pageLength;
        const endIndex = startIndex + pageLength;
        setDisplayedResults(results.slice(startIndex, endIndex));
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        updateDisplayedResults(concordanceResults, newPage);
        setExpandedResults(new Set()); // Reset expanded state when changing pages
    };

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            runKWIC();
        }
    };

    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    const handleBackToSubsetView = () => {
        navigate(-1);
        console.log('Navigating back to subset view...');
    };

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 0 && selected && allData.length > 0) {
                runKWIC();
            } else if (searchTerm.length === 0) {
                setConcordanceResults([]);
                setDisplayedResults([]);
                setTotalNumResults(-1);
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, windowSize, allData]);

    // Initialize component and fetch dataset
    useEffect(() => {
        try {
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            if (!demoV || !demoV.dataset) {
                navigate('/datasets/search');
                if (props.setNavigated) props.setNavigated(true);
                setSnackBarOpen(true);
                return;
            }
            
            setDataset(demoV.dataset);
            setSelected(true);
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            navigate('/datasets/search');
            setSnackBarOpen(true);
        }
    }, []);

    // Fetch data when dataset is set
    useEffect(() => {
        if (dataset && selected) {
            fetchAllDataForConcordance();
        }
    }, [dataset, selected]);

    if (!selected) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Typography>Loading...</Typography>
        </Box>;
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 13 }}>
            {/* Back to Subset View Button */}
            <Box sx={{  position: 'absolute', top: 80, left: 16, zIndex: 1000 }}>
                <Link
                    component="button"
                    onClick={handleBackToSubsetView}
                    sx={{ fontSize: '0.875rem',
                        color: '#1976d2',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }} >
                    Switch to Dataset View
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
            <Box sx={{  width: '100%', textAlign: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                }}>
                    <Typography 
                        component="h1" 
                        variant="h3" 
                        sx={{ fontSize: '2.5rem', color: 'black', fontWeight: 500 }} >
                        Concordance View
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Keyword-in-Context analysis for {dataset?.title || 'dataset'}
                </Typography>
            </Box>
            
            <Stack spacing={0}>
                {/* Search Section */}
                <Box sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
                    <Box sx={{display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3
                    }}>
                    <TextField
                        sx={{ width: { xs: "100%", sm: "500px" },
                              backgroundColor: 'white' }}
                        id="searchTerm"
                        placeholder="Enter search term for concordance analysis..."
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
                        }} />
                        
                        {/* Window Size Control */}
                        <Box sx={{ display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TuneIcon color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    Context Window:
                                </Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={windowSize}
                                    onChange={event => setWindowSize(parseInt(event.target.value) || 5)}
                                    inputProps={{ min: 1, max: 20 }}
                                    sx={{ width: '80px' }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    words
                                </Typography>
                            </Box>
                            
                            <Button
                                onClick={runKWIC}
                                variant="contained"
                                disabled={!searchTerm.trim() || loading || allData.length === 0}
                            >
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </Button>
                        </Box>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {loading ? 'Analyzing concordance...' : 
                             totalNumResults >= 0 ? `Found ${totalNumResults} concordance matches` : 
                             allData.length > 0 ? 'Ready to analyze' : 'Loading dataset...'}
                        </Typography>
                        {totalNumResults > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Page {currentPage} of {Math.ceil(totalNumResults / pageLength)} 
                            </Typography>
                        )}
                    </Box>
                </Box>
                
                {/* Results Section */}
                <Box sx={{ p: 3 }}>
                    {displayedResults.length > 0 && ( <>
                            <Stack spacing={2}>
                                {displayedResults.map((result) => (
                                    <Paper key={result.id} elevation={1} sx={{ p: 2, borderLeft: '4px solid #1976d2', '&:hover': { boxShadow: 2 } }}>
                                        {/* Meta information */}
                                        <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip label={`Record: ${result.recordId}`} size="small" color="primary" variant="outlined" />
                                            <Chip label={`Column: ${result.column}`} size="small" color="secondary" variant="outlined" />
                                        </Box>
                                        
                                        {/* KWIC Context Display */}
                                        <Grid container spacing={0.1} alignItems="center" sx={{ mb: 1.5 }}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ textAlign: 'right', fontSize: '0.95rem'}}>
                                                    {result.before}
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Box sx={{ fontSize: '0.95rem', fontWeight: 'bold', backgroundColor: '#ffeb3b', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                                                        <Highlighter
                                                            searchWords={searchTerm.split(" ")}
                                                            textToHighlight={result.keyword}
                                                            highlightStyle={{ backgroundColor: '#ffe27e', padding: '2px', borderRadius: '2px' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ textAlign: 'left', fontSize: '0.95rem'}}>
                                                    {result.after}
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Full Context */}
                                        <Box sx={{ pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                Full context:
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                                                <Highlighter
                                                    searchWords={searchTerm.split(" ")}
                                                    textToHighlight={expandedResults.has(result.id) ? result.fullText : truncateText(result.fullText)}
                                                    highlightStyle={{ backgroundColor: expandedResults.has(result.id) ? '#ffe27e' : '#ffeb3b', color: '#333333', padding: '2px', borderRadius: '2px' }}
                                                />
                                            </Typography>
                                            {result.fullText.length > 365 && (
                                                <Button
                                                    size="small"
                                                    onClick={() => toggleExpansion(result.id)}
                                                    sx={{ mt: 0.5, fontSize: '0.75rem', textTransform: 'none', minHeight: 'auto', p: 0.5 }}
                                                >
                                                    {expandedResults.has(result.id) ? 'Show less' : 'Show more'}
                                                </Button>
                                            )}
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                            
                            {/* Pagination */}
                            {totalNumResults > pageLength && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={Math.ceil(totalNumResults / pageLength)}
                                        page={currentPage}
                                        onChange={(event, page) => handlePageChange(page)}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            )}
                        </>
                    )}
                    
                    {/* No results messages */}
                    {concordanceResults.length === 0 && !loading && searchTerm && allData.length > 0 && (
                        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            <Typography variant="body1">No concordance matches found for "{searchTerm}"</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>Try adjusting your search term or increasing the context window</Typography>
                        </Box>
                    )}

                    {allData.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            <Typography variant="body1">No data available for concordance analysis</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>Please ensure your dataset contains text data</Typography>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};