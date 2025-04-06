import { Box, Button, Modal, Typography } from "@mui/material";
import { FilterDatasets, addDatasetsToGroup, removeDatasetsFromGroup } from "../../../../api";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const pageLength = 5;

export const GroupAddDatasetModal = ({ open, setOpen, memberRecord, updateDatasets }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumOfResults, setTotalNumOfResults] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [memberDatasets, setMemberDatasets] = useState([]);
    const [refreshDatasets, setRefreshDatasets] = useState(true);
    const [selectedDatasets, setSelectedDatasets] = useState([]);
    const [addedDatasets, setAddedDatasets] = useState([]);
    const [removedDatasets, setRemovedDatasets] = useState([]);

    const getNewPage = async(page) => {
        const res = await FilterDatasets({ email: memberRecord.member, pageLength }, page);
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

    const getMemberDatasets = async() => {
        let datasets = [];
        let total = undefined;
        let page = 1;

        const getMoreDatasets = async() => {
            const res = await FilterDatasets({ email: memberRecord.member, group: memberRecord.private_group }, page);
            if (page === 1) {
                total = res.total;
                datasets = res.results;
            } else {
                datasets = [ ...datasets, ...res.results ];
            }

            page += 1;
        }
        
        while (total === undefined || datasets.length < total) {
            await getMoreDatasets();
        }

        setMemberDatasets(datasets);
        setRefreshDatasets(false);
    }

    const onSelectChange = (event) => {
        // setSelectedDatasets(event.value);

        let selected = [ ...selectedDatasets ];
        let additions = [ ...addedDatasets ];
        let deletions = [ ...removedDatasets ];
        searchResults.forEach(x => {
            // If selected
            if (event.value.some(y => x.table_name === y.table_name)) {
                // Add to selected
                if (selected.every(y => y.table_name !== x.table_name)) {
                    selected.push(x);
                }

                // Add to additions
                if (memberDatasets.every(y => y.table_name !== x.table_name) && !additions.includes(x.table_name)) {
                    additions.push(x.table_name);
                }

                // Remove from deletions
                if (deletions.includes(x.table_name)) {
                    deletions = deletions.filter(y => y !== x.table_name);
                }
            } else {
                // Remove from selected
                if (selected.some(y => y.table_name === x.table_name)) {
                    selected = selected.filter(y => y.table_name !== x.table_name);
                }

                // Remove from additions
                if (additions.includes(x.table_name)) {
                    additions = additions.filter(y => y !== x.table_name);
                }

                // Add to deletions
                if (memberDatasets.some(y => y.table_name === x.table_name) && !deletions.includes(x.table_name)) {
                    deletions.push(x.table_name);
                }
            }
        });

        setSelectedDatasets(selected);
        setAddedDatasets(additions);
        setRemovedDatasets(deletions);
    }

    const onSubmit = async() => {
        if (addedDatasets.length > 0) {
            await addDatasetsToGroup(memberRecord.private_group, addedDatasets);
        }
        
        if (removedDatasets.length > 0) {
            await removeDatasetsFromGroup(memberRecord.private_group, removedDatasets);
        }

        setRefreshDatasets(true);
        updateDatasets();
        onClose();
    }

    useEffect(() => {
        if (memberRecord) {
            if (refreshDatasets) {
                getMemberDatasets();
            }
            
            if (open) {
                getNewPage(1);
                setSelectedDatasets([ ...memberDatasets ]);
                setAddedDatasets([]);
                setRemovedDatasets([]);
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
                {/* <Typography variant="h6">Add Datasets to Group</Typography> */}
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
                    emptyMessage="No Datasets Found"
                    selectionMode="checkbox"
                    selection={selectedDatasets}
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
                    disabled={addedDatasets.length === 0 && removedDatasets.length === 0}
                >
                    Update Datasets
                </Button>
            </Box>
        </Modal>
    );
};