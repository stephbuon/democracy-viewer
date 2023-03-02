import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { DisplayResults } from './DisplayResults/DisplayResults';

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GetSubsetOfData } from '../apiFolder/SubsetSearchAPI';



export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searched, setSearched] = useState(false);

    const searchFunction = () => {
        console.log("navigating")
        navigate(`/subsetsearch/${searchTerm}`)
        console.log("did not navigate from results page")

    }
    const handleKeyPress = event => {
        // console.log('User pressed: ', event.key);

        if (event.key === 'Enter') {
            console.log(searchTerm)
            navigate(`/subsetsearch/${searchTerm}`);
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
        <Box
            pt={2}
            sx={{
                background: 0xffffffff,
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Box
                sx={{
                    borderRadius: '.5em',
                    overflow: "hidden"
                }}>
                <TextField
                    id="searchTerm"
                    label="Search"
                    variant="filled"
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
                onClick={() => searchFunction()}
            >
                Search
            </Button>
        </Box>

        <DisplayResults
            results={searchResults} />

    </div >)

}