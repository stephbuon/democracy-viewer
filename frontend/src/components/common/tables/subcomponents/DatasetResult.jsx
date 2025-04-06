
import { ResultModal } from '../ResultModal';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export const Result = (props) => {
    const [dataset, setDataset] = useState(props.result);
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleOpen = () => setOpen(true);

    const updateDataset = (ds) => {
        setDataset(ds);
        props.setDataset(ds);
    }

    useEffect(() => {
        setDataset(props.result);

        const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV && demoV.user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [props.result]);

    return <div>
            <Box 
                onClick={() => handleOpen()}
                sx={{
                    "&:hover": {
                        "cursor": "pointer"
                    }
                }}
            >
                {dataset.title}
            </Box>
            
            <ResultModal
                dataset={dataset}
                setDataset={updateDataset}
                open={open}
                setOpen={setOpen}
                loggedIn={loggedIn}
                { ...props }
            />
    </div>
}
