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

        try {
            const res = await GetSubsetOfDataByPage(query, selectedPage);
            if (res) {
                setSearchResults(res);
                setPage(prevPage => selectedPage);
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
        } finally {
            setLoadingNextPage(false);
            setLoadingPage(false);
        }
    };

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            doMoveAnimation()
        }
    };

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV == undefined || demoV.dataset == undefined) {
            navigate('/datasetSearch')
            props.setNavigated(true)
        }
    }, []);

    return <>
        <div className='blue' >
            <Box component="main"
                sx={{
                    marginTop: searching ? '50px' : (searched ? '280px' : '0px'),
                    marginLeft: "100px",
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: '100px',
                        marginLeft: '10px',
                        flexDirection: "column", // Add this to stack the elements vertically
                    }}
                >
                    <Typography variant="h4" component="div" align="center" sx={{ mb: 2 }}>
                        Subset Search
                    </Typography>
                    <Typography variant="subtitle1" component="div" align="center" sx={{ mb: 4 }}>
                        You can search the dataset here
                    </Typography>
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
            </Box>
        </div >

        <PaginatedDataTable
            searchResults={searchResults}
            page={page}
            totalNumOfPages={totalNumOfPages}
            GetNewPage={GetNewPage}
            table_name={props.dataset.table_name}
            downloadSubset={() => DownloadSubset(props.dataset.table_name, query)}
            totalNumResults={totalNumResults}
        />
    </>

}
