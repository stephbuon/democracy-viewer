import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Invite } from './Invite';
import { Settings } from './Settings';


import { GetMembers } from '../apiFolder/GroupAPI';

export const Group = (props) => {
    const params = useParams();
    const [groupid] = useState(params.groupid);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);

    const [loadingMembers, setLoadingMembers] = useState(true);
    const [members, setMembers] = useState([]);

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

    useEffect(() => {
        console.log("Group Start")
        GetMembers(groupid).then(async (res) => {
            setMembers(res);
        }).catch(() => {
            setMembers([{username:'None'}])
        }).finally(() => setTimeout(() => setLoadingMembers(false), 3000))
        }, []);
    return <div className='darkblue'>
        <Box
            sx={{
                background: 0xffffffff,
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Modal
                open={inviteOpen}
                onClose={() => endInviteMode()}
            >
                <Invite groupid={groupid}/>
            </Modal>
            <Modal
                open={settingsOpen}
                onClose={() => endSettinggseMode()}
            >
                <Settings groupid={groupid}/>
            </Modal>
            <Button onClick={() => settinggseMode()}
            sx={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)',
                '&:hover': {
                    background: 'rgb(200, 200, 200)'
                }
            }}>
                {/* make it have an end icon of the gear */}
                Settings
            </Button>
            <Button onClick={() => inviteMode()}
            sx={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)',
                '&:hover': {
                    background: 'rgb(200, 200, 200)'
                }
            }}>
                Invite
            </Button>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Table
                    sx={{
                        color: 'rgb(0, 0, 0)',
                        marginTop: '2rem',
                        width: .8,
                    }}
                >
                    <TableHead
                        sx={{
                            background: 'rgb(255, 255, 255)',
                        }}>
                        <TableRow>
                            <TableCell>
                                Members
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    {/*Animated Class while people wait for database response*/}
                    {loadingMembers && <TableBody sx={{ background: '#fff' }}>
                        <TableRow className='loadingData1'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData2'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData3'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData4'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData5'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData6'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData7'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                        <TableRow className='loadingData8'>
                            <TableCell>&nbsp;</TableCell>
                        </TableRow>
                    </TableBody>}

                    {!loadingMembers && <TableBody
                        sx={{
                            background: 'rgb(200, 200, 200)'
                        }}>
                        {members.map((member) => {
                            return <TableRow id={member.member} key={member.member}>
                                <TableCell>
                                    {/* SHOULD OPEN PROFILE??? NAVIGATE TO PAGE??? */}
                                    {member.member} 
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>}
                </Table>
            </Box>
    </div>
}