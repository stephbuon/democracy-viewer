import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
// import 'react-resizable/css/styles.css';
// MUI Imports
import { Box, TextField } from '@mui/material';
//Other Imports
import { GetSubsetOfDataByPage } from '../../api';
import { PaginatedDataTable } from '../common/tables/PaginatedDataTable';
import Highlighter from "react-highlight-words";

const pageLength = 10;

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumResults, setTotalNumResults] = useState(-1);
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState({});
    const [columns, setColumns] = useState([]);
    const [selected, setSelected] = useState(false);
    const [loading, setLoading] = useState(false);

    const highlight = (results) => {
        const terms = searchTerm.split(" ");
        results.map(row => {
            Object.keys(row).forEach(col => {
                if (col !== "record_id") {
                    if (!row[col]) {
                        row[col] = "";
                    } else if (typeof row[col] !== "string") {
                        row[col] = row[col].toString();
                    }
                    row[col] = (
                        <Highlighter
                            searchWords={terms}
                            textToHighlight={row[col]}
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
        };

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.downloadData = _query;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV));

        setLoading(true);
        GetSubsetOfDataByPage(demoV.dataset.table_name, _query, 1, pageLength).then(async (res) => {
            if (!res) {
                setSearchResults([]);
            } else {
                highlight(res.data);
                setTotalNumResults(res.count);
                setColumns(res.columns);
            }
            setPage(1);
        }).finally(() => setLoading(false));

        setQuery(_query);
    }

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
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (!demoV || !demoV.dataset) {
            navigate('/datasets/search')
            props.setNavigated(true)
        } else {
            fetchSubset();
            setSelected(true);
        }
    }, []);

    if (!selected) {
        return <></>
    }

    return <>
        <div className='blue'>
            <Box component="main"
                sx={{
                    marginTop: '100px',
                    marginLeft: "100px", //Hardcoded
                }}>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: "center",
                        alignItems: "center",
                        // marginBottom: '100px',
                        marginLeft: '10px',
                        flexDirection: "column", // Add this to stack the elements vertically
                    }}
                >

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '20px',
                            flexDirection: 'column'
                        }}
                    >
                        <h1 style={{ fontSize: '3rem' }}>Subset Search</h1>
                    </Box>

                    <Box
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
                                label="Search"
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
                    </Box>
                </Box>
            </Box>
        </div>

        <PaginatedDataTable
            searchResults={searchResults}
            page={page}
            GetNewPage={GetNewPage}
            table_name={props.dataset.table_name}
            downloadType="subset"
            totalNumResults={totalNumResults}
            pageLength={pageLength}
            columns={columns}
            extLoading={loading}
        />
    </>
}
