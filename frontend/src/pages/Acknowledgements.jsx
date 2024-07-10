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
      <Box sx = {{ mt: "100px"}}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={12}
            sx={{
              p: 2,
              m: "auto",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '70%',
              mb: "50px"
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Acknowledgements
            </Typography>
            <List>
              <Box sx={{ mb: "20px" }}>
                <ListItemText sx={{  }}>
                  Project Lead: <Link to = "https://stephbuon.github.io/" target="_blank" rel="noopener noreferrer">Steph Buongiorno</Link>, Southern Methodist University
                </ListItemText>
                <ListItemText>
                  Technical Lead: <Link to = "https://www.linkedin.com/in/ryandschaefer/" target="_blank" rel="noopener noreferrer">Ryan Schaefer</Link>, Univeristy of California, Berkeley
                </ListItemText>
                <ListItemText>
                  Project Sponsor: <Link to = "https://www.joguldi.com/" target="_blank" rel="noopener noreferrer">Jo Guldi</Link>, Emory University
                </ListItemText>
              </Box>
              <ListItemText>
                Thank you to the students and researchers who contributed their hard work to Democracy Viewer: 
                <List>
                  <ListItemText><Link to = "https://www.linkedin.com/in/wes-anderson-47552220a/" target="_blank" rel="noopener noreferrer">Wes Anderson</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/hailey-demark-3708a0289/" target="_blank" rel="noopener noreferrer">Hailey DeMark</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/francesca-la-marca-a10706208/" target="_blank" rel="noopener noreferrer">Francesca La Marca</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/christophermiller222/" target="_blank" rel="noopener noreferrer">Chris Miller</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/grace-schultz44/" target="_blank" rel="noopener noreferrer">Grace Schultz</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/matthew-swigart-11bb1721b/" target="_blank" rel="noopener noreferrer">Matthew Swigart</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/latifaaiyoutan/" target="_blank" rel="noopener noreferrer">Latifa Tan</Link></ListItemText>
                </List>
              </ListItemText>
            </List>
          </Paper>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}