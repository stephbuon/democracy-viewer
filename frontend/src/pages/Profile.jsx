import { useEffect, useState } from "react";
import { 
    ListItemText, Paper, Grid, Container, Typography, List,
    Toolbar, Box, CssBaseline, createTheme, ThemeProvider, Button
} from '@mui/material';
import { LinkedIn, Email, PermIdentity, Person, Work, Language } from '@mui/icons-material';
import { getUser, deleteAccount } from "../api/users";
import { useNavigate, useParams, Link } from "react-router-dom";
import { EditProfile } from "./EditProfile";
import { DatasetTable } from "../common/tables/DatasetTable";
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';
import { AlertDialog } from "../common/AlertDialog";
import { SuggestChangesTable } from "../common/tables/SuggestChangesTable";

const mdTheme = createTheme();

const pageLength = 5;

const Profile = (props) => {
    const navigate = useNavigate();
    const params = useParams();

    const [user, setUser] = useState(undefined);
    const [editable, setEditable] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [loadingResults, setLoadingResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [totalNumOfResults, setTotalNumOfResults] = useState(0);

    const [loadingLikeResults, setLoadingLikeResults] = useState(false);
    const [likeSearchResults, setLikeSearchResults] = useState([]);
    const [totalNumOfLikeResults, setTotalNumOfLikeResults] = useState(0);

    const [suggestionsFor, setSuggestionsFor] = useState([]);
    const [suggestionsFrom, setSuggestionsFrom] = useState([]);
    const [refreshSuggestions, setRefreshSuggestions] = useState(false);

    const GetNewPage = (num) => {
        const filter = {
            user: params.email,
            pageLength
        };
        setLoadingResults(true);
        FilterDatasets(filter, num).then((res) => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }
        });

        FilterDatasetsCount(filter).then(async (res) => {
            setTotalNumOfResults(res);
        });
    }

    const getNewLikePage = (num) => {
        const filter = {
            liked: params.email,
            pageLength
        };
        setLoadingLikeResults(true);
        FilterDatasets(filter, num).then((res) => {
            setLoadingLikeResults(false);

            if (!res) { setLikeSearchResults([]) }
            else { setLikeSearchResults(res) }
        });

        FilterDatasetsCount(filter).then(async (res) => {
            setTotalNumOfLikeResults(res);
        });
    }

    const onDelete = () => {
        deleteAccount();
        props.logout();
        navigate("/");
    }

    useEffect(() => {
        if (params.email) {
            getUser(params.email).then(x => setUser(x));
            if (props.currUser && props.currUser.email === params.email) {
                setEditable(true);
            } else {
                setEditable(false);
            }
        }
        else if (props.currUser) {
            getUser(props.currUser.email).then(x => setUser(x));
            setEditable(true);
        } else {
            navigate("/");
        }

        GetNewPage(1);
        getNewLikePage(1);
    }, [params.email, props.currUser]);

    if (!user) {
        return <></>
    }

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
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
                            {/* User information */}
                            <Grid item xs={12} md={8}>
                                <Paper
                                    elevation={12}
                                    sx={{
                                        p: 2,
                                        m: 5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        // height: 320,
                                        width: '100%',
                                    }}
                                >
                                    {/* User avatar */}
                                    {/* <Avatar alt={user.email} src="/static/images/avatar/2.jpg" sx={{ width: 100, height: 100 }} />
                                    <Divider flexItem sx={{ mt: 2, mb: 4 }} /> */}
                                    <Typography variant="h3" component="h4">
                                        {user.first_name} {user.last_name} {user.suffix}
                                    </Typography>
                                    <List>
                                        {user.email && (
                                            <ListItemText>
                                                <Email /> Email: <Link to={`mailto: ${user.email}`}>{user.email}</Link>
                                            </ListItemText>
                                        )}
                                        {user.title && (
                                            <ListItemText>
                                                <Work />  Title: {user.title}
                                            </ListItemText>
                                        )}
                                        {user.linkedin_link && (
                                            <ListItemText>
                                                <LinkedIn /> LinkedIn: <Link to={user.linkedin_link}>{user.linkedin_link}</Link>
                                            </ListItemText>
                                        )}
                                        {user.website && (
                                            <ListItemText>
                                               <Language /> Website: <Link to={user.website}>{user.website}</Link>
                                            </ListItemText>
                                        )}
                                        {user.orcid && (
                                            <ListItemText>
                                                <PermIdentity /> OrcID: {(user.orcid.match(/.{1,4}/g) || []).join("-")}
                                            </ListItemText>
                                        )}
                                        
                                    </List>
                                    {
                                        editable === true && <>
                                            <Grid container justifyContent="center" sx={{ mb: 3, mt: 2 }}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Button
                                                        variant="contained"
                                                        component="label"
                                                        sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 , alignItems: 'center' }}
                                                        onClick={() => setModalOpen(true)}
                                                    >
                                                        Edit Profile
                                                    </Button>
                                                </Grid>

                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Button 
                                                        variant="contained"
                                                        component="label"
                                                        sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 , alignItems: 'center' }} 
                                                        onClick={() => setDeleteOpen(true)}
                                                    >
                                                        Delete Account
                                                    </Button>
                                                    <AlertDialog
                                                        open={deleteOpen}
                                                        setOpen={setDeleteOpen}
                                                        titleText={`Are you sure you want to delete your account?`}
                                                        bodyText={"This action cannot be undone."}
                                                        action={() => onDelete()}
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
                                    <h1>My Datasets</h1>
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
                            <Grid  item xs={12} md={6}>
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
                                    <h1>Bookmarked Datasets</h1>
                                    <DatasetTable
                                        loadingResults={loadingLikeResults}
                                        searchResults={likeSearchResults}
                                        setDataset={props.setDataset}
                                        GetNewPage={getNewLikePage}
                                        editable={false}
                                        totalNumResults={totalNumOfLikeResults}
                                        pageLength={pageLength}
                                    />
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
                                    <h1>Pending Sent Suggestions</h1>
                                    <SuggestChangesTable
                                        pageLength={pageLength}
                                        type={"from"}
                                        refresh={refreshSuggestions}
                                        setRefresh={setRefreshSuggestions}
                                    />
                                </Paper>
                            </Grid>
                            <Grid  item xs={12} md={6}>
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
                                    <h1>Recieved Suggestions</h1>
                                    <SuggestChangesTable
                                        pageLength={pageLength}
                                        type={"for"}
                                        refresh={refreshSuggestions}
                                        setRefresh={setRefreshSuggestions}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>

                    </Container>

                </Box>
            </Box>

            <EditProfile user={user} setUser={setUser} open={modalOpen} setOpen={setModalOpen} />
        </ThemeProvider>
    );
}

export default Profile;