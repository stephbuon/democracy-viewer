import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Invite } from './Invite';
import { Settings } from './Settings';


export const Group = (props) => {
    const params = useParams();
    const [groupid] = useState(params.groupid);
    const [hardcodedGroup] = useState({id: 1, name: "Ryan's Group", members: ['Wes', 'Ryan'], owner: {username: 'rschafaer', id:1}})
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

    const inviteMode = () => {
        setInviteOpen(true)
    }
    const endInviteMode = () => {
        setInviteOpen(false)
    }
    
    const settinggseMode = () => {
        setSettingsOpen(true)
    }
    const endSettinggseMode = () => {
        setSettingsOpen(false)
    }

    const useEffect = (() => {
console.log("Group Start")
    }, []);
    return <div>
        <Modal
            open={inviteOpen}
            onClose={() => endInviteMode()}
        >
            <Invite />
        </Modal>
        <Modal
            open={settingsOpen}
            onClose={() => endSettinggseMode()}
        >
            <Settings />
        </Modal>
        <Button>
            {/* make it have an end icon of the gear */}
            Settings
        </Button>
        <Button onClick={() => inviteMode()}>
            Invite
        </Button>
    </div>
}