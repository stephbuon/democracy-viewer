import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { Table, TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';


import { useState } from 'react';
import { UpdateGroup } from '../apiFolder/GroupAPI';

export const Settings = (props) => {
    const [description, setDescription] = useState('');


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
                borderRadius: ".5em .5em"
            }}
        >
            <Table>
                <TableBody>
                    <TableRow >
                        <TableCell >
                            <TextField
                                sx={{ marginTop: '2em' }}
                                label="Description"
                                variant="filled"
                                value={description}
                                onChange={event => { setDescription(event.target.value) }}
                            />
                        </TableCell>
                    </TableRow>

                    <TableRow >
                        <TableCell >
                            <Button
                                // endIcon={SendIcon}
                                onClick={() => UpdateGroup(props.groupid, {description} )}
                            >
                                Send
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Box>
    </div>
}