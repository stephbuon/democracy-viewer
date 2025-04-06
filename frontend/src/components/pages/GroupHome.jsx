import { useEffect, useState } from "react";
import { 
    Paper, Grid, Container, Typography, 
    Toolbar, Box, CssBaseline, createTheme, ThemeProvider, Button, Modal
} from '@mui/material';
//import { getGroup, leaveGroup } from "../../api";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DatasetTable } from "../common/tables";
import { AlertDialog } from "../common/AlertDialog";
import { getGroup, getGroupMemberRecord, removeMemberFromGroup } from "../../api";
import { GroupMembersModal, GroupAddDatasetModal } from "./subcomponents/groups";

const mdTheme = createTheme();

const pageLength = 5;

export const GroupHome = (props) => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    
    // Get group data from location state (passed from Groups component)
    const [group, setGroup] = useState(undefined);
    const [editable, setEditable] = useState(true);
    const [membersModalOpen, setMembersModalOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [memberRecord, setMemberRecord] = useState(undefined);
    const [addDatasetOpen, setAddDatasetOpen] = useState(false);

    const [loadingResults, setLoadingResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumOfResults, setTotalNumOfResults] = useState(0);
    //const [DatasetSelectionModal, setDataModal] = useState(false);

    // Function to fetch datasets for this group
    const GetNewPage = async (selectedPage) => {
        setLoadingResults(true);
        // Fetch datasets logic here
        // Example:
        // const response = await getGroupDatasets(group.id, selectedPage, pageLength);
        // setSearchResults(response.data);
        // setTotalNumOfResults(response.total);
        setLoadingResults(false);
    };

    

    // Effect to load initial data
    useEffect(() => {
        if (location.state?.groupName) {
            // If coming from group creation, we already have the data
            setEditable(true);
        } else if (params.groupId) {
            // If accessing directly with URL parameter, fetch group data
            const fetchGroup = async () => {
                try {
                    //const response = await getGroup(params.groupId);
                    //setGroup(response);
                    setEditable(true); // Set based on user permissions
                } catch (error) {
                    console.error("Error fetching group:", error);
                }
            };
            fetchGroup();
        }
        
        // Load initial datasets
        GetNewPage(1);
    }, [params.groupId, location.state]);

    useEffect(() => {
        getGroup(params.groupId).then(x => setGroup(x));

        const dv = JSON.parse(localStorage.getItem('democracy-viewer'));
        getGroupMemberRecord(params.groupId, dv.user.email).then(x => setMemberRecord(x));
    }, []);

    useEffect(() => {
        if (group) {
            // getGroupMembers(group.id).then(x => setMembers(x));
        }
    }, [group]);

    const onLeave = () => {
        removeMemberFromGroup(group.id, memberRecord.member).then(x => navigate("/groups"));
    };

    if (!group) {
        return <></>
    }

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex'}}>
                <CssBaseline />

                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto'
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
                        <Grid container spacing={3} justifyContent="center" alignItems="center">
                            {/* Group information */}
                            <Grid item xs={12} md={8}>
                                <Paper
                                    elevation={12}
                                    sx={{
                                        p: 2,
                                        m: 5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Typography variant="h3" component="h4">
                                        {group.name}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
                                        {group.description}
                                    </Typography>
                                    {
                                        editable === true && <>
                                            <Grid container justifyContent="center" sx={{ mb: 3, mt: 2 }}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Button
                                                        variant="contained"
                                                        component="label"
                                                        sx={{ bgcolor: 'cadetblue', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                                                        onClick={() => setMembersModalOpen(true)}
                                                    >
                                                        Group Members
                                                    </Button>
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Button 
                                                        variant="contained"
                                                        component="label"
                                                        sx={{ bgcolor: 'cadetblue', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }} 
                                                        onClick={() => setLeaveOpen(true)}
                                                    >
                                                        Leave Group
                                                    </Button>
                                                    <AlertDialog
                                                        open={leaveOpen}
                                                        setOpen={setLeaveOpen}
                                                        titleText={`Are you sure you want to leave this group?`}
                                                        bodyText={"This action cannot be undone."}
                                                        action={onLeave}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    }
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={12}
                                    sx={{
                                        p: 2,
                                        m: 5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                                        <Button 
                                            variant="contained"
                                            component="label"
                                            sx={{ bgcolor: 'cadetblue', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
                                            onClick={() => setAddDatasetOpen(true)} // Function to open dataset selection modal
                                        >
                                            Add Dataset
                                        </Button>
                                    </Box>
                                    <h2>Group Datasets</h2>
                                    <DatasetTable
                                        loadingResults={loadingResults}
                                        searchResults={searchResults}
                                        setDataset={props.setDataset}
                                        GetNewPage={GetNewPage}
                                        editable={editable}
                                        totalNumResults={totalNumOfResults}
                                        pageLength={pageLength}
                                        deleteCallback={() => GetNewPage(1)}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>

            {/* Note: EditProfile component was using undefined "user" variable - removed for now */}
            {/* If you need member management, implement a separate MemberManagement component */}
            <GroupMembersModal
                open={membersModalOpen}
                setOpen={setMembersModalOpen}
                group={group}
            />
            
            <GroupAddDatasetModal
                open={addDatasetOpen}
                setOpen={setAddDatasetOpen}
                memberRecord={memberRecord}
            />
        </ThemeProvider>
    );
}