import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { GetDownloadProgress } from '../apiFolder/UploadDownloadProgressAPI';
import { DownloadSubset } from '../apiFolder/SubsetSearchAPI';


//Other Imports

let FileSaver = require('file-saver');

export const DownloadProgress = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    const [query, setQuery] = useState(undefined);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        setQuery(demoV.downloadData)
    }, []);

    useEffect(() => {
        console.log("DOWNLOADING",query)
        if (query != undefined)
        {
            DownloadSubset(query).then((res) => {
                let blob = new Blob([...res], { type: "text/plain;charset=utf-8" });
                FileSaver.saveAs(blob, `${query.table_name}${query.search}.csv`);
            })
            // while (progress < 100) 
            // {
            //     setTimeout(GetProgress(), 1000);
            // }
            GetProgress()
        }
    }, [query])

    const GetProgress = () => {
        GetDownloadProgress(query).then((currProgress) => {
            console.log(currProgress)
            // setProgress(currProgress * 100)
        })
        // //get progress every 1 second
        
        if (progress >= 100)
        {
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            demoV.downloadData = undefined
            localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
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