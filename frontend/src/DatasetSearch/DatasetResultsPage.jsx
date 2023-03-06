import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


//Other Imports
import { FilterDatasets } from '../apiFolder/DatasetSearchAPI';
import { Result } from './Result';
import { AdvancedFilter } from './AdvancedFilter';
import './Loading.css'



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

    const [loadingResults, setLoadingResults] = useState(false);

    //for animation testing
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const waitFunct = async (timeout) => {
        await delay(timeout);
    }

    const filterResults = () => {

        let filter = {
            searchTerm: searchTerm ? `&search=${searchTerm}` : '',
            type: publicPrivate ? 'public' : 'private',
            advanced: false
        }
        setLoadingResults(true);
        FilterDatasets(filter).then((res) => {

            //animation testing
            waitFunct(3000).then(() => {
                setLoadingResults(false);

                if (!res) { setSearchResults([]) }
                else { setSearchResults(res) }
            })

            // if (!res) { setSearchResults([]) }
            // else { setSearchResults(res) }

            // setLoadingResults(false);
        })
    }
    const advancedFilterResults = (advancedFilter) => {
        console.log("Filter", advancedFilter)
        setLoadingResults(true);
        FilterDatasets(advancedFilter).then(async res => {

            //animation testing
            waitFunct(3000).then(() => {
                setLoadingResults(false);
                if (!res) { setSearchResults([]) }
                else { setSearchResults(res) }
            })

            // if (!res) { setSearchResults([]) }
            // else { setSearchResults(res) }

            // setLoadingResults(false);
            handleAdvancedFilterClose()
        })
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


    return (<div className='darkblue'>
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
                background: 0xffffffff,
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Button
                onClick={() => setAdvancedFilterOpen(true)}
                variant="contained"
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)',
                    '&:hover': {
                        background: 'rgb(200, 200, 200)'
                    }
                }}>
                Advanced Filter
            </Button>
            <FormControl>
                <Select
                    value={publicPrivate}
                    onChange={event => setPublicPrivate(event.target.value)}
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)'
                        // '&:active': {
                        //     color: 'rgb(0, 0, 0)'
                        //     // border: '1px solid #000'
                        // },
                        // border: '1px solid #000',
                        // borderRadius: ".5em .5em"
                    }}
                >
                    <MenuItem value={true}>Public</MenuItem>
                    <MenuItem value={false} onClick={() => openSnackbar()}>Private</MenuItem>
                </Select>
            </FormControl>
            <TextField
                id="searchTerm"
                label="Search"
                variant="filled"
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)'
                }}
                value={searchTerm}
                onChange={event => { setSearchTerm(event.target.value) }}
            />
            {(publicPrivate || (!publicPrivate && loggedIn())) && <Button
                variant="contained"
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)',
                    '&:hover': {
                        background: 'rgb(200, 200, 200)'
                    }
                }}
                onClick={() => filterResults()}
            >
                Apply Filters
            </Button>}
            {(!publicPrivate && !loggedIn()) &&
                <Button
                    variant="contained"
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
                            Results
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/*Animated Class while people wait for database response*/}
                {loadingResults && <TableBody sx={{background: '#fff'}}>
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
        </div>)

}