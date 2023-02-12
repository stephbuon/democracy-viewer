import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI imports
import Box from '@mui/material/Box';


import './DisplayResults.css';
export const DisplayResults = (props) => {

    const [results] = useState(props.results)

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
    }, []);


    return (<Box
        mt={'5em'}
        sx={{
            display: "flex"
        }}
    >
        {results.map(() => {
            return <Box 
                className="displayRow"
                sx={{
                    
                    minWidth: '80%'
                }}
            >
                Display results here? Not exactly sure how this should go down
            </Box>
        })}
    </Box >)

}