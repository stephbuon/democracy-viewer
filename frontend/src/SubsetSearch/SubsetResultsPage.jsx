import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import 'react-resizable/css/styles.css';
//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
//Other Imports
import { DownloadSubset, GetSubsetOfDataByPage } from '../apiFolder/SubsetSearchAPI';
// import { DataTable } from "../common/DataTable/DataTable";
import { PaginatedDataTable } from '../common/PaginatedDataTable';
import Highlighter from "react-highlight-words";

const pageLength = 10;

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumResults, setTotalNumResults] = useState(0);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({});
    const [columns, setColumns] = useState([]);

    const highlight = (results) => {
        const terms = searchTerm.split(" ");
        results.map(row => {
            Object.keys(row).forEach(col => {
                if (col !== "__id__") {
                    if (typeof row[col] !== "string") {
                        row[col] = row[col].toString()
                    }
                    row[col] = (
                        <Highlighter
                            searchWords={terms}
                            textToHighlight={ row[col] }
                        />
                    )
                }
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

        GetSubsetOfDataByPage(props.dataset.table_name, _query, 1, pageLength).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            }
            else {
                highlight(res.data);
                setTotalNumResults(res.count);
                setColumns(res.columns);
            }
            setPage(1);
        })

        setQuery(_query);
    }

    //Changed
    const GetNewPage = async (selectedPage) => {
        try {
            const res = await GetSubsetOfDataByPage(props.dataset.table_name, query, selectedPage, pageLength);
            if (res) {
                // Correctly handle asynchronous state update
                setPage(selectedPage);
                highlight(res.data);
            }
        } catch (error) {
            console.error('Error fetching new page:', error);
        }
    };

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            fetchSubset();
        }
    };

    useEffect(() => {
        console.log(props)
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV == undefined || demoV.dataset == undefined) {
            navigate('/datasetSearch')
            props.setNavigated(true)
        } else {
            fetchSubset();
        }
    }, []);

    return <>
        <div className='blue' >
            <Box component="main"
                sx={{
                    marginTop: '100px',
                    marginLeft: "100px", //Hardcoded
                }}>


                <Box
                    // className={`${searching ? 'searching-parent' : ''} ${searched ? 'searched' : 'not-searched'}`}
                    sx={{
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: '100px',
                        marginLeft: '10px',
                        flexDirection: "column", // Add this to stack the elements vertically

                    }}
                >


                    <Box
                        // className={`${searching ? 'searching' : ''} ${searched ? 'searched-bar' : 'not-searched-bar'}`}
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
                                onKeyDown={event => handleKeyPress(event)}
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
                            onClick={() => fetchSubset()}
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
            GetNewPage={GetNewPage}
            table_name={props.dataset.table_name}
            downloadSubset={() => DownloadSubset(props.dataset.table_name, query)}
            totalNumResults={totalNumResults}
            pageLength={pageLength}
            columns={columns}
        />
    </>

}