import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, TableRow, TableCell } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";


import { GetGroups } from '../apiFolder/GroupAPI';

export const Groups = (props) => {
    const navigate = useNavigate();

    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        console.log("Group Start")
        GetGroups({}).then(async (res) => {
            setGroups(res);
        }).finally(() => setTimeout(() => setLoadingGroups(false), 3000))
    }, []);
    return <div className='darkblue'>
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
                            Groups
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/*Animated Class while people wait for database response*/}
                {loadingGroups && <TableBody sx={{ background: '#fff' }}>
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

                {!loadingGroups && <TableBody
                    sx={{
                        background: 'rgb(200, 200, 200)'
                    }}>
                    {groups.map((group) => {
                        return <TableRow id={group.name} key={group.name}>
                            <TableCell onClick={() => navigate(`/groups/${group.id}`)}>
                                {/* SHOULD OPEN PROFILE??? NAVIGATE TO PAGE??? */}
                                {group.name}
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>}
            </Table>
        </Box>
    </div>
}