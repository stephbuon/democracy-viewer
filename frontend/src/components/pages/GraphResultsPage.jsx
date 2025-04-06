import { useState, useEffect } from "react";

// MUI Imports
import { FormControl, MenuItem, Select, Paper, Box, Button, TextField, Modal, Snackbar, Alert, Grid, Typography } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Stack } from '@mui/system';

// Other Imports
import { filterGraphs } from '../../api';
import { GraphTable } from "../common/tables";
import { AdvancedFilter } from './subcomponents/dataset-search'; // Assuming this is the same component or you have an equivalent

const pageLength = 5;

export const GraphResultsPage = (props) => {
    // temp values
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [alert, setAlert] = useState(1);
    
    // pagination
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumResults, setTotalNumOfResults] = useState(0);
    
    const [loadingResults, setLoadingResults] = useState(false);
    const [snackBarOpen1, setSnackBarOpen1] = useState(false);

    const filterResults = () => {
        const filter = {
            type: publicPrivate ? 'public' : 'private',
            pageLength
        };
        if (searchTerm) {
            filter.__search__ = searchTerm;
        }
        setPageFilter({ ...filter });
        setLoadingResults(true);
        filterGraphs(filter, 1).then((res) => {
            setLoadingResults(false);

            if (!res) { 
                setSearchResults([]); 
            } else { 
                setSearchResults(res.results);
                if (res.total) {
                    setTotalNumOfResults(res.total);
                } 
            }
        });
    };

    const advancedFilterResults = (advancedFilter) => {
        advancedFilter = { ...advancedFilter, pageLength };
        setPageFilter({ ...advancedFilter });
        setLoadingResults(true);
        filterGraphs(advancedFilter, 1).then(async res => {
            setLoadingResults(false);

            if (!res) { 
                setSearchResults([]); 
            } else { 
                setSearchResults(res.results);
                if (res.total) {
                    setTotalNumOfResults(res.total);
                } 
            }

            handleAdvancedFilterClose()
        });
    };

    const GetNewPage = async (selectedPage) => {
        setLoadingResults(true);

        try {
            const res = await filterGraphs(pageFilter, selectedPage);

            if (!res) { 
                setSearchResults([]); 
            } else { 
                setSearchResults(res.results);
                if (res.total) {
                    setTotalNumOfResults(res.total);
                } 
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
        } finally {
            setLoadingResults(false);
        }
    };

    const loggedIn = () => {
        if (props.currUser) {
            return true;
        } else {
            const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            if (demoV && demoV.user) {
                return true;
            } else {
                return false;
            }
        }
    };
    
    const openSnackbar = () => {
        if (!loggedIn()) {
            setSnackBarOpen(true);
        }
    };
    
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };
    
    const openAdvancedFilter = () => {
        setAdvancedFilterOpen(true);
    };
    
    const handleAdvancedFilterClose = () => {
        setAdvancedFilterOpen(false);
    };
    
    const openSnackbar1 = () => {
        setSnackBarOpen1(true);
    };
    
    const handleSnackBarClose1 = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen1(false);
    };

    const onEnter = (event) => {
        if (event.key === "Enter") {
            filterResults();
        }
    };

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
        filterResults();
    }, []);

    return (
        <div className='blue' style={{ overflow: 'hidden' }}>
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
                mt: 4, 
                mb: 2 
            }}>
                <Typography 
                    component="h1" 
                    variant="h3" 
                    sx={{ 
                        fontSize: '2.5rem', 
                        color: 'Black'
                    }}
                >
                    Find a Visualization
                </Typography>
            </Box>
            
            <Paper elevation={6} sx={{ maxWidth: '90%', margin: '0 auto', p: 4 }}>
                <Stack spacing={3}>
                    {/* Search Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 3
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                sx={{ width: { xs: "90%", sm: "400px" } }}
                                id="searchTerm"
                                label="Search"
                                variant="outlined"
                                color="primary"
                                focused
                                value={searchTerm}
                                onChange={event => { setSearchTerm(event.target.value) }}
                                onKeyDown={onEnter}
                            />
                        </Box>
                        
                        <Box
                            sx={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "center"
                            }}
                        >
                            <Button
                                onClick={() => setAdvancedFilterOpen(true)}
                                variant="outlined"
                                sx={{ m: 2 }}
                            >
                                Advanced Filter
                            </Button>
                        </Box>
                        
                        <Modal open={advancedFilterOpen} onClose={() => handleAdvancedFilterClose()}>
                            <AdvancedFilter advancedFilterResults={(x) => advancedFilterResults(x)} />
                        </Modal>
                    </Box>
                    
                    {/* Results Section */}
                    <Box sx={{ width: '100%' }}>
                        <GraphTable
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
            </Paper>
            
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
        </div>
    );
}