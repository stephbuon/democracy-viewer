import { useEffect, useState } from "react";
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { Avatar, ListItemText } from '@mui/material';
import { LinkedIn, Email, PermIdentity, Person, Title, Menu, Home, Search } from '@mui/icons-material'
import CardMedia from '@mui/material/CardMedia';
import { getUser } from "../api/users";
import { useParams } from "react-router-dom";
import { EditProfile } from "./EditProfile";
import Button from '@mui/material/Button';
import { DatasetTable } from "../common/DatasetTable";
import { FilterDatasets, FilterDatasetsCount } from '../apiFolder/DatasetSearchAPI';

const mdTheme = createTheme();

const Profile = (props) => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const [user, setUser] = useState(undefined);
    const [editable, setEditable] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const [loadingResults, setLoadingResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [pageFilter, setPageFilter] = useState(null);
    const [totalNumOfPages, setTotalNumOfPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loadingNextPage, setLoadingNextPage] = useState(false);

    const setDataset = () => {

    }

    const GetNewPage = (num) => {
        const filter = {
            username: props.currUser.username,
            pageLength: 2
        };
        setLoadingResults(true);
        FilterDatasets(filter, num).then((res) => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }
        })
       setPage(num);
    }

    const params = useParams();

    useEffect(() => {
        if (params.username) {
            getUser(params.username).then(x => setUser(x));
            if (props.currUser.username === params.username) {
                setEditable(true);
            }
        }
        else {
            getUser(props.currUser.username).then(x => setUser(x));
            setEditable(true);
        }

        const filter = {
            username: props.currUser.username,
            pageLength: 2
        };
        setLoadingResults(true);
        FilterDatasets(filter, 1).then((res) => {
            setLoadingResults(false);

            if (!res) { setSearchResults([]) }
            else { setSearchResults(res) }
        })
        FilterDatasetsCount(filter).then(async (res) => {
            let tot = Math.ceil(res / 2);
            setTotalNumOfPages(tot);
            console.log("Number of Pages", tot);
        })
    }, [params.username]);

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
                        overflow: 'auto',
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Grid container spacing={3} justifyContent="center" alignItems="center">
                            {/* User information */}
                            <Grid item xs={12} md={8}>
                                <Paper
                                    elevation={12}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        height: 240,
                                        width: '100%',
                                    }}
                                >
                                    {/* User avatar */}
                                    <Avatar alt={user.username} src="/static/images/avatar/2.jpg" sx={{ width: 100, height: 100 }} />
                                    <Divider flexItem sx={{ mt: 2, mb: 4 }} />
                                    <Typography variant="h4" component="h4">
                                        {user.first_name} {user.last_name} {user.suffix}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4} lg={3}>
                                <Paper
                                    elevation={12}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: 240,
                                    }}
                                >
                                    <List>
                                        <ListItemText>
                                            <Person /> username - {user.username}
                                        </ListItemText>
                                        {user.orcid && (
                                            <ListItemText>
                                                <PermIdentity /> OrcID - {(user.orcid.match(/.{1,4}/g) || []).join("-")}
                                            </ListItemText>
                                        )}
                                        {user.title && (
                                            <ListItemText>
                                                <Title /> {user.title}
                                            </ListItemText>
                                        )}
                                        {user.linkedin_link && (
                                            <ListItemText>
                                                <LinkedIn color="primary" /> <Link href={user.linkedin_link}>{user.linkedin_link}</Link>
                                            </ListItemText>
                                        )}
                                        {user.website && (
                                            <ListItemText>
                                                <Link href={user.website}>{user.website}</Link>
                                            </ListItemText>
                                        )}
                                        {user.email && (
                                            <ListItemText>
                                                <Email /> <Link href={`mailto: ${user.email}`}>{user.email}</Link>
                                            </ListItemText>
                                        )}
                                        {editable === true && (
                                            <ListItemText>
                                                <Button
                                                    variant="contained"
                                                    component="label"
                                                    sx={{ mb: 5, bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
                                                    onClick={() => setModalOpen(true)}
                                                >
                                                    Edit Profile
                                                </Button>
                                            </ListItemText>
                                        )}
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid container spacing={3} justifyContent="center" alignItems="center">
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
                                        setDataset={setDataset}
                                        page={page}
                                        totalNumOfPages={totalNumOfPages}
                                        GetNewPage={GetNewPage}
                                        editable={editable}
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