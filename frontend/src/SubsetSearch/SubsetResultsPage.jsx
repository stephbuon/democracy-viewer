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

        GetSubsetOfDataByPage(_query, 1).then(async (res) => {
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

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            doMoveAnimation()
        }
    };

    const numberOfColumns = searchResults.length > 0 ? Object.keys(searchResults[0]).length : 1;
    const initialWidths = new Array(numberOfColumns).fill(100);
    const [columnWidths, setColumnWidths] = useState(initialWidths);

    const handleResize = (index, newWidth) => {
        setColumnWidths((currentWidths) =>
            currentWidths.map((width, i) => i === index ? newWidth : width)
        );
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        let startPage, endPage;

        if (totalNumOfPages <= 10) {
            startPage = 1;
            endPage = totalNumOfPages;
        } else {
            if (page <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (page + 4 >= totalNumOfPages) {
                startPage = totalNumOfPages - 9;
                endPage = totalNumOfPages;
            } else {
                startPage = page - 5;
                endPage = page + 4;
            }
        }

        return pageNumbers.map(num => (
            <Button
                key={num}
                variant={page === num ? "contained" : "outlined"}
                onClick={() => GetNewPage(num)}
                disabled={page === num}
            >
                {num}
            </Button>
        ));
    };

    const gridTemplateColumns = columnWidths.map((width) => `${width}px`).join(' ');

    useEffect(() => {
        setColumnWidths(new Array(numberOfColumns).fill(100));
    }, [numberOfColumns]);

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV == undefined || demoV.dataset == undefined) {
            navigate('/datasetSearch')
            props.setNavigated(true)
        }
    }, []);

    useEffect(() => {
        const handleScroll = (event) => {
            let lastKnownScrollPosition = window.scrollY;
            let limit = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            if (lastKnownScrollPosition > (limit - 1000) && !loadingNextPage && page < totalNumOfPages && page > 0) {
                GetNewPage();
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [page, loadingNextPage, totalNumOfPages, loadingPage]);

    return (
        <div className='blue'>
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
                        flexDirection: "column",
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
                        overflow: 'scroll'
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
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                {renderPageNumbers()}
            </Box>
        </div>
    )
}
