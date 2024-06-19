import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, TableRow, TableCell, Paper } from '@mui/material';
import { FormControl, MenuItem, Select, Paper } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Stack } from '@mui/system';

//Other Imports
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';
import { AdvancedFilter } from './AdvancedFilter';
import './Loading.css';
import { ChangeConnection, GetUserConnections } from '../apiFolder/DistributedBackendAPI';
import { GetSession } from '../apiFolder/LoginRegister';
import { DatasetTable } from '../common/DatasetTable';

export const DatasetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

    const [connection, setConnection] = useState(-1);
    const [userConns, setUserConns] = useState([]);
    const [alert, setAlert] = useState(1);

    //pagination
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumOfPages, setTotalNumOfPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loadingNextPage, setLoadingNextPage] = useState(false);

    const [loadingResults, setLoadingResults] = useState(false);
    const [snackBarOpen1, setSnackBarOpen1] = useState(false);

    const filterResults = () => {
        let filter = {
            searchTerm: searchTerm ? `&search=${searchTerm}` : '',
            type: publicPrivate ? 'public' : 'private',
            advanced: false
        };
        setPageFilter({ ...filter });
        setLoadingResults(true);
        setPage(1);
        FilterDatasets(filter, 1).then((res) => {
            setLoadingResults(false);
            if (!res) { setSearchResults([]); }
            else { setSearchResults(res); }
        });
        FilterDatasetsCount(filter).then(async (res) => {
            let tot = Math.ceil(res / pageLength);
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        });
    };

    const advancedFilterResults = (advancedFilter) => {
        console.log("Filter", advancedFilter)
        advancedFilter = { ...advancedFilter, pageLength };
        setPageFilter({ ...advancedFilter });
        setLoadingResults(true);
        setPage(1);
        FilterDatasets(advancedFilter, 1).then(async res => {
            setLoadingResults(false);
            if (!res) { setSearchResults([]); }
            else { setSearchResults(res); }
            handleAdvancedFilterClose();
        });
        FilterDatasetsCount(advancedFilter).then(async (res) => {
            let tot = Math.ceil(res / pageLength);
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
    }

    const GetNewPage = async (selectedPage) => {
        if (selectedPage < 1 || selectedPage > totalNumOfPages) return;

        setLoadingResults(true);

        try {
            const res = await FilterDatasets(pageFilter, selectedPage);
            if (res) {
                setSearchResults(res);
                // Correctly handle asynchronous state update
                setPage(selectedPage);
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

    useEffect(() => {
        console.log("Loading Results", loadingResults);
    }, [loadingResults]);

    useEffect(() => {
        if (props.currUser) {
            GetSession().then((user) => {
                setConnection(user.database);
            }).catch(() => {
                setConnection(undefined);
            });
        }
        GetUserConnections().then((_conns) => {
            setUserConns(_conns);
        }).catch(() => setUserConns([]));
        if (props.navigated) {
            props.setNavigated(false);
            setAlert(1);
            openSnackbar1();
        }
        filterResults();
    }, []);

    const change_connection = (chosen_dataset) => {
        ChangeConnection(chosen_dataset).then((token) => {
            setConnection(chosen_dataset);
            localStorage.removeItem('democracy-viewer'); // wipe the curr userdata
            let profile = props.currUser;
            profile.token = token;
            props.login(profile);
            props.setUser(profile);
        }).catch(() => {
            setConnection(-1);
            setAlert(2);
            openSnackbar1();
        }).finally(() => {
            filterResults();
        });
    };

    return (
        <div className='blue' style={{ marginTop: "-1in" }}>
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
                {/* Grid that contains Search Bar */}
                <Grid item xs={12} sm={9} md={5.5} component={Paper} elevation={6} square sx={{ pt: 25 }}>
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                my: 30,
                                mx: 2,
                                ml: { xs: 4, sm: 6, md: 8 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Typography component="h1" variant="h5">
                                Search
                            </Typography>
                            <Box sx={{ m: 2 }}>
                                <div align="center">
                                    <FormControl sx={{ color: "blue" }}>
                                        <Select
                                            sx={{ color: "primary" }}
                                            value={publicPrivate}
                                            onChange={event => setPublicPrivate(event.target.value)}
                                        >
                                            <MenuItem value={true}>Public</MenuItem>
                                            <MenuItem
                                                value={false}
                                                onClick={() => !loggedIn() && openSnackbar()}
                                            >
                                                Private
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </Box>
                            <Box sx={{ m: 2 }}>
                                <div align="center">
                                    <FormControl sx={{ color: "blue" }}>
                                        <Select
                                            sx={{ color: "primary" }}
                                            value={connection}
                                            onChange={event => change_connection(event.target.value)}
                                        >
                                            <MenuItem value={-1}>Default</MenuItem>
                                            {userConns.length > 0 && userConns.map((conn) => (
                                                <MenuItem
                                                    id={conn.id}
                                                    value={conn.id}
                                                >
                                                    {conn.name}
                                                </MenuItem>
                                            ))}
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
                                        onChange={event => { setSearchTerm(event.target.value); }}
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
                                    Set Advanced Filter
                                </Button>
                                {(publicPrivate || (!publicPrivate && loggedIn())) && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => filterResults()}
                                        sx={{ m: 2 }}
                                    >
                                        Apply Search
                                    </Button>
                                )}
                                {(!publicPrivate && !loggedIn()) && (
                                    <Button
                                        variant="contained"
                                        sx={{ m: 2 }}
                                        disabled
                                    >
                                        Apply Filters
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/subsetsearch')}
                                    sx={{ m: 2 }}
                                >
                                    Subset Results
                                </Button>
                            </Box>
                        </Box>
                    </Stack>
                </Grid>
                {/* Grid that contains image and Results */}
                <Grid item xs={false} sm={3} md={6.5} sx={{
                    backgroundColor: 'white',
                    backgroundRepeat: 'no-repeat',
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
};
