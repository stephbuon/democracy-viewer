import { useEffect, useState } from "react";
import { member_ranks } from "./member_ranks";
import { 
    Box, Button, FormControl, InputLabel,
    MenuItem, Select
 } from "@mui/material";

export const GroupMemberEdit = ({ adminRecord, newRank, setNewRank, setOpen, setRefresh }) => {
    const [validRanks, setValidRanks] = useState([]);

    const kickMember = async() => {
        setRefresh(true);
        setOpen(false);
    }

    useEffect(() => {
        const tempRanks = [];

        Object.keys(member_ranks).forEach(rankStr => {
            const rank = Number(rankStr);
            if (rank < adminRecord.member_rank) {
                tempRanks.push({
                    value: rank,
                    label: member_ranks[rank]
                });
            }
        });

        setValidRanks(tempRanks);
    }, [adminRecord]);

    return <>
        <Box>
            <Button 
                onClick={kickMember}
                variant="contained"
                primary
                sx={{
                    marginX: '3em',
                    borderRadius: 50, 
                    bgcolor: 'red', 
                    color: 'white', 
                }}
            >
                Kick Member
            </Button>

            <FormControl className="mb-3" fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                <InputLabel>Set Rank</InputLabel>
                <Select
                    value = {newRank}
                    onChange = {event => setNewRank(event.target.value)}
                >
                    {
                        validRanks.map(option => (
                            <MenuItem value = { option.value }>
                                { option.label }
                            </MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </Box>
    </>
}