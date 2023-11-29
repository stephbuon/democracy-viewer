import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { GetDownloadProgress } from '../apiFolder/UploadDownloadProgressAPI';
import { DownloadSubset, GetNumOfEntries, GetSubsetOfDataByPage } from '../apiFolder/SubsetSearchAPI';


//Other Imports

let FileSaver = require('file-saver');

export const DownloadProgress = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    const [query, setQuery] = useState(undefined);
    const [progress, setProgress] = useState(0);
    const [numPages, setNumPages] = useState(undefined);
    const [entries, setEntries] = useState([]);
    const [ping, setPing] = useState(true)

    useEffect(() => {
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        let _query = demoV.downloadData
        _query.search = _query.search ? _query.search + "&pageLength=1000" : _query.search + "?pageLength=1000"
        setQuery(_query)
    }, []);

    useEffect(() => {
        console.log("DOWNLOADING",query)
        if (query != undefined)
        {
            GetNumOfEntries(query).then(res => {
                setNumPages(res / 1000)
            })
            // DownloadSubset(query).then((res) => {
            //     let blob = new Blob([...res], { type: "text/plain;charset=utf-8" });
            //     FileSaver.saveAs(blob, `${query.table_name}${query.search}.csv`);
            // }).then(() => {setPing(false)})
            // GetProgress()
            // while(progress < 100)
            // {
            //     // if(!loading)
            //     // {
            //     //     setLoading(true)
            //         // setTimeout(GetProgress(), 1000);
            //         setTimeout(() => {
            //             console.log("here")
            //             // GetProgress();
            //         }, 1000)
            //     //     GetProgress()
            //     // }
            // }
        }
    }, [query])
    useEffect(() => {
        console.log("DOWNLOADING",query)
        if(numPages)
        {
            for(let i = 0; i < numPages; i++)
            {
                GetSubsetOfDataByPage(query, i).then(async (res) => {
                    let _entries = [...entries, ...res]
                    setEntries(_entries)
                    setProgress(i / numPages * 100)
                })
            }            
        }
    }, [numPages])

    function convertToCSV(arr) {
        const array = [Object.keys(arr[0])].concat(arr)
      
        return array.map(it => {
          return Object.values(it).toString()
        }).join('\n')
    }

    useEffect(() => {
        console.log("entries",entries)
        if(entries.length === 1000 * numPages)
        {
            setProgress(100)
            let blob = new Blob([convertToCSV(entries)], { type: "text/plain;charset=utf-8" });
            FileSaver.saveAs(blob, `${query.table_name}${query.search}.csv`);
        }
    }, [entries])
    


    const GetProgress = () => {
        // setThingy(thingy+1)
        if(ping)
        {
            GetDownloadProgress(query).then((currProgress) => {
                console.log(currProgress)
                if (currProgress.current_page == undefined)
                    setProgress(0)
                else
                    setProgress(currProgress.current_page / currProgress.total_pages * 100)        
                }).finally(() => {
                if (progress >= 100)
                {
                    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
                    demoV.downloadData = undefined
                    localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
                }
            })  
        }
    }

    return (
        <Box className="col-6 m-auto align-middle h-100">

            <Box className="justify-content-center text-center">
                Download Progress
            </Box>
            <Box className="justify-content-center">
                <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Box className="justify-content-center text-center">
                {numPages}
            </Box>
        </Box>

    )


}