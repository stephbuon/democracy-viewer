import { AlertDialog, FormattedTextField } from "../common";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getGroupInvites, acceptGroupInvite } from "../../api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

const pageLength = 5;

export const GroupJoin = (props) => {
    // Invites table
    const [invites, setInvites] = useState([]);
    const [totalInvites, setTotalInvites] = useState(0);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);

    // Enter code
    const [viewOpen, setViewOpen] = useState(false);
    const [group, setGroup] = useState(undefined);
    const [code, setCode] = useState("");
    const [alert, setAlert] = useState(0);

    const navigate = useNavigate();

    const viewInvite = (x) => {
        setGroup(x.private_group);
        setViewOpen(true);
    }

    const submitCode = async () => {
        try {
            const record = await acceptGroupInvite(group, code);
            setAlert(1);
            navigate(`/groups/home/${ record.private_group }`);
        } catch (err) {
            console.error(err);
            setAlert(2);
        }
    }

    const loggedIn = () => {
        if (props.currUser) {
            return true;
        } else {
            const demoV = JSON.parse(localStorage.getItem("democracy-viewer"));
            if (demoV && demoV.user) {
                return true;
            } else {
                return false;
            }
        }
    };

    const getNewPage = async (newPage) => {
        const res = await getGroupInvites({ email: props.currUser.email, pageLength }, newPage);

        if (res.results.length > 0 && res.results.length < pageLength) {
            const tempInvites = [...res.results];
            while (tempInvites.length < pageLength) {
                tempInvites.push({
                    "name": ""
                });
            }
            setInvites(tempInvites)
        } else {
            setInvites(res.results);
        }

        if (res.total) {
            setTotalInvites(res.total);
        }
    }

    const onPage = async(event) => {
        setLoading(true);
        await getNewPage(event.page + 1);
        setFirst(pageLength * event.page);
        setLoading(false);
    }

    useEffect(() => {
        if (!loggedIn()) {
            props.setNavigated(true);
            navigate("/login");
        } else if (props.currUser) {
            getNewPage(1);
        }
    }, [props.currUser]);

    return <>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={alert > 0}
            autoHideDuration={6000}
            onClose={() => setAlert(0)}
        >
            <Alert onClose={() => setAlert(0)} severity={alert > 1 ? "error" : "success"} sx={{ width: '100%' }}>
                {alert === 1 && <>You successfully joined a group! You have been redirected to the group's home page.</>}
                {alert === 2 && <>Failed to join group. The provided code is invalid.</>}
            </Alert>
        </Snackbar>

        <AlertDialog
            open={viewOpen}
            setOpen={setViewOpen}
            titleText="Enter Code to Join Group"
            bodyText={
                <FormattedTextField
                    id="code"
                    label="Code"
                    maxChars={8}
                    fullWidth
                    required
                    setValue={setCode}
                />
            }
            action={submitCode}
            disabled={code.length === 0}
            delayClose
        />

        <Box sx={{ textAlign: "center", width: "80%", margin: "auto"}}>
            <Typography variant="h2">Pending Group Invites</Typography>

            <DataTable
                value={invites}
                scrollable
                // scrollHeight="80vh"
                showGridlines
                stripedRows
                lazy
                paginator
                rows={pageLength}
                totalRecords={totalInvites}
                onPage={onPage}
                first={first}
                emptyMessage="No Invites Found"
            >
                <Column
                    key="view"
                    header="View"
                    body={x => {
                        if (x.private_group) {
                            return <Button
                                variant="contained"
                                component="label"
                                sx={{ bgcolor: 'cadetblue', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                                onClick={() => viewInvite(x)}
                            >
                                View
                            </Button>
                        } else {
                            return <>&nbsp;</>
                        }
                        
                    }}
                />

                <Column
                    key="name"
                    header="Group Name"
                    field="name"
                />

                <Column
                    key="expires"
                    header="Invite Expires"
                    body={x => {
                        // Format the date based on the user's locale and timezone
                        const options = {
                            weekday: 'long', // e.g., "Monday"
                            year: 'numeric', // e.g., "2025"
                            month: 'long', // e.g., "April"
                            day: 'numeric', // e.g., "11"
                            hour: '2-digit', // e.g., "12"
                            minute: '2-digit', // e.g., "30"
                            second: '2-digit', // e.g., "45"
                            timeZoneName: 'short', // e.g., "PST"
                        };
                        try {
                            const rawDate = new Date(x.expires);
                            const humanReadableDate = new Intl.DateTimeFormat(navigator.language, options).format(rawDate);
                            return <>{ humanReadableDate }</>
                        } catch {
                            return <></>
                        }
                        
                    }}
                />
            </DataTable>
        </Box>
    </>
}