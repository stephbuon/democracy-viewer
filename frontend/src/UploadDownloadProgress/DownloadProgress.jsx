import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

//Other Imports
import { DownloadSubset, DownloadFullDataset} from '../apiFolder/SubsetSearchAPI';


export const DownloadProgress = (props) => {
    const navigate = useNavigate();
    const params = useParams()
    
    const [progress, setProgress] = useState(0);
    

    let FileSaver = require('file-saver');

    useEffect(() => {
        console.log(props)
    }, []);

    return (
        <Box className="flex justify-content-center">
            <LinearProgress value={progress} />
        </Box>
    )

}