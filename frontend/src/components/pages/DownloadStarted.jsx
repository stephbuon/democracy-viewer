import { Container } from "@mui/material";
import { DownloadSubset, DownloadIds } from "../../api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"

export const DownloadStarted = () => {
    const params = useParams();

    const [message, setMessage] = useState(undefined);

    useEffect(() => {
        try {
            if (params.type === "full") {
                const data = JSON.parse(localStorage.getItem("democracy-viewer"));

                DownloadSubset(data.dataset.table_name).then(res => window.open(res.url));
            } else if (params.type === "subset") {
                const data = JSON.parse(localStorage.getItem("democracy-viewer"));

                DownloadSubset(data.dataset.table_name, data.downloadData).then(res => window.open(res.url));
            } else if (params.type === "ids") {
                const data = JSON.parse(localStorage.getItem("selected"));

                DownloadIds(data.dataset, data.ids).then(res => window.open(res.url));;
            } else {
                setMessage(`Unrecognized download type: ${ params.type }.`);
            }
        } catch {
            setMessage("The download parameters have not been set.");
        }
        
    }, []);

    return <>
        <Container maxWidth="sm" sx = {{"mt": "100px", textAlign: "center"}}>
            {
                message === undefined && (
                    <p style={{ fontSize: "16px"}}>
                        Your download has started! Depending on the size of the dataset, this may take a few minutes. Please leave this tab open until your file has been downloaded.
                    </p>
                )
            }
            
            {
                message !== undefined && (
                    <p style={{fontSize: "16px"}}>
                        { message }
                    </p>
                )
            }
        </Container>
    </>
}