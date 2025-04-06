import { Box, Button, Modal, Typography } from "@mui/material";
import { filterGraphs, addGraphsToGroup, removeGraphsFromGroup } from "../../../../api";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const pageLength = 5;

export const GroupAddGraphModal = ({ open, setOpen, memberRecord, updateGraphs }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumOfResults, setTotalNumOfResults] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [memberGraphs, setMemberGraphs] = useState([]);
    const [refreshGraphs, setRefreshGraphs] = useState(true);
    const [selectedGraphs, setSelectedGraphs] = useState([]);
    const [addedGraphs, setAddedGraphs] = useState([]);
    const [removedGraphs, setRemovedGraphs] = useState([]);

    const getNewPage = async(page) => {
        const res = await filterGraphs({ user: memberRecord.member, pageLength }, page);
        setSearchResults(res.results);
        if (res.total) {
            setTotalNumOfResults(res.total);
        }
    }

    const onClose = () => setOpen(false);

    const onPage = async(event) => {
        setLoading(true);
        await getNewPage(event.page + 1);
        setFirst(pageLength * event.page);
        setLoading(false);
    }

    const getMemberGraphs = async() => {
        let graphs = [];
        let total = undefined;
        let page = 1;

        const getMoreGraphs = async() => {
            const res = await filterGraphs({ user: memberRecord.member, group: memberRecord.private_group }, page);
            if (page === 1) {
                total = res.total;
                graphs = res.results;
            } else {
                graphs = [ ...graphs, ...res.results ];
            }

            page += 1;
        }
        
        while (total === undefined || graphs.length < total) {
            await getMoreGraphs();
        }

        setMemberGraphs(graphs);
        setRefreshGraphs(false);
    }

    const onSelectChange = (event) => {
        // setSelectedGraphs(event.value);

        let selected = [ ...selectedGraphs ];
        let additions = [ ...addedGraphs ];
        let deletions = [ ...removedGraphs ];
        searchResults.forEach(x => {
            // If selected
            if (event.value.some(y => x.id === y.id)) {
                // Add to selected
                if (selected.every(y => y.id !== x.id)) {
                    selected.push(x);
                }

                // Add to additions
                if (memberGraphs.every(y => y.id !== x.id) && !additions.includes(x.id)) {
                    additions.push(x.id);
                }

                // Remove from deletions
                if (deletions.includes(x.id)) {
                    deletions = deletions.filter(y => y !== x.id);
                }
            } else {
                // Remove from selected
                if (selected.some(y => y.id === x.id)) {
                    selected = selected.filter(y => y.id !== x.id);
                }

                // Remove from additions
                if (additions.includes(x.id)) {
                    additions = additions.filter(y => y !== x.id);
                }

                // Add to deletions
                if (memberGraphs.some(y => y.id === x.id) && !deletions.includes(x.id)) {
                    deletions.push(x.id);
                }
            }
        });

        setSelectedGraphs(selected);
        setAddedGraphs(additions);
        setRemovedGraphs(deletions);
    }

    const onSubmit = async() => {
        if (addedGraphs.length > 0) {
            await addGraphsToGroup(memberRecord.private_group, addedGraphs);
        }
        
        if (removedGraphs.length > 0) {
            await removeGraphsFromGroup(memberRecord.private_group, removedGraphs);
        }

        setRefreshGraphs(true);
        updateGraphs();
        onClose();
    }

    useEffect(() => {
        if (memberRecord) {
            if (refreshGraphs) {
                getMemberGraphs();
            }
            
            if (open) {
                getNewPage(1);
                setSelectedGraphs([ ...memberGraphs ]);
                setAddedGraphs([]);
                setRemovedGraphs([]);
            }
        }
        
    }, [memberRecord, open]);

    return (
        <Modal open={open} onClose={onClose}>
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
                    textAlign: "center"
                }}
            >
                {/* <Typography variant="h6">Add Graphs to Group</Typography> */}
                <DataTable
                    value={searchResults}
                    scrollable
                    // scrollHeight="80vh"
                    showGridlines
                    stripedRows
                    lazy
                    paginator
                    rows={pageLength}
                    totalRecords={totalNumOfResults}
                    onPage={onPage}
                    first={first}
                    emptyMessage="No Graphs Found"
                    selectionMode="checkbox"
                    selection={selectedGraphs}
                    onSelectionChange={onSelectChange}
                    // dataKey="table_name"
                >
                    <Column
                        key="checkbox"
                        // header="In Group"
                        selectionMode = "multiple"
                    />

                    <Column
                        key="title"
                        field="title"
                        header="Title"
                    />

                    <Column
                        key="status"
                        field="is_public"
                        header="Status"
                        body={row => {
                            if (row.is_public === 1) {
                                return "Public";
                            } else {
                                return "Private";
                            }
                        }}
                    />
                </DataTable>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        color: 'white',
                        marginTop: '20px',
                        background: 'black'
                    }}
                    onClick={() => onSubmit()}
                    disabled={addedGraphs.length === 0 && removedGraphs.length === 0}
                >
                    Update Graphs
                </Button>
            </Box>
        </Modal>
    );
};