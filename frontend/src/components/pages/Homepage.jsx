import { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, Card, Container, CssBaseline, Grid, Typography, createTheme, ThemeProvider, Modal,
  Divider, TextField, Paper, CardContent, CardActions, Avatar, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import PieChartIcon from "@mui/icons-material/PieChart";
import PublicIcon from "@mui/icons-material/Public";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import TimelineIcon from "@mui/icons-material/Timeline";
import image1 from '../images/Network_Analysis.PNG';
import image2 from '../images/TF-IDF.PNG';
import image3 from '../images/Word_Embedding_Vectors_for_arthur_balfour_5410_and_benjamin_disraeli_35231.PNG'; 

export const Homepage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const carouselImages = [
    image1, image2, image3
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // Custom theme
  const theme = createTheme({
    palette: {
      primary: {
        main: "#3b82f6", // blue for button color
      },
      secondary: {
        main: "#f59e0b", // amber-500
      },
      background: {
        default: "#f0f0f0", // feature visualization background 
        paper: "#ffffff", // pop button model background
        light: "#ffffff", // mid buttons
        dark: "#1e293b",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: "6px",
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Hero Section */}
        <Box sx={{ 
          background: "linear-gradient(180deg, #f0f0f0 0%, #f1f5f9 100%)",
          py: { xs: 8, md: 22 }
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                  Democracy Viewer
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  Democratizing text-based data analytics and data sharing across the humanities and social sciences.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={1}
                  sx={{ 
                    height: { xs: 300, md: 300 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#e2e8f0"
                  }}
                >
                  {/* Placeholder for visualization demo/screenshot */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate("/")}
                  >
                    <img
                      src={carouselImages[currentImageIndex]}
                      alt="Carousel"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 0 
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Action Cards */}
        <Box sx={{ py: 4, bgcolor: "background.light" }}>
          <Container maxWidth="lg">
            <Grid container spacing={5} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Avatar sx={{ bgcolor: "#dbeafe", mb: 3, p: 3, width: 64, height: 64 }}>
                      <SearchIcon sx={{ color: "#3b82f6", fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Search Datasets</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Browse available datasets for your research needs
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/datasets/search")}
                      fullWidth
                    >
                      Browse Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Avatar sx={{ bgcolor: "#dcfce7", mb: 3, p: 3, width: 64, height: 64 }}>
                      <FileUploadIcon sx={{ color: "#10b981", fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Upload Dataset</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Share your dataset or connect to an API
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/upload")}
                      fullWidth
                    >
                      Upload Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Avatar sx={{ bgcolor: "#f3e8ff", mb: 3, p: 3, width: 64, height: 64 }}>
                      <BarChartIcon sx={{ color: "#8b5cf6", fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Search Visualizations</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Discover visualizations created by others
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/graphs/search")}
                      fullWidth
                    >
                      Find Visualizations
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <Avatar sx={{ bgcolor: "#fef3c7", mb: 3, p: 3, width: 64, height: 64 }}>
                      <StorageIcon sx={{ color: "#f59e0b", fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>Use Selected Dataset</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Work with your currently selected dataset
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleOpenModal}
                      fullWidth
                    >
                      Select Options
                    </Button>
                  </CardActions>
                </Card>
              </Grid> */}
            </Grid>
          </Container>
        </Box>

        {/*Additional Options Section*/}
        <Box sx={{ py: 4, bgcolor: "grey.900", color: "white" }}>
          <Container maxWidth="lg">
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button 
                  variant="text" 
                  sx={{ color: "white", '&:hover': { color: "primary.main" } }}
                  onClick={() => window.location.href = "mailto:sbuongiorno@smu.edu"}
                >
                  Contact Us
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="text" 
                  sx={{ color: "white", '&:hover': { color: "primary.main" } }}
                  onClick={() => window.open("https://github.com/stephbuon/democracy-viewer-demo/tree/main", "_blank")}
                >
                  Visit Our GitHub Page
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="text" 
                  sx={{ color: "white", '&:hover': { color: "primary.main" } }}
                  onClick={() => navigate("/acknowledgements")}
                >
                  Acknowledgements
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Dataset Options Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="dataset-options-modal"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  navigate("/datasets/subsets/search");
                  handleCloseModal();
                }}
              >
                View Dataset
              </Button>
              
              <Button
                variant="contained" 
                size="large"
                onClick={() => {
                  navigate("/graph");
                  handleCloseModal();
                }}
              >
                Visualize Dataset
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default Homepage;