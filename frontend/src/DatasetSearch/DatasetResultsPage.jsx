import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { Result } from './Result';
import { FilterDatasets } from '../apiFolder/DatasetSearchAPI';


const hardcodedResults = [{ datasetName: "Congress", public: true, owner: "Admin", tags: ["Congress", "Politics"], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
{ datasetName: "Health Stuffs", public: true, owner: "username", tags: ["Health", "Biology", "Other"], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
{ datasetName: "Own Dataset", public: false, owner: "myself", tags: ["Do I need a tag?"], description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }]

export const DatasetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    //temp values

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [totalTags, setTotalTags] = useState([]);

    //Call backend with query params and return results
    const filterResults = () => {

        FilterDatasets().then((res) => {
            
        })
    }

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        setSearchTerm(params.searchterm)
        setSearchResults([...hardcodedResults])
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
        <Box
            pt={2}
            sx={{
                background: 0xffffffff,
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* <FormControl> */}
                {/* <InputLabel id="private-public">Privacy</InputLabel> */}
                <Select
                    // labelId="private-public"
                    value={publicPrivate}
                    label="Age"
                    onChange={event => setPublicPrivate(event.target.value)}
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)',
                        '&:active': {
                            color: 'rgb(0, 0, 0)'
                        }
                    }}
                >
                    <MenuItem value={true}>Public</MenuItem>
                    <MenuItem value={false}>Private</MenuItem>
                </Select>
            {/* </FormControl> */}
            <TextField
                id="searchTerm"
                label="Search"
                variant="filled"
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)',
                    '&:active': {
                        color: 'rgb(0, 0, 0)'
                    }
                }}
                value={searchTerm}
                onChange={event => { setSearchTerm(event.target.value) }}
            />
            <Button
                variant="contained"
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)',
                    '&:hover': {
                        background: 'rgb(200, 200, 200)'
                    }
                }}
            // onClick={() => searchFunction()}
            >
                Apply Filters
            </Button>
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
                    if (publicPrivate === result.public) {
                        return <TableRow id={result.datasetName} key={result.datasetName}>
                            <TableCell>
                                <Result result={result} />
                            </TableCell>
                        </TableRow>
                    }
                })}
            </TableBody>
        </Table>

    </div >)

}