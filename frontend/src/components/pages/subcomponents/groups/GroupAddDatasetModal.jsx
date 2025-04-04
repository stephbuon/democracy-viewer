import { Box, Modal, Typography } from "@mui/material";
import { FilterDatasets } from "../../../../api";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const pageLength = 10;

export const GroupAddDatasetModal = ({ open, setOpen, memberRecord }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumOfResults, setTotalNumOfResults] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        if (memberRecord) {
            getNewPage(1);
        }
        
    }, [memberRecord]);

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
                >
                    <Column
                        key={"title"}
                        field={"title"}
                        header={"Title"}
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
            </Box>
        </Modal>
    );
};