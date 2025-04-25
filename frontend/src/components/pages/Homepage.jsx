import { 
  Box, Button, Card, Container, CssBaseline, Grid, Typography,
  createTheme, ThemeProvider, Modal, Divider
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const theme = createTheme();

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export const Homepage = () => {
  const navigate = useNavigate();
  // State to control modal visibility
  const [openModal, setOpenModal] = useState(false);

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <main style={{ flexGrow: 1 }}>
          {/* Hero unit - REDUCED PADDING */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              pt: 3,
              pb: 1
            }}
          >
            <Container sx={{ py: 2, maxWidth: '45%' }} maxWidth={false}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="text.primary"
                gutterBottom
              >
                Democracy Viewer
              </Typography>
              <Typography variant="h5" align="center" color="text.secondary" paragraph>
                Democratizing text-based data analytics and data sharing across the humanities and social sciences
              </Typography>
            </Container>
          </Box>

          {/* Main content with updated responsive grid - REDUCED SPACING */}
          <Container sx={{ pt: 0, pb: 0, maxWidth: '75%' }} maxWidth={false}> 
            {/* First row - 2 boxes - REDUCED SPACING */}
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6} md={5}>
                <Card
                  sx={{ 
                    height: 100,
                    width: 350, 
                    display: 'flex', 
                    flexDirection: 'column',
                    mx: 'auto'
                  }}
                >
                  <Button
                    onClick={() => navigate("/datasets/search")}
                    variant="contained"
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 0,
                      bgcolor: 'rgb(48,48,48)',
                      color: 'white',
                      textTransform: 'none'
                    }}
                  >
                    <Typography variant="h5" align='center'>
                      Search Datasets
                    </Typography>
                    {/* <Typography align='center'>
                      Browse available datasets
                    </Typography> */}
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={5}>
                <Card
                  sx={{ 
                    height: 100,
                    width: 350, 
                    display: 'flex', 
                    flexDirection: 'column',
                    mx: 'auto'
                  }}
                >
                  <Button
                    onClick={() => navigate("/upload")}
                    variant="contained"
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 0,
                      bgcolor: 'rgb(48,48,48)',
                      color: 'white',
                      textTransform: 'none'
                    }}
                  >
                    <Typography variant="h5" align='center'>
                      Upload Dataset
                    </Typography>
                    {/* <Typography align='center'>
                      Upload a dataset or
                      <br />
                      connect to API
                    </Typography> */}
                  </Button>
                </Card>
              </Grid>
            </Grid>

            {/* Second row - 2 boxes - REDUCED SPACING */}
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12} sm={6} md={5}>
                <Card
                  sx={{
                    height: 100,
                    width: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    mx: 'auto'
                  }}
                >
                  <Button
                    onClick={() => navigate("/graphs/search")}
                    variant="contained"
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 0,
                      bgcolor: 'rgb(48,48,48)',
                      color: 'white',
                      textTransform: 'none'
                    }}
                  >
                    <Typography variant="h5" align='center'>
                      Search Visualizations
                    </Typography>
                    {/* <Typography align='center'>
                      Customize and interact with
                      <br />
                      visualization of analysis
                    </Typography> */}
                  </Button>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={5}>
                <Card
                  sx={{
                    width: 350,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    mx: 'auto'
                  }}
                >
                  <Button
                    onClick={handleOpenModal} // Open modal instead of direct navigation
                    variant="contained"
                    sx={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 0,
                      bgcolor: 'rgb(48,48,48)',
                      color: 'white',
                      textTransform: 'none'
                    }}
                  >
                    <Typography variant="h5" align='center'>
                      Use Selected Dataset
                    </Typography>
                    {/* <Typography align='center'>
                      Search within a dataset
                    </Typography> */}
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </main>

        {/* Dataset Options Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="dataset-options-modal"
        >
          <Box sx={modalStyle}>
            <Typography id="dataset-options-modal" variant="h6" component="h2" mb={3}>
              What would you like to do?
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                onClick={() => {
                  navigate("/datasets/subsets/search");
                  handleCloseModal();
                }}
                variant="contained" 
                fullWidth
                sx={{
                  bgcolor: 'rgb(48,48,48)',
                  '&:hover': {
                    bgcolor: '#0099FF', // Blue color on hover
                  },
                  p: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    View Dataset
                  </Typography>
                </Box>
              </Button>
              
              <Button 
                onClick={() => {
                  navigate("/graph");
                  handleCloseModal();
                }}
                variant="contained" 
                fullWidth
                sx={{
                  bgcolor: 'rgb(48,48,48)',
                  '&:hover': {
                    bgcolor: '#0099FF', // Blue color on hover
                  },
                  p: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    Visualize Dataset
                  </Typography>
                </Box>
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleCloseModal} 
                variant="outlined"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>

        <footer style={{ backgroundColor: 'white', padding: '10px 0', color: 'black' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={{ flex: 1, backgroundColor: 'white', color: 'black', border: 'none', padding: '10px', textAlign: 'center' }}>
              <a
                href="mailto:sbuongiorno@smu.edu"
                style={{
                  color: 'black',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#0099FF'}
                onMouseLeave={(e) => e.target.style.color = 'black'}
              >
                Contact Us
              </a>
            </button>

            <button style={{ flex: 1, backgroundColor: 'white', color: 'black', border: 'none', padding: '10px', textAlign: 'center' }}>
              <a
                href="https://github.com/stephbuon/democracy-viewer-demo/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'black',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#0099FF'}
                onMouseLeave={(e) => e.target.style.color = 'black'}
              >
                Visit our GitHub Page
              </a>
            </button>

            <button style={{ flex: 1, backgroundColor: 'white', color: 'black', border: 'none', padding: '10px', textAlign: 'center' }}>
              <a
                href="/acknowledgements"
                style={{
                  color: 'black',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#0099FF'}
                onMouseLeave={(e) => e.target.style.color = 'black'}
              >
                Acknowledgements
              </a>
            </button>
          </div>
        </footer>
      </Box>
    </ThemeProvider>
  );
}