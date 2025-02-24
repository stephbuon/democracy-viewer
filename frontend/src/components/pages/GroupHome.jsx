import React, { useState } from "react";
import { 
    Paper, Grid, Container, Typography, Modal, Table,
    Toolbar, Box, CssBaseline, createTheme, ThemeProvider, Button
} from '@mui/material';
import { getUser, leaveGroup} from "../../api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DatasetTable } from "../common/tables/DatasetTable";
import { AlertDialog } from "../common/AlertDialog";

export const GroupHome = ({ groupName, groupDescription, datasets, onAddDataset, onLeaveGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const onLeave = () => {
          leaveGroup();
          props.leave();
          navigate("/");
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
                ></Box>
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
                                    {
                                        editable === true && <>
                                            <Grid container justifyContent="center" sx={{ mb: 3, mt: 2 }}>

                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Button 
                                                        variant="contained"
                                                        component="label"
                                                        sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 , alignItems: 'center' }} 
                                                        onClick={() => setLeaveOpen(true)}
                                                    >
                                                        Leave Group
                                                    </Button>
                                                    <AlertDialog
                                                        open={leaveOpen}
                                                        setOpen={setLeaveOpen}
                                                        titleText={`Are you sure you want to leave the group?`}
                                                        bodyText={"This action cannot be undone."}
                                                        action={() => onLeave()}
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
                        </Grid>
                    </Container>
                </Box>
            </ThemeProvider>
  );
};