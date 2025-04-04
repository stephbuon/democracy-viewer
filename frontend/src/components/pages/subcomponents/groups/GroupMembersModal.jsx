import {
    Box, Modal,
    Typography
} from '@mui/material';
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { getGroupMembers } from '../../../../api';

const pageLength = 10;

export const GroupMembersModal = (props) => {
    const [members, setMembers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleClose = () => props.setOpen(false);

    const getNewPage = async(newPage) => {
        const res = await getGroupMembers(props.group.id, newPage);

        if (res.results.length < pageLength) {
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

    useEffect(() => {
        getNewPage(1);
    }, [props.open]);

    return <>
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
                            let role = "";
                            switch (x.member_rank) {
                                case 1:
                                    role = "Owner";
                                    break;
                                case 2:
                                    role = "Admin";
                                    break;
                                case 3:
                                    role = "Editor";
                                    break;
                                case 4:
                                    role = "Member"
                                    break;
                                default:
                                    role = <>&nbsp;</>;
                            }

                            return role;
                        }}
                    />
                </DataTable>
            </Box>
        </Modal>
    </>
}