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


export const DatasetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    //temp values

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [totalTags, setTotalTags] = useState([]);
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    //Call backend with query params and return results

    //TODO - ADD FUNCTIONALITY THAT TELLS THE USER MUST BE LOGGED IN. USE SNACKBAR
    const filterResults = () => {
        let filter = {
            searchTerm: searchTerm ? searchTerm : '',
            type: publicPrivate ? 'public' : 'private',
            tags: totalTags
        }
        FilterDatasets(filter).then((res) => {
            setSearchResults(res)
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

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        // setSearchTerm(params.searchterm) //Need to make this a global variable
        // setSearchResults([...hardcodedResults])
        // const keyDownHandler = event => {
        //     // console.log('User pressed: ', event.key);

        //     if (event.key === 'Enter') {
        //         console.log('User pressed: Enter');
        //         searchFunction();
        //     }
        // };

        // document.addEventListener('keydown', keyDownHandler);

    }, []);


    return (<div className='darkblue'>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={snackBarOpen}
            autoHideDuration={6000}
            onClose={handleSnackBarClose}
        >
            <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
                Must be logged in to search privately
            </Alert>
        </Snackbar>
        <Box
            pt={2}
            sx={{
                background: 0xffffffff,
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
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
        <Table
            sx={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)',
                marginTop: '2rem'
            }}
        >
            <TableHead>
                <TableRow>
                    <TableCell>
                        Results
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {searchResults.map((result) => {
                    return <TableRow id={result.table_name} key={result.table_name}>
                        <TableCell>
                            <Result result={result} />
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>
        </Table>

    </div >)

}