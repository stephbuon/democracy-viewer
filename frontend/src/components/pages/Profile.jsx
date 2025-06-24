import { useEffect, useState } from "react";
import { 
    Paper, Grid, Container, Typography, Box, CssBaseline, 
    createTheme, ThemeProvider, Button, Link as MuiLink
} from '@mui/material';
import { LinkedIn, Email, PermIdentity, Work, Language } from '@mui/icons-material';
import { getUser, deleteAccount, FilterDatasets, FilterDatasetsCount, filterGraphs, filterGraphsCount } from "../../api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { EditProfile } from "./subcomponents/profile";
import { AlertDialog } from "../common/AlertDialog";
import { SuggestChangesTable, DatasetTable, GraphTable } from "../common/tables";

const mdTheme = createTheme({
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h3: {
            fontSize: '2.5rem',
            fontWeight: 500,
            color: 'black',
            marginBottom: '1.5rem',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'black',
            marginBottom: '1rem',
        },
        body2: {
            color: 'text.secondary'
        }
    },
    palette: {
        background: {
            default: '#f8f9fa',
        },
        primary: {
            main: '#1976d2',
        },
        text: {
            secondary: '#666',
        }
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: 500,
                }
            }
        }
    }
});

const pageLength = 5;

export const Profile = (props) => {
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

    const [loadingResultsGraph, setLoadingResultsGraph] = useState(false);
    const [searchResultsGraph, setSearchResultsGraph] = useState([]);
    const [totalNumOfResultsGraph, setTotalNumOfResultsGraph] = useState(0);

    const [loadingLikeResultsGraph, setLoadingLikeResultsGraph] = useState(false);
    const [likeSearchResultsGraph, setLikeSearchResultsGraph] = useState([]);
    const [totalNumOfLikeResultsGraph, setTotalNumOfLikeResultsGraph] = useState(0);

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

    const GetNewPageGraph = (num) => {
        const filter = {
            user: params.email,
            pageLength
        };
        setLoadingResultsGraph(true);
        filterGraphs(filter, num).then((res) => {
            setLoadingResultsGraph(false);
            if (!res) { setSearchResultsGraph([]) }
            else { setSearchResultsGraph(res) }
        });

        filterGraphsCount(filter).then(async (res) => {
            setTotalNumOfResultsGraph(res);
        });
    }

    const getNewLikePageGraph = (num) => {
        const filter = {
            liked: params.email,
            pageLength
        };
        setLoadingLikeResults(true);
        filterGraphs(filter, num).then((res) => {
            setLoadingLikeResultsGraph(false);
            if (!res) { setLikeSearchResultsGraph([]) }
            else { setLikeSearchResultsGraph(res) }
        });

        filterGraphsCount(filter).then(async (res) => {
            setTotalNumOfLikeResultsGraph(res);
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
        GetNewPageGraph(1);
        getNewLikePageGraph(1);
    }, [params.email, props.currUser]);

    if (!user) {
        return <></>
    }

    const InfoLine = ({ icon, label, value, isLink = false, href }) => {
        if (!value) return null;
        
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '0.5rem 0',
                fontSize: '1rem',
                justifyContent: 'center',
                gap: 1
            }}>
                {icon}
                <Typography component="span" sx={{ fontWeight: 500, marginRight: '0.5rem', color: '#666' }}>
                    {label}:
                </Typography>
                {isLink ? (
                    <MuiLink component={Link} to={href} sx={{ 
                        textDecoration: 'none', 
                        color: '#1976d2',
                        '&:hover': { textDecoration: 'underline' }
                    }}>
                        {value}
                    </MuiLink>
                ) : (
                    <Typography component="span" sx={{ color: 'black' }}>{value}</Typography>
                )}
            </Box>
        );
    };

    return (
        <ThemeProvider theme={mdTheme}>
            <CssBaseline />
            <Box sx={{ 
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
                py: 4
            }}>
                <Container maxWidth="lg">
                    {/* Profile Header */}
                        <Typography 
                            variant="h3" 
                            component="h2" 
                            gutterBottom 
                            sx={{ paddingTop: '4rem', textAlign: 'center' }}
                            >
                            {user.first_name} {user.last_name} {user.suffix}
                        </Typography>
                        
                        <Box sx={{ marginBottom: '2rem' }}>
                            <InfoLine 
                                icon={<Email />} 
                                label="Email" 
                                value={user.email}
                                isLink={true}
                                href={`mailto:${user.email}`}
                            />
                            <InfoLine 
                                icon={<Work />} 
                                label="Title" 
                                value={user.title}
                            />
                            <InfoLine 
                                icon={<LinkedIn />} 
                                label="LinkedIn" 
                                value={user.linkedin_link}
                                isLink={true}
                                href={user.linkedin_link}
                            />
                            <InfoLine 
                                icon={<Language />} 
                                label="Website" 
                                value={user.website}
                                isLink={true}
                                href={user.website}
                            />
                            <InfoLine 
                                icon={<PermIdentity />} 
                                label="OrcID" 
                                value={user.orcid ? (user.orcid.match(/.{1,4}/g) || []).join("-") : null}
                            />
                        </Box>

                        {editable && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: '1rem',
                                marginTop: '2rem',
                                paddingBottom: '2rem'
                            }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setModalOpen(true)}
                                    sx={{ 
                                        minWidth: '160px',
                                        px: 3,
                                        py: 1,
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#1565c0'
                                        }
                                    }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setDeleteOpen(true)}
                                    sx={{ 
                                        minWidth: '160px',
                                        px: 3,
                                        py: 1,
                                        borderColor: '#d32f2f',
                                        color: '#d32f2f',
                                        '&:hover': {
                                            backgroundColor: '#d32f2f',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    Delete Account
                                </Button>
                            </Box>
                        )}

                    {/* Content Sections */}
                    <Grid container spacing={3}>
                        {/* Datasets Section */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                <Typography variant="h4" component="h3" sx={{ 
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    My Datasets
                                </Typography>
                                <DatasetTable
                                    // loadingResults={loadingResults}
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

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                <Typography variant="h4" component="h3" sx={{ 
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Bookmarked Datasets
                                </Typography>
                                <DatasetTable
                                    // loadingResults={loadingLikeResults}
                                    searchResults={likeSearchResults}
                                    setDataset={props.setDataset}
                                    GetNewPage={getNewLikePage}
                                    editable={false}
                                    totalNumResults={totalNumOfLikeResults}
                                    pageLength={pageLength}
                                />
                            </Paper>
                        </Grid>

                        {/* Graphs Section */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                <Typography variant="h4" component="h3" sx={{ 
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    My Visualizations
                                </Typography>
                                <GraphTable
                                    // loadingResults={loadingResultsGraph}
                                    searchResults={searchResultsGraph}
                                    setDataset={props.setDataset}
                                    GetNewPage={GetNewPageGraph}
                                    editable={editable}
                                    totalNumResults={totalNumOfResultsGraph}
                                    pageLength={pageLength}
                                    deleteCallback={() => GetNewPageGraph(1)}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                <Typography variant="h4" component="h3" sx={{ 
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    Bookmarked Visualizations
                                </Typography>
                                <GraphTable
                                    // loadingResults={loadingLikeResultsGraph}
                                    searchResults={likeSearchResultsGraph}
                                    setDataset={props.setDataset}
                                    GetNewPage={getNewLikePageGraph}
                                    editable={false}
                                    totalNumResults={totalNumOfLikeResultsGraph}
                                    pageLength={pageLength}
                                />
                            </Paper>
                        </Grid>

                        {/* Suggestions Section - Only show if editable */}
                        {editable && (
                            <>
                                <Grid item xs={12}>
                                    <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                        <Typography variant="h4" component="h3" sx={{ 
                                            borderBottom: '1px solid #e0e0e0',
                                            paddingBottom: '0.5rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            Received Suggestions
                                        </Typography>
                                        <SuggestChangesTable
                                            pageLength={pageLength}
                                            type={"for"}
                                            refresh={refreshSuggestions}
                                            setRefresh={setRefreshSuggestions}
                                            setDataset={props.setDataset}
                                        />
                                    </Paper>
                                </Grid>

                                <Grid item xs={12}>
                                    <Paper sx={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'white' }}>
                                        <Typography variant="h4" component="h3" sx={{ 
                                            borderBottom: '1px solid #e0e0e0',
                                            paddingBottom: '0.5rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            Pending Sent Suggestions
                                        </Typography>
                                        <SuggestChangesTable
                                            pageLength={pageLength}
                                            type={"from"}
                                            refresh={refreshSuggestions}
                                            setRefresh={setRefreshSuggestions}
                                            setDataset={props.setDataset}
                                        />
                                    </Paper>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Container>

                {/* Modals */}
                <EditProfile 
                    user={user} 
                    setUser={setUser} 
                    open={modalOpen} 
                    setOpen={setModalOpen} 
                />
                
                <AlertDialog
                    open={deleteOpen}
                    setOpen={setDeleteOpen}
                    titleText={`Are you sure you want to delete your account?`}
                    bodyText={"This action cannot be undone."}
                    action={() => onDelete()}
                />
            </Box>
        </ThemeProvider>
    );
}

export default Profile;