import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { Stack } from '@mui/system';
import Typography from '@mui/material/Typography';
//Other Imports
import { DownloadSubset, DownloadFullDataset, GetNumOfEntries, GetSubsetOfDataByPage } from '../apiFolder/SubsetSearchAPI';

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
    const [totalNumResults, setTotalNumResults] = useState(0);
    const [totalNumOfPages, setTotalNumOfPages] = useState(0);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState("");
    const [loadingNextPage, setLoadingNextPage] = useState(false)
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);

    let FileSaver = require('file-saver');

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
        setTimeout(() => {
            setLoadingResults(false);
            setLoadingPage(false);
        }, 3000);
        GetSubsetOfDataByPage(_query, 1).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            }
            else {
                setSearchResults(res);
            }
            setPage(1);
        })

        GetNumOfEntries(_query).then(async (res) => {
            setTotalNumResults(res);
            let tot = res / 50;
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
        setQuery(_query);
    }

    const GetNewPage = async () => {
        if (loadingPage) { return }
        setLoadingNextPage(true);
        setLoadingPage(true)
        try {
            const resPromise = GetSubsetOfDataByPage(query, page + 1);
            await new Promise(resolve => setTimeout(resolve, 3000));
            const res = await resPromise;
            if (res) {
                setSearchResults(prevResults => [...prevResults, ...res]);
                setPage(page + 1);
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
        } finally {
            setLoadingNextPage(false);
            setLoadingPage(false);
        }
    };

    //Old function
    // const GetNewPage = () => {
    //     let _results = [];
    //     console.log("getting page", page)
    //     setLoadingNextPage(true);
    //     GetSubsetOfDataByPage(query, page + 1).then((res) => {
    //         _results = [...searchResults, ...res];
    //         console.log("Combo array", _results);

    //     })
    //     setTimeout(() => {
    //         setLoadingNextPage(false)
    //         setSearchResults(_results);
    //     }, 3000);
    //     setPage(page + 1);
    // }

    //infinite scroll
    // window.addEventListener("scroll", (event) => {
    //     let lastKnownScrollPosition = window.scrollY;
    //     // let limit = document.documentElement.offsetHeight
    //     let limit = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
    //         document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    //     // console.log("lastKnownScrollPosition out of limit",lastKnownScrollPosition, limit)
    //     // console.log("SHOULD BE GRABBING NEW PAGE",lastKnownScrollPosition, (limit - 600))
    //     // console.log("1",lastKnownScrollPosition > (limit - 600),"2", !loadingNextPage,"3", page < totalNumOfPages,"4", page > 0)
    //     if (lastKnownScrollPosition > (limit - 1000)  && !loadingNextPage && page < totalNumOfPages && page > 0) {
    //         if(page < totalNumOfPages)
    //         {
    //             setLoadingNextPage(true);
    //         }
    //         setTimeout(() => {
    //             if(!loadingNextPage)
    //             {
    //                 GetNewPage();
    //             }
    //         }, 1000);
    //         console.log("SHOULD BE GRABBING NEW PAGE")

    //     }
    //   });

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            doMoveAnimation()
            console.log(searchTerm)

        }
    };

    useEffect(() => {
        console.log(props)
    }, []);

    useEffect(() => {
        console.log("page", loadingPage)
    }, [loadingPage]);

    useEffect(() => {
        const handleScroll = (event) => {
            // if(loadingResults) {return}
            let lastKnownScrollPosition = window.scrollY;
            let limit = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            if (lastKnownScrollPosition > (limit - 1000) && !loadingNextPage && page < totalNumOfPages && page > 0) {
                GetNewPage();
                console.log("SHOULD BE GRABBING NEW PAGE")


                //     if(page < totalNumOfPages)
                //     {
                //         setLoadingNextPage(true);
                //     }
                //     setTimeout(() => {
                //         if(!loadingNextPage)
                //         {

                //         }
                //     }, 1000);

            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [page, loadingNextPage, totalNumOfPages, loadingPage]);

    return (
        <div className='blue' style={{ marginTop: "-1in" }}>
            <Box component="main" sx={{ marginTop: searching ? '50px' : (searched ? '280px' : '0px') }}>

            <Stack spacing={2} sx={{ position: "relative" }}>
                <Box
                    className={`${searching ? 'searching-parent' : ''} ${searched ? 'searched' : 'not-searched'}`}
                    sx={{
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column", // Add this to stack the elements vertically
                        
                    }}
                >
                  
                        <img
                            src="https://cdn.pixabay.com/photo/2017/10/22/05/06/search-2876776_1280.jpg"
                            alt="your_image_description_here"
                            style={{ maxWidth: "20%" }}
                        />
                  

                    <Box
                        className={`${searching ? 'searching' : ''} ${searched ? 'searched-bar' : 'not-searched-bar'}`}
                        sx={{
                            display: 'flex',
                            zIndex: 1,
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
                                label="Subset Search"
                                variant="outlined"
                                color='primary'
                                focused
                                fullWidth
                                sx={{ marginTop: "10px" }}
                        
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
            </Stack>
            {searched && !loadingResults && <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >{totalNumResults} results returned</Box>
                <Button
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)',
                        marginLeft: '2em',

                        '&:hover': {
                            background: 'rgb(200, 200, 200)'
                        }
                    }}
                    onClick={() => DownloadFullDataset(query).then((res) => {
                        let blob = new Blob([...res], { type: "text/plain;charset=utf-8" });
                        FileSaver.saveAs(blob, `${query.table_name}.csv`);
                    })}
                >Download full dataset</Button>
                <Button
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)',
                        marginLeft: '2em',

                        '&:hover': {
                            background: 'rgb(200, 200, 200)'
                        }
                    }}
                    onClick={() => DownloadSubset(query).then((res) => {
                        let blob = new Blob([...res], { type: "text/plain;charset=utf-8" });
                        FileSaver.saveAs(blob, `${query.table_name}${query.search}.csv`);
                    })}
                >Download these {totalNumResults} results</Button>
            </Box>}
            {searched && <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: 0,
                    overflowX: 'auto',
                    marginTop: '6rem', // Add this line to set a top margin
                }}>
                <Table
                    stickyHeader
                    sx={{
                        color: 'rgb(0, 0, 0)',
                        marginTop: '2rem',
                        // tableLayout: 'fixed',
                        overflowX: 'auto',
                        overflow: 'hidden'
                    }}
                >
                    {!loadingResults && <TableHead>
                        <TableRow
                        // sx={{
                        //     overflow: 'hidden'
                        // }}
                        >
                            {Object.keys(searchResults[0]).map(key => {
                                return <TableCell
                                    sx={{
                                        width: .2
                                    }}
                                >{key}</TableCell>
                            })}
                        </TableRow>

                    </TableHead>}

                    {!loadingResults && <TableBody sx={{ background: '#fff' }}>
                        {searchResults.map((result) => {
                            return <TableRow
                                id={Object.keys(result)[0]}
                                key={Object.keys(result)[0]}
                            >
                                <Result result={result} dataset={props.dataset} />
                            </TableRow>
                        })}
                    </TableBody>}
                </Table>
            </Box>}
            {searched && <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: 0,
                    overflowX: 'auto',
                    marginTop: '2rem', // Add this line to set a top margin
                }}>
                <Table
                    sx={{ width: .8 }}>
                    {(loadingResults || loadingNextPage) && <TableBody sx={{ background: '#fff' }}>
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
                </Table>
            </Box>}

            </Box>

        </div >)

}