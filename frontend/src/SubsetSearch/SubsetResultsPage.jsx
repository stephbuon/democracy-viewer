import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import 'react-resizable/css/styles.css';
//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
//Other Imports
import { DownloadSubset, DownloadFullDataset, GetSubsetOfDataByPage } from '../apiFolder/SubsetSearchAPI';
// import { DataTable } from "../common/DataTable/DataTable";
import { PaginatedDataTable } from '../common/PaginatedDataTable';
import Highlighter from "react-highlight-words";

// import "../common/DataTable/MoveBar.css"
// import "../common/DataTable/Loading.css"


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
    const [query, setQuery] = useState({});
    const [loadingPage, setLoadingPage] = useState(true);
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

    const highlight = (results) => {
        const terms = searchTerm.split(" ");
        results.map(row => {
            Object.keys(row).forEach(col => {
                row[col] = (
                    <Highlighter
                        searchWords={terms}
                        textToHighlight={ row[col] }
                    />
                )
            });
            return row;
        });
        setSearchResults(results);
    }

    const fetchSubset = () => {
        let _query = {
            simpleSearch: searchTerm
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
        GetSubsetOfDataByPage(props.dataset.table_name, _query).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            }
            else {
                highlight(res.data);
                setTotalNumResults(res.count);
                let tot = Math.ceil(res.count / 50);
                setTotalNumOfPages(tot);
                console.log("Number of Pages", tot);
            }
            setPage(1);
        }).finally(async () => {
            setLoadingResults(false);
            setLoadingPage(false);
        });

        setQuery(_query);
    }

    //Changed
    const GetNewPage = async (selectedPage) => {
        if (loadingPage || selectedPage < 1 || selectedPage > totalNumOfPages) return;

        setLoadingNextPage(true);
        setLoadingPage(true);

        try {
            const res = await GetSubsetOfDataByPage(props.dataset.table_name, query, selectedPage);
            if (res) {
                // Correctly handle asynchronous state update
                setPage(prevPage => selectedPage);
                highlight(res.data);
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

    return <>
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
                        marginLeft: '10px',
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
                                DownloadFullDataset(props.dataset.table_name)
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
                            onClick={() => DownloadSubset(props.dataset.table_name, query)}
                        >Download these {totalNumResults} results</Button>
                    </Box>}
                </Box>
            </Box>
        </div >

        <PaginatedDataTable
            searchResults={searchResults}
            page={page}
            totalNumOfPages={totalNumOfPages}
            GetNewPage={GetNewPage}
        />
    </>

}