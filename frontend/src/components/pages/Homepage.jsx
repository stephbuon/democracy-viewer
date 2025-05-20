import { useState } from "react";
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

export const Homepage = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Featured visualizations -- change to user examples OR put on interaction at top
  const featuredVisualizations = [
    {
      id: 1,
      title: "US Congressional Discourse",
      description: "Analysis of language patterns in congressional debates over time",
      type: "Time Series",
      icon: <TimelineIcon sx={{ fontSize: 40, color: "#3b82f6" }} />,
    },
    {
      id: 2,
      title: "Global Democracy Index",
      description: "Comparative visualization of democracy metrics across countries",
      type: "Geographic",
      icon: <PublicIcon sx={{ fontSize: 40, color: "#10b981" }} />,
    },
    {
      id: 3,
      title: "Voter Demographics",
      description: "Detailed breakdown of voter participation by various demographic factors",
      type: "Multi-dimensional",
      icon: <PieChartIcon sx={{ fontSize: 40, color: "#8b5cf6" }} />,
    },
    {
      id: 4,
      title: "Political Network Analysis",
      description: "Network visualization of political relationships and affiliations",
      type: "Network",
      icon: <AccountTreeIcon sx={{ fontSize: 40, color: "#f59e0b" }} />,
    },
  ];

  const images = [
    { id: 1, src: 'image1.jpg', category: 'nature' },
    { id: 2, src: 'image2.jpg', category: 'city' },
    { id: 3, src: 'image3.jpg', category: 'nature' },
    { id: 4, src: 'image4.jpg', category: 'abstract' },
];

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
          py: { xs: 8, md: 12 }
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
                    height: { xs: 300, md: 400 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#e2e8f0"
                  }}
                >
                  {/* Placeholder for visualization demo/screenshot */}
                  <Box textAlign="center">
                    <BarChartIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Interactive visualization preview
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Action Cards */}
        <Box sx={{ py: 4, bgcolor: "background.light" }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
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

        {/* Featured Visualizations */}
        <Box sx={{ py: 8, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" align="center" fontWeight="bold" sx={{ mb: 6 }}>
              Featured Visualizations
            </Typography>
            <Grid container spacing={3}>
              {featuredVisualizations.map((viz) => (
                <Grid item xs={12} sm={6} md={3} key={viz.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        {viz.icon}
                        <Chip 
                          label={viz.type} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="h6" sx={{ mt: 2 }}>{viz.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {viz.description}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ p: 2 }}>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => navigate(`/graph/published/${viz.id}`)}
                      >
                        View Visualization
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="outlined"
                endIcon={<ArrowRightAltIcon />}
                onClick={() => navigate("/graphs/search")}
              >
                View All Visualizations
              </Button>
            </Box>
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