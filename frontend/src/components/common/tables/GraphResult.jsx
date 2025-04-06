
import { GraphResultModal } from './GraphResultModal';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export const GraphResult = (props) => {
    const [graph, setGraph] = useState(props.result);
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleOpen = () => setOpen(true);

    useEffect(() => {
        setGraph(props.result);

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
                {graph.title}
            </Box>
            
            <GraphResultModal
                graph={graph}
                setGraph={x => setGraph(x)}
                open={open}
                setOpen={setOpen}
                loggedIn={loggedIn}
                { ...props }
            />
    </div>
}
