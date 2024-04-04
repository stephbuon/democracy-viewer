import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import { Resizable } from "react-resizable";
import 'react-resizable/css/styles.css';
//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell, Hidden } from '@mui/material';
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

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.downloadData = _query;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV))

        console.log("QUERY ", _query.search)
        //
        // setSearchResults([]);
        // setTimeout(() => {
        //     if(searchResults.length > 0)
        //     {
        //         setLoadingResults(false);
        //         setLoadingPage(false);
        //     }
        // }, 3000);
        GetSubsetOfDataByPage(_query, 1).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            }
            else {
                setSearchResults(res);
            }
            setPage(1);
        }).finally(async () => {
            setLoadingResults(false);
            setLoadingPage(false);
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
            // await new Promise(resolve => setTimeout(resolve, 500));
            const res = await resPromise;
            if (res) {
                let _searchResults = [...searchResults, ...res]
                setSearchResults(_searchResults);
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

    //infinite scroll? Saw this online, but did not understand how it worked.
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

    const numberOfColumns = searchResults.length > 0 ? Object.keys(searchResults[0]).length : 1;
    //NEW
    const initialWidths = new Array(numberOfColumns).fill(100);
    //NEW
    const [columnWidths, setColumnWidths] = useState(initialWidths);

    const handleResize = (index, newWidth) => {
        setColumnWidths((currentWidths) =>
            currentWidths.map((width, i) => i === index ? newWidth : width)
        );
    };



    // Convert gridTemplateColumns to use columnWidths state
    const gridTemplateColumns = columnWidths.map((width) => `${width}px`).join(' ');

    useEffect(() => {
        // Initialize or update column widths based on the number of columns
        setColumnWidths(new Array(numberOfColumns).fill(100));
    }, [numberOfColumns]);

    //END OF NEW

    useEffect(() => {
        console.log(props)
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV == undefined || demoV.dataset == undefined) {
            navigate('/datasetSearch')
            props.setNavigated(true)
        }
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
        <div className='blue' >
            <Box component="main"
                sx={{
                    marginTop: searching ? '50px' : (searched ? '280px' : '0px'),
                    marginLeft: "100px", //Hardcoded
                }}>


                <Box
                    className={`${searching ? 'searching-parent' : ''} ${searched ? 'searched' : 'not-searched'}`}
                    sx={{
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: '100px',
                        marginLeft:'10px',
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

                {searched && !loadingResults && <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px'
                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '50px',
                        }}
                    >{totalNumResults} results returned</Box>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{

                            color: 'white',
                            marginLeft: '2em',
                            marginTop: '50px',
                            '&:hover': {
                                background: 'rgb(200, 200, 200)'
                            }
                        }}
                        onClick={() => {
                            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
                            demoV.downloadData = { table_name: props.dataset.table_name, search: "" };
                            localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
                            window.open(`http://localhost:3000/downloadProgress`, "_blank", "noopener,noreferrer");
                        }}
                    >Download full dataset</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{

                            color: 'white',
                            marginLeft: '2em',
                            marginTop: '50px',
                            '&:hover': {
                                background: 'rgb(200, 200, 200)'
                            }
                        }}
                        onClick={() => window.open(`http://localhost:3000/downloadProgress`, "_blank", "noopener,noreferrer")}
                    >Download these {totalNumResults} results</Button>
                </Box>}



                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        margin: 0,
                        marginTop: '6rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        background: '#ffffff',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: gridTemplateColumns,
                            gap: '1rem',
                            marginTop: '2rem',
                        }}
                    >
                        {!loadingResults && searchResults.length > 0 && Object.keys(searchResults[0]).map((key, index) => (
                            <div
                                key={key}
                                style={{
                                    fontWeight: 'bold',
                                }}
                            >
                                <Resizable
                                    width={columnWidths[index]}
                                    height={0}
                                    onResize={(event, { size }) => handleResize(index, size.width)}
                                    handle={
                                        <span
                                            className="react-resizable-handle"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                bottom: 0,
                                                width: '10px',
                                                height: '100%',
                                                cursor: 'col-resize',
                                            }}
                                        />
                                    }
                                >
                                    <div style={{
                                        width: `${columnWidths[index]}px`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {key}
                                    </div>
                                </Resizable>
                            </div>
                        ))}

                    </div>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        margin: 0,
                        marginTop: '6rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        background: '#ffffff',
                       
                    }}
                >
                    <div
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: gridTemplateColumns,
                            gap: '1rem',
                        }}
                    >

                        {!loadingResults && searchResults.map((result, index) => (
                            <div key={result.id}>
                                <Result value={result} dataset={props.dataset} columnWidths={columnWidths} />
                            </div>
                        ))}


                    </div>
                </Box>


                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'left',
                        margin: 0,
                        overflowX: 'auto',
                        marginTop: '2rem',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: gridTemplateColumns,
                            gap: '1rem',
                        }}
                    >

                        {!loadingResults && searchResults.map((result, index) => (
                            <div key={result.id}>
                                <Result value={result} dataset={props.dataset} columnWidths={columnWidths} />
                            </div>
                        ))}
                    </div>
                </Box>



            </Box>

        </div >)

}