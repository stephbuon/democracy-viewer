import { 
  Box, Grid, Container, CssBaseline, createTheme, ThemeProvider,
  Typography, Paper, List, ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';

const theme = createTheme();

export const Acknowledgements = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Hero unit */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Acknowledgements
          </Typography>
        </Container>
      </Box>
      <Box>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={12}
            sx={{
              p: 2,
              m: "auto",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '40%',
              mb: "50px"
            }}
          >
            <List>
              <ListItemText>
                Project Lead: <Link to = "https://stephbuon.github.io/" target="_blank" rel="noopener noreferrer">Steph Buongiorno</Link>
              </ListItemText>
              <ListItemText>
                Technical Lead: <Link to = "https://www.linkedin.com/in/ryandschaefer/" target="_blank" rel="noopener noreferrer">Ryan Schaefer</Link>
              </ListItemText>
              <ListItemText>
                Project Sponsor: <Link to = "https://www.joguldi.com/" target="_blank" rel="noopener noreferrer">Jo Guldi</Link> and Emory University
              </ListItemText>
              <ListItemText>
                Thank you to the following people for their work on Democracy Viewer:
                <List>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/wes-anderson-47552220a/" target="_blank" rel="noopener noreferrer">Wes Anderson</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/hailey-demark-3708a0289/" target="_blank" rel="noopener noreferrer">Hailey DeMark</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/francesca-la-marca-a10706208/" target="_blank" rel="noopener noreferrer">Francesca La Marca</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/christophermiller222/" target="_blank" rel="noopener noreferrer">Chris Miller</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/grace-schultz44/" target="_blank" rel="noopener noreferrer">Grace Schultz</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/matthew-swigart-11bb1721b/" target="_blank" rel="noopener noreferrer">Matthew Swigart</Link></ListItemText>
                  <ListItemText>- <Link to = "https://www.linkedin.com/in/latifaaiyoutan/" target="_blank" rel="noopener noreferrer">Latifa Tan</Link></ListItemText>
                </List>
              </ListItemText>
            </List>
          </Paper>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}