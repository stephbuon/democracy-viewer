import { 
  Box, Grid, CssBaseline, createTheme, ThemeProvider,
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
                <ListItemText 
                primary="Project Lead"
                primaryTypographyProps={{style: {fontSize: '27px'}}}
                />
                <ListItemText sx={{ }}>
                Steph Buongiorno 
                </ListItemText>
                <ListItemText sx={{ }}>
                Southern Methodist University
                </ListItemText>
                <ListItemText sx={{}}>
                <Link to = "https://stephbuon.github.io/" target="_blank" rel="noopener noreferrer">GitHub</Link>
                </ListItemText>
                <ListItemText 
                primary="Technical Lead"
                primaryTypographyProps={{style: {fontSize: '27px'}}}
                />
                <ListItemText sx={{ }}>
                Ryan Schaefer
                </ListItemText>
                <ListItemText sx={{ }}>
                University of California, Berkeley
                </ListItemText>
                <ListItemText sx={{}}>
                <Link to = "https://www.linkedin.com/in/ryandschaefer/" target="_blank" rel="noopener noreferrer">LinkedIn</Link>
                </ListItemText>
                <ListItemText
                  primary="Project Sponsor"
                  primaryTypographyProps={{style: {fontSize: '27px'}}}
                />
                <ListItemText sx={{ }}>
                Jo Guldi
                </ListItemText>
                <ListItemText sx={{ }}>
                Emory University
                </ListItemText>
                <ListItemText sx={{}}>
                <Link to = "https://www.joguldi.com/" target="_blank" rel="noopener noreferrer">Website</Link>
                </ListItemText>
              </Box>
              <ListItemText>
                  <Typography sx={{ fontSize: '27px'}}>
                    Thank you to the students and researchers who contributed their hard work to Democracy Viewer:
                  </Typography>
                <List>
                  <ListItemText><Link to = "https://www.linkedin.com/in/wes-anderson-47552220a/" target="_blank" rel="noopener noreferrer">Wes Anderson</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/hailey-demark-3708a0289/" target="_blank" rel="noopener noreferrer">Hailey DeMark</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/serena-di-martino-87268a299/" target="_blank" rel="noopener noreferrer">Serena Di Martino</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/francesca-la-marca-a10706208/" target="_blank" rel="noopener noreferrer">Francesca La Marca</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/christophermiller222/" target="_blank" rel="noopener noreferrer">Chris Miller</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/grace-schultz44/" target="_blank" rel="noopener noreferrer">Grace Schultz</Link></ListItemText>
                  <ListItemText><Link to = "https://www.linkedin.com/in/matthew-swigart-11bb1721b/" target="_blank" rel="noopener noreferrer">Matthew Swigart</Link></ListItemText>
                  
                </List>
              </ListItemText>
            </List>
          </Paper>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}