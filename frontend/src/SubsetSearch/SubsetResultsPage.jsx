import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';

//Other Imports
import { GetNumOfEntries, GetSubsetOfDataByPage } from '../apiFolder/SubsetSearchAPI';

import "./MoveBar.css"
import "./Loading.css"
import { Result } from './Result';

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [searching, setSearching] = useState(false);
    const [totalNumOfPages, setTotalNumOfPages] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [loadingNextPage, setLoadingNextPage] = useState(false)


    const [loadingResults, setLoadingResults] = useState(false);

    const doMoveAnimation = () => {
        console.log("STARTING THE MOVE")
        if (!searched) {
            setSearching(true)
            setTimeout(() => finishAnimation(), 500);
        }
        else {
            setLoadingResults(true);
            fetchSubset();
        }

    }
    const finishAnimation = () => {
        setSearched(true)
        setSearching(false);
        setLoadingResults(true);
        fetchSubset();
    }

    const fetchSubset = () => {
        let _query = {
            table_name: props.dataset.table_name,
            search: searchTerm !== '' ? `?col_search=${searchTerm}` : ''
        }

        console.log("QUERY ", _query.search)
        setTimeout(() => setLoadingResults(false), 3000);
        GetSubsetOfDataByPage(_query, 1).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            }
            else {
                setSearchResults(res);
            }
        })

        GetNumOfEntries(_query).then(async (res) => {
            let tot = res / 50;
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
        setQuery(_query);
    }

    const GetNewPage = () => {
        let _results = [];
        setLoadingNextPage(true);
        GetSubsetOfDataByPage(query, page + 1).then((res) => {
            _results = [...searchResults, ...res];
            console.log("Combo array",_results);
            
        })
        setTimeout(() => {
            setLoadingNextPage(false)
            setSearchResults(_results);
        }, 3000);
        setPage(page + 1);
    }

    const handleKeyPress = event => {
        // console.log('User pressed: ', event.key);

        if (event.key === 'Enter') {
            doMoveAnimation()
            console.log(searchTerm)

        }
    };

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        // setSearchTerm(params.searchterm)
        console.log(props)
        // GetSubsetOfData({table_name: props.dataset.table_name, seach:""}).then(async (res) => {
        //     setSearchResults(res)
        // })
    }, []);


    return (<div className='darkblue'>
        <Box className={`${searching ? 'searching-parent' : ''} ${searched ? 'searched' : 'not-searched'}`}
            sx={{
                // transform: 'translate(0, -45vh)',
                display: 'flex',
                // height: "100vh",
                // paddingTop: '2%'
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Box className={`${searching ? 'searching' : ''} ${searched ? 'searched-bar' : 'not-searched-bar'}`}
                sx={{
                    display: 'flex',
                    // display: 'flex',
                }}
            >
                <Box
                    sx={{
                        borderRadius: '.5em',
                        overflow: "hidden",
                        width: '100%',

                    }}>
                    <TextField
                        id="searchTerm"
                        label="Search"
                        variant="filled"
                        fullWidth
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)',

                        }}
                        value={searchTerm}
                        onChange={event => { setSearchTerm(event.target.value) }}
                        // New Code to search with enter press
                        onKeyPress={event => handleKeyPress(event)}
                    />
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)',
                        marginLeft: '2em',

                        '&:hover': {
                            background: 'rgb(200, 200, 200)'
                        }
                    }}
                    onClick={() => doMoveAnimation()}
                >
                    Search
                </Button>
            </Box>
        </Box>
        {searched && <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}>
            <Table
                sx={{
                    color: 'rgb(0, 0, 0)',
                    marginTop: '2rem',
                    width: .8,
                    marginBottom: '2rem'
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

                {!loadingResults && <TableBody sx={{ background: '#fff' }}>
                    {searchResults.map((result) => {
                        return <TableRow id={Object.keys(result)[0]} key={Object.keys(result)[0]}>
                            <TableCell>
                                <Result result={result} dataset={props.dataset} />
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
        </Box>}

    </div >)

}