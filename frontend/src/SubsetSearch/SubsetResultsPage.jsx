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
import { GetSubsetOfData } from '../apiFolder/SubsetSearchAPI';

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

    const [loadingResults, setLoadingResults] = useState(false);

    const doMoveAnimation = () => {
        console.log("STARTING THE MOVE")
        if(!searched)
        {
            setSearching(true)
            setTimeout(() => finishAnimation(), 500);
        }
        else
        {
            setLoadingResults(true);
            setTimeout(() => setLoadingResults(false), 3000);
        }

    }
    const finishAnimation = () => {
        setSearched(true)
        setSearching(false);
        setLoadingResults(true);
        fetchSubset();
    }

    const fetchSubset = () => {
        setTimeout(() => setLoadingResults(false), 3000);
        let query = {
            table_name: props.dataset.table_name,
            search: ''
        }
        GetSubsetOfData(query).then((res) => {
            setSearchResults(res);
            // setLoadingResults(false);
        })
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
            <Box className = {`${searching ? 'searching' : ''} ${searched ? 'searched-bar' : 'not-searched-bar'}`}
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
                        return <TableRow id={Object.keys(result)[0]} key={Object.keys(result)[0]}>
                            <TableCell>
                                <Result result={result} dataset={props.dataset}/>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>}
            </Table>
        </Box>}

    </div >)

}