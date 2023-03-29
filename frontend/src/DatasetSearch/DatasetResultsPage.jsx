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
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { Card } from '@mui/material';
import { CardMedia } from '@mui/material';

//Other Imports
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';
import { Result } from './Result';
import { AdvancedFilter } from './AdvancedFilter';
import './Loading.css'
import { Stack, width } from '@mui/system';



export const DatasetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    //Navbar 

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
        setPageFilter({...filter});
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
        setPageFilter({...advancedFilter});
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
        FilterDatasets(pageFilter, page+1).then(async res => {

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


    return (<div className='blue'>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={snackBarOpen}
            autoHideDuration={6000}
            onClose={() => handleSnackBarClose()}
        >
            <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
                Must be logged in to search privately
            </Alert>
        </Snackbar>

        <Stack spacing={2}>
            <Box>
                <Card>
                    <div style={{ position: "relative" }}>
                        <CardMedia style={{ height: "400px" }} component="img" image={"https://cdn.pixabay.com/photo/2018/04/10/17/45/look-for-3308177_1280.png"} title="Pancakes" alt="Pancakes" />
                        <div style={{ position: "absolute", color: "white", top: 10, left: "50%", transform: "translateX(-50%)", }}>


                        </div>
                    </div>

                </Card>
            </Box>
            <Box>
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
        </Stack>

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
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
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
                        background: 'rgb(255, 255, 255)',
                    }}>
                    <TableRow>
                        <TableCell>

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
                {loadingNextPage && <TableBody sx={{ background: '#fff' }}>
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
                <TableRow sx={{
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {page < totalNumOfPages && <Button
                        onClick={() => GetNewPage()}
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)',
                            marginLeft: '2em',

                            '&:hover': {
                                background: 'rgb(200, 200, 200)'
                            }
                        }}>Load More</Button>}
                </TableRow>
            </Table>
        </Box>
    </div>)

}