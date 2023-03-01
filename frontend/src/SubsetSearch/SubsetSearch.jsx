import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import './SubsetSearch.css'


export const SubsetSearch = (props) => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const searchFunction = () => {
        console.log("navigating")
        navigate(`/subsetsearch/${searchTerm}`)
        console.log("did not navigate from search page")
    }
    const handleKeyPress = event => {
        console.log('User pressed: ', event.key);

        if (event.key === 'Enter') {
            console.log(searchTerm)
            navigate(`/subsetsearch/${searchTerm}`);
        }
    };
    useEffect(() => {

    }, []);


    return (<div className='darkblue'>
        <Box
            sx={{
                minHeight: 1,
                display: 'flex'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: .8
                }}
            >
                <TextField
                    id="searchTerm"
                    label="Search"
                    variant="filled"
                    fullWidth
                    sx={{
                        background: 'rgb(255, 255, 255)',
                        color: 'rgb(0, 0, 0)',
                        '&:active': {
                            color: 'rgb(0, 0, 0)'
                        }
                    }}
                    value={searchTerm}
                    onChange={event => { setSearchTerm(event.target.value) }}
                    // New Code to search with enter press
                    onKeyPress={event => handleKeyPress.bind(event)}
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
                    onClick={() => searchFunction()}
                >
                    Search
                </Button>
            </Box>
        </Box>

    </div >)

}