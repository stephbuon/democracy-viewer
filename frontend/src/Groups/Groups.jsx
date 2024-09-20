
import { 
    Box, Button, Card, CardActions, CardContent, Container, CssBaseline, Grid, Stack, Typography,
    createTheme, ThemeProvider
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { GetGroups } from '../apiFolder/GroupAPI';

//added a passcode input for a 6 digit access code to be put in when joining a group

const theme = createTheme();

export default function Groups() {
 const navigate = useNavigate();

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main>
          {/* Hero unit */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              pt: 5,
              pb: 3,
              flexGrow: 1
            }}
          >
            <Container sx={{ py: 4, maxWidth: '45%' }} maxWidth={false}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="text.primary"
                gutterBottom
              >
                Join a Community
              </Typography>
              <Typography variant="h5" align="center" color="text.secondary" paragraph>
                Join a group and focus in on your research!
              </Typography>

              <Stack
                sx={{ pt: 4 }}
                direction="row"
                spacing={2}
                justifyContent="center"
              >
              </Stack>
            </Container>
          </Box>
          <Container sx={{ py: 4, maxWidth: '90%' }} maxWidth={false}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Join a Group
                    </Typography>
                    <Typography align='center'>
                      Join an existing community.
                      <br />
                      Upload datasets and analyze your group's current documents.
                    </Typography>
                    <label htmlFor="code">Enter Group Access Code</label>
                  <Stack direction="row" justifyContent="center" spacing={2} sx={{ py: 2 }}>
                    {code.map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        name={`digit-${index}`}
                        maxLength="1"
                        value={value}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        style={{
                          width: "3rem",
                          height: "3rem",
                          textAlign: "center",
                          fontSize: "1.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    ))}
                  </Stack>
                  </CardContent>
                  <CardActions style={{ justifyContent: 'center' }}>
                    <Button onClick={() => navigate("/datasets/search")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                  </CardActions>
                </Card>
              </Grid>
  
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Create a Group
                    </Typography>
                    <Typography align='center'>
                      Start a community
                      <br />
                      for your focus!
                    </Typography>
                  </CardContent>
                  <CardActions style={{ justifyContent: 'center' }}>
                    <Button onClick={() => navigate("/datasets/subsets/search")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                  </CardActions>
                </Card>
              </Grid> 
            </Grid>   
         </Container>
        </main>
     </ThemeProvider>
    );
}