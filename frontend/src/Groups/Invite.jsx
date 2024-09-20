import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { Table, TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';


import { useState } from 'react';
import { SendInvite } from '../apiFolder/GroupAPI';


export const Invite = (props) => {

    const [username, setUsername] = useState('');
    const [sentInvite, setSentInvite] = useState(false)

    const SendIn = (invite) => {
        SendInvite(invite).then(async (res) => {
            setSentInvite(true);
        })
    }

    return <div>
        <Box
            sx={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                height: "70%",
                overflow: "scroll",
                width: "70%",
                bgcolor: 'background.paper',
                border: '1px solid #000',
                borderRadius: ".5em .5em",
                
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Table>
                <TableBody>
                    <TableRow >
                        <TableCell >
                            <TextField
                                sx={{ marginTop: '2em' }}
                                label="Username"
                                variant="filled"
                                value={username}
                                onChange={event => { setUsername(event.target.value) }}
                            />
                        </TableCell>
                    </TableRow>

                    <TableRow >
                        <TableCell >
                            <Button
                                // endIcon={SendIcon}
                                onClick={() => SendIn({ username, private_group: props.groupid })}
                            >
                                Send
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {/* {sentInvite && <LoadingButton></LoadingButton>} */}
        </Box>
    </div>
}