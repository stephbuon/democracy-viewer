import { GroupResultModal } from './GroupResultModal';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

export const GroupResult = (props) => {
    const [group, setGroup] = useState(props.result);
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const handleOpen = () => setOpen(true);

    const updateGroup = (ds) => {
        setGroup(ds);
        props.setGroup(ds);
    }

    useEffect(() => {
        setGroup(props.result);

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
                {group.name}
            </Box>

            <GroupResultModal
                group={group}
                setGroup={updateGroup}
                open={open}
                setOpen={setOpen}
                loggedIn={loggedIn}
                { ...props }
            />
    </div>
}