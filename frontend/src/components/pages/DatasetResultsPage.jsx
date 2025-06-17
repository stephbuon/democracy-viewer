import { useState, useEffect } from "react";

//MUI Imports
import { Box, Button, TextField, Modal, Snackbar, Alert, Typography, InputAdornment, Chip, Divider, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DatasetIcon from '@mui/icons-material/Storage';
import { Stack } from '@mui/system';

// Other Imports
import { FilterDatasets, FilterDatasetsCount } from '../../api';
import { AdvancedFilter } from './subcomponents/dataset-search';
import { DatasetTable } from '../common/tables';

const pageLength = 5;

export const DatasetResultsPage = (props) => {
    //temp values
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [advancedFilterValues, setAdvancedFilterValues] = useState({});
    const [isFiltered, setIsFiltered] = useState(false);

    const [alert, setAlert] = useState(1);

    //pagination
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumResults, setTotalNumOfResults] = useState(0);

    const [loadingResults, setLoadingResults] = useState(false);
    const [snackBarOpen1, setSnackBarOpen1] = useState(false);

    const filterResults = () => {
        const filter = {
            pageLength
        }
        if (searchTerm) {
            filter.__search__= searchTerm;
            setIsFiltered(true);
        } else {
            setIsFiltered(false);
        }
        setPageFilter({ ...filter });
        setLoadingResults(true);
        FilterDatasets(filter, 1).then((res) => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }
        })
        FilterDatasetsCount(filter).then(async (res) => {
            setTotalNumOfResults(res);
        })
    }

    const advancedFilterResults = (advancedFilter) => {
        // Store the filter values for future use
        setAdvancedFilterValues({ ...advancedFilter });
        const filterWithPageLength = { ...advancedFilter, pageLength };
        setPageFilter(filterWithPageLength);
        setIsFiltered(true);

        setLoadingResults(true);
        FilterDatasets(filterWithPageLength, 1).then(async res => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }

            handleAdvancedFilterClose()
        })
        FilterDatasetsCount(filterWithPageLength).then(async (res) => {
            setTotalNumOfResults(res);
        })
    }

    const GetNewPage = async (selectedPage) => {
        setLoadingResults(true);

        try {
            const res = await FilterDatasets(pageFilter, selectedPage);
            if (res) {
                setSearchResults(res);
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
        } finally {
            setLoadingResults(false);
        }
    };

    const loggedIn = () => {
        if(props.currUser) {
            return true;
          } else {
            const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            if (demoV && demoV.user) {
              return true;
            } else {
              return false;
            }
          }
    }

    const openSnackbar = () => {
        if (!loggedIn()) {
            setSnackBarOpen(true)
        }
    }

    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    const openAdvancedFilter = () => {
        setAdvancedFilterOpen(true);
    }

    const handleAdvancedFilterClose = () => {
        setAdvancedFilterOpen(false);
    }

    const openSnackbar1 = () => {
        setSnackBarOpen1(true)
    }

    const handleSnackBarClose1 = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen1(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setAdvancedFilterValues({});
        setIsFiltered(false);
        
        const filter = { pageLength };
        setPageFilter(filter);
        setLoadingResults(true);
        
        FilterDatasets(filter, 1).then((res) => {
            setLoadingResults(false);
            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }
        });
        
        FilterDatasetsCount(filter).then(async (res) => {
            setTotalNumOfResults(res);
        });
    };

    const onEnter = (event) => {
        if (event.key === "Enter") {
            filterResults();
        }
    }

    // Add a new useEffect to handle automatic filtering when searchTerm changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 0) {
                filterResults();
            }
        }, 500); // 500ms delay after the user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        if (props.navigated) {
            props.setNavigated(false)
            setAlert(1);
            openSnackbar1()
        }
        filterResults()
    }, []);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8f9fa',
            py: 13,
            position: 'relative'
        }}>

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackBarOpen1}
                autoHideDuration={6000}
                onClose={() => handleSnackBarClose1()}
            >
                <Alert onClose={handleSnackBarClose1} severity="error" sx={{ width: '100%' }}>
                    {alert === 1 && <>You must choose a dataset first</>}
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
                    <DatasetIcon 
                        sx={{ 
                            fontSize: 40, 
                            color: '#1976d2', 
                            mr: 2 
                        }} 
                    />
                    <Typography 
                        component="h1" 
                        variant="h3" 
                        sx={{ 
                            fontSize: '2.5rem', 
                            color: 'black',
                            fontWeight: 500
                        }}
                    >
                        Search Datasets
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
                                placeholder="Search datasets..."
                                variant="outlined"
                                value={searchTerm}
                                onChange={event => { setSearchTerm(event.target.value) }}
                                onKeyDown={onEnter}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <Box sx={{ 
                                display: "flex", 
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                <Button
                                    onClick={() => setAdvancedFilterOpen(true)}
                                    variant="outlined"
                                    startIcon={<FilterListIcon />}
                                    sx={{ minWidth: '160px' }}
                                >
                                    Advanced Filter
                                </Button>
                                
                                {isFiltered && (
                                    <Button
                                        onClick={clearFilters}
                                        variant="text"
                                        color="secondary"
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </Box>
                            
                            {/* Filter Tags */}
                            {Object.keys(advancedFilterValues).length > 0 && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 1, 
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    mt: 1
                                }}>
                                    {Object.entries(advancedFilterValues).map(([key, value]) => {
                                        if (value && key !== 'pageLength') {
                                            return (
                                                <Chip 
                                                    key={key}
                                                    size="small"
                                                    label={`${key}: ${value}`}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </Box>
                            )}
                        </Box>
                        
                        <Modal open={advancedFilterOpen} onClose={() => handleAdvancedFilterClose()}>
                            <AdvancedFilter 
                                advancedFilterResults={(x) => advancedFilterResults(x)} 
                                initialValues={advancedFilterValues}
                            />
                        </Modal>
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
                            {loadingResults ? 'Loading results...' : 
                             `Showing ${searchResults.length} of ${totalNumResults} results`}
                        </Typography>
                    </Box>
                    
                    {/* Results Section */}
                    <Box sx={{ p: 3 }}>
                        <DatasetTable
                            searchResults={searchResults}
                            loadingResults={loadingResults}
                            setDataset={props.setDataset}
                            GetNewPage={GetNewPage}
                            editable={false}
                            pageLength={pageLength}
                            totalNumResults={totalNumResults}
                        />
                    </Box>
                </Stack>
            
            {/* SnackBar to display error if not logged in */}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={handleSnackBarClose}
            >
                <Alert onClose={handleSnackBarClose} severity="info">
                    You must be logged in to access private datasets.
                </Alert>
            </Snackbar>
        </Box>
    );
}