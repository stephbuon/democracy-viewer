import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { GetUploadProgress } from '../apiFolder/UploadDownloadProgressAPI';
import { UploadDataset, AddTextColumn, AddTags, UpdateMetadata } from '../apiFolder/DatasetUploadAPI';


//Other Imports


export const UploadProgress = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    const [query, setQuery] = useState(undefined);
    const [progress, setProgress] = useState(0);
    const [currDataset, setCurrDataset] = useState(undefined);
    const [file, setFile] = useState(undefined);

    useEffect(() => {

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
        try {
            if (demoV.uploadData) {
                console.log("demoV", demoV)
                setCurrDataset(demoV.uploadData);
                
            }
            else {
                console.log("back to home", file)
                navigate("/");
            }
        }
        catch
        {
            console.log("back to home", file)
            navigate("/");
        }

    }, []);

    useEffect(() => {
        if (currDataset != undefined)
        {
            // while (progress < 100) 
            // {
            //     setTimeout(GetProgress(), 1000);
            // }
            GetProgress()
        }
        
    }, [currDataset])

    const GetProgress = () => {
        GetUploadProgress({ table_name: currDataset }).then((currProgress) => {
            setProgress(currProgress * 100)
        })
        // //get progress every 1 second
        // 
        if (progress >= 100)
        {
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
            demoV.uploadData = undefined;
            localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
        }
    }

    return (
        <Box className="col-6 m-auto align-middle h-100">

            <Box className="justify-content-center text-center">
                Upload Progress
            </Box>
            <Box className="justify-content-center">
                <LinearProgress variant="determinate" value={progress} />
            </Box>
        </Box>

    )


}