import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell, Paper } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

//Other Imports
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';
import { Result } from './Result';
import { AdvancedFilter } from './AdvancedFilter';
import './Loading.css'
import { Stack, width } from '@mui/system';



export const DatasetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()


    //temp values

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [totalTags, setTotalTags] = useState([]);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);


    //pagination
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumOfPages, setTotalNumOfPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loadingNextPage, setLoadingNextPage] = useState(false)


    const [loadingResults, setLoadingResults] = useState(false);

    //for animation testing


    const filterResults = () => {

        let filter = {
            searchTerm: searchTerm ? `&search=${searchTerm}` : '',
            type: publicPrivate ? 'public' : 'private',
            advanced: false
        }
        setPageFilter({ ...filter });
        setLoadingResults(true);
        FilterDatasets(filter, 1).then((res) => {

            //animation testing
            setTimeout(() => {
                setLoadingResults(false);

                if (!res) { setSearchResults([]) }
                else { setSearchResults(res) }
            }, 3000);

        })
        FilterDatasetsCount(filter).then(async (res) => {
            let tot = res / 50;
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
    }
    const advancedFilterResults = (advancedFilter) => {
        console.log("Filter", advancedFilter)
        setPageFilter({ ...advancedFilter });
        setLoadingResults(true);
        FilterDatasets(advancedFilter, 1).then(async res => {

            //animation testing
            setTimeout(() => {
                setLoadingResults(false);

                if (!res) { setSearchResults([]) }
                else { setSearchResults(res) }
            }, 3000);

            handleAdvancedFilterClose()
        })
        FilterDatasetsCount(advancedFilter).then(async (res) => {
            let tot = res / 50;
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
    }


    const GetNewPage = () => {
        let _results = [];
        setLoadingNextPage(true);
        FilterDatasets(pageFilter, page + 1).then(async res => {

            //animation testing
            _results = [...searchResults, ...res];

        })
        setTimeout(() => {
            setLoadingNextPage(false)
            setSearchResults(_results);
        }, 3000);
        setPage(page + 1);
    }

    const loggedIn = () => {
        //check if user is logged in
        //for now will return false since system is not hooked up
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

    useEffect(() => {
        console.log("Loading Results", loadingResults)
    }, [loadingResults]);



    return (<div className='blue' style={{ marginTop: "-1in" }}> 
        <Grid container component="main" sx={{ height: '100vh' }}>
              {/* Grid that conatins Search Bar */}
            <Grid item xs={12} sm={9} md={5.5} component={Paper} elevation={6} square>
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
                                            onClick={() => openSnackbar()}>Private
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
                    <Table
                        sx={{
                            color: 'rgb(0, 0, 0)',
                            marginTop: '2rem',
                            width: .8,
                        }}
                    >
                        <TableHead
                            sx={{
                                background: 'rgb(255, 255, 255)', opacity: 0.8
                            }}>
                            <TableRow>
                                <TableCell align='center'>
                                    <Typography component="h1" variant="h6">Results
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {/*Animated Class while people wait for database response*/}
                        {loadingResults && <TableBody sx={{ background: '#fff' }}>
                            <TableRow className='loadingData1'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData2'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData3'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData4'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData5'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData6'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData7'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                            <TableRow className='loadingData8'>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                        </TableBody>}
                        {!loadingResults && <TableBody
                            sx={{
                                background: 'rgb(200, 200, 200)'
                            }}>
                            {searchResults.map((result) => {
                                return <TableRow id={result.table_name} key={result.table_name}>
                                    <TableCell>
                                        <Result result={result} setDataset={(x) => props.setDataset(x)} />
                                    </TableCell>
                                </TableRow>
                            })}
                        </TableBody>}
                    </Table>
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