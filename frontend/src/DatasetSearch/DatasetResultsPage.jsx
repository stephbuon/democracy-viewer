import { useState, useEffect } from "react";

//MUI Imports
import { FormControl, MenuItem, Select, Paper, Box, Button, TextField, Modal, Snackbar, Alert, Grid, Typography } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Stack } from '@mui/system';

//Other Imports
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';
import { AdvancedFilter } from './AdvancedFilter';
import { DatasetTable } from '../common/DatasetTable';

const pageLength = 5;

export const DatasetResultsPage = (props) => {
    //temp values

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

    const [alert, setAlert] = useState(1);


    //pagination
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumResults, setTotalNumOfResults] = useState(0);


    const [loadingResults, setLoadingResults] = useState(false);

    const [snackBarOpen1, setSnackBarOpen1] = useState(false);


    //for animation testing


    const filterResults = () => {
        const filter = {
            type: publicPrivate ? 'public' : 'private',
            pageLength
        }
        if (searchTerm) {
            filter.__search__= searchTerm;
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
        console.log("Filter", advancedFilter)
        advancedFilter = { ...advancedFilter, pageLength };
        setPageFilter({ ...advancedFilter });
        setLoadingResults(true);
        FilterDatasets(advancedFilter, 1).then(async res => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }

            handleAdvancedFilterClose()
        })
        FilterDatasetsCount(advancedFilter).then(async (res) => {
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
        if (props.currUser) {
            return true;
        }
        return false;
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

    const onEnter = (event) => {
        if (event.key === "Enter") {
            filterResults();
        }
    }

    useEffect(() => {
        if (props.navigated) {
            props.setNavigated(false)
            setAlert(1);
            openSnackbar1()
        }
        filterResults()
    }, []);

    return (<div className='blue' style={{ marginTop: "-1in" }}>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={snackBarOpen1}
            autoHideDuration={6000}
            onClose={() => handleSnackBarClose1()}
        >
            <Alert onClose={handleSnackBarClose1} severity="error" sx={{ width: '100%' }}>
                {alert === 1 && <>Must choose dataset first</>}
                {alert === 2 && <>Could not use distributed connection</>}
            </Alert>
        </Snackbar>
        <Grid container component="main" sx={{ height: '100vh' }}>
              {/* Grid that conatins Search Bar */}
            <Grid item xs={12} sm={9} md={5.5} component={Paper} elevation={6} square sx={{pt:25}}>
                <Stack spacing={2}>
                    <Box
                        sx={{
                            my: 30,//still need to correct formatting for mobile 
                            mx: 2,
                            ml: { xs: 4, sm: 6, md: 8 },//Working on mobile formatting
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <QueryStatsIcon color="primary" sx={{ m: 1, fontSize: 60 }}>
                        </QueryStatsIcon>
                        <Typography component="h1" variant="h5">
                            Search
                        </Typography>
                        <Box sx={{ m: 2 }}>
                            <div align="center">
                                <FormControl
                                    sx={{ color: "blue" }}>
                                    <Select
                                        sx={{ color: "primary" }}
                                        value={publicPrivate}
                                        onChange={event => setPublicPrivate(event.target.value)}
                                    >
                                        <MenuItem
                                            value={true}
                                        >Public</MenuItem>
                                        <MenuItem
                                            value={false}
                                            onClick={() => !loggedIn() && openSnackbar()}>Private
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </Box>
                        <Box>
                            <div align="center">
                                <TextField
                                    sx={{ width: "500px" }}
                                    id="searchTerm"
                                    label="Search"
                                    variant="outlined"
                                    color="primary"
                                    focused
                                    value={searchTerm}
                                    onChange={event => { setSearchTerm(event.target.value) }}
                                    onKeyDown={event => onEnter(event)}
                                />
                            </div>
                        </Box>
                        <Modal
                            open={advancedFilterOpen}
                            onClose={() => handleAdvancedFilterClose()}

                        >
                            <AdvancedFilter
                                advancedFilterResults={(x) => advancedFilterResults(x)}
                            />
                        </Modal>
                        <Box
                            pt={2}
                            sx={{
                                //background: 0xffffffff,
                                display: "flex",
                                alignItems: 'stretch',
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                onClick={() => setAdvancedFilterOpen(true)}
                                variant="outlined"
                                sx={{ m: 2 }}
                            >
                                Advanced Filter
                            </Button>
                            {(publicPrivate || (!publicPrivate && loggedIn())) && <Button
                                variant="outlined"
                                onClick={() => filterResults()}
                                sx={{ m: 2 }}
                            >
                                Apply Filters
                            </Button>}
                            {(!publicPrivate && !loggedIn()) &&
                                <Button
                                    variant="contained"
                                    sx={{ m: 2 }}
                                    disabled
                                // sx={{
                                //     background: 'rgb(255, 255, 255)',
                                //     color: 'rgb(0, 0, 0)',
                                //     '&:hover': {
                                //         background: 'rgb(200, 200, 200)'
                                //     }
                                // }}
                                // onClick={() => filterResults()}
                                >
                                    Apply Filters
                                </Button>
                            }
                        </Box>
                    </Box>
                </Stack>
            </Grid>
            {/* Grid that contains image and Results */}
            <Grid item xs={false} sm={3} md={6.5} sx={{
                backgroundImage: 'url(https://cdn.pixabay.com/photo/2016/01/20/11/54/book-wall-1151405_1280.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundColor: (t) =>
                    t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        my: 20
                }}>
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
            </Grid>
        </Grid>
        {/* SnackBar to display error if not logged in  */}
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