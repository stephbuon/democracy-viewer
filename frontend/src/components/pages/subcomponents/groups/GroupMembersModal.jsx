import {
    Box, Button, Modal,
    Typography
} from '@mui/material';
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { editGroupMember, getGroupMembers } from '../../../../api';
import { AlertDialog } from '../../../common';
import { GroupMemberEdit } from './GroupMemberEdit';
import { member_ranks } from './member_ranks';

const pageLength = 5;

export const GroupMembersModal = (props) => {
    const [members, setMembers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);

    // Editing a record
    const [editOpen, setEditOpen] = useState(false);
    const [editMember, setEditMember] = useState(undefined);
    const [editRank, setEditRank] = useState(4);
    const [editDisabled, setEditDisabled] = useState(false);
    const [editRefresh, setEditRefresh] = useState(true);

    const handleClose = () => props.setOpen(false);

    const getNewPage = async(newPage) => {
        const res = await getGroupMembers(props.memberRecord.private_group, newPage);

        if (res.results.length > 0 && res.results.length < pageLength) {
            const tempMembers = [ ...res.results ];
            while (tempMembers.length < pageLength) {
                tempMembers.push({
                    "name": ""
                });
            }
            setMembers(tempMembers)
        } else {
            setMembers(res.results);
        }
        
        if (res.total) {
            setTotalMembers(res.total);
        }
    }

    const onPage = async(event) => {
        setLoading(true);
        await getNewPage(event.page + 1);
        setFirst(pageLength * event.page);
        setLoading(false);
    }

    const clickEditMember = (x) => {
        setEditMember(x);
        setEditRank(x.member_rank);
        setEditOpen(true);
    }

    const submitEditMember = async() => {
        await editGroupMember(editMember.private_group, editMember.member, { member_rank: editRank });
        setEditRefresh(true);
    }

    useEffect(() => {
        if (props.open && editRefresh) {
            getNewPage(1);
            setEditRefresh(false);
        } else if (!props.open && !editRefresh) {
            setEditRefresh(true);
        }
    }, [props.open, editRefresh]);

    useEffect(() => {
        if (editMember) {
            setEditDisabled(editMember.member_rank === editRank);
        }
    }, [editMember, editRank]);

    return <>
        <AlertDialog
            open={editOpen}
            setOpen={setEditOpen}
            titleText={`Edit Member "${ editMember ? editMember.name : "" }"`}
            bodyText={
                <GroupMemberEdit
                    adminRecord={props.memberRecord}
                    memberRecord={editMember}
                    newRank={editRank}
                    setNewRank={setEditRank}
                    setOpen={setEditOpen}
                    setRefresh={setEditRefresh}
                />
            }
            action={submitEditMember}
            disabled={editDisabled}
        />

        <Modal
            open={props.open}
            onClose={() => handleClose()}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '7.5%',
                    left: '15%',
                    height: "75%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                    // paddingBottom: "15px"
                }}
            >
                {/* <Typography variant = "h3">Group Members</Typography> */}
                <DataTable
                    value={members}
                    scrollable
                    // scrollHeight="80vh"
                    showGridlines
                    stripedRows
                    lazy
                    paginator
                    rows={pageLength}
                    totalRecords={totalMembers}
                    onPage={onPage}
                    first={first}
                    emptyMessage="No Members Found"
                >
                    {
                        props.memberRecord.member_rank < 3 &&
                        <Column
                            key="edit"
                            header="Edit"
                            body={x => {
                                if (x.member_rank > props.memberRecord.member_rank) {
                                    return <Button
                                        variant="contained"
                                        component="label"
                                        sx={{ bgcolor: 'cadetblue', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                                        onClick={() => clickEditMember(x)}
                                    >
                                        Edit
                                    </Button>
                                } else {
                                    return <></>
                                }
                            }}
                        />
                    }
                    
                    <Column
                        key={"name"}
                        field={"name"}
                        header={"Name"}
                    />
                    
                    <Column
                        key={"email"}
                        field={"member"}
                        header={"Email"}
                    />

                    <Column
                        key={"rank"}
                        field={"member_rank"}
                        header={"Role"}
                        body={x => {
                            if (Object.keys(member_ranks).includes(String(x.member_rank))) {
                                return member_ranks[x.member_rank];
                            } else {
                                return <>&nbsp;</>;
                            }
                        }}
                    />
                </DataTable>
            </Box>
        </Modal>
    </>
}