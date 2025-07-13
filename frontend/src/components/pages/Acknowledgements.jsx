import { 
  Box, CssBaseline, createTheme, ThemeProvider,
  Typography, Container, Grid, Card, CardContent, Avatar, Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
      light: "#f1f5f9"
    },
  },
  typography: {
    h2: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      marginBottom: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
});

export const Acknowledgements = () => {
  const directors = [
    {
      name: "Steph Buongiorno",
      role: "Co-Director",
      institution: "Emory University",
      link: "https://stephbuon.github.io/",
      linkType: "GitHub"
    },
    {
      name: "Jo Guldi",
      role: "Co-Director", 
      institution: "Emory University",
      link: "https://www.joguldi.com/",
      linkType: "Website"
    }
  ];

  const currentMembers = [
    {
      name: "Serena Di Martino",
      role: "Technical Lead",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/serena-di-martino-87268a299/",
      linkType: "LinkedIn"
    },
    {
      name: "Rosie Larson",
      role: "Research Assistant and Data Curator",
      institution: "Emory University"
    },
    {
      name: "Meena Ramswamy",
      role: "Research Assistant and Data Scientist",
      institution: "The University of Texas at Austin"
    },
    {
      name: "Hailey DeMark",
      role: "Artist",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/hailey-demark-3708a0289/",
      linkType: "LinkedIn"
    },
    {
      name: "Wenzhuo Ma",
      role: "Research Assistant and Data Scientist",
      institution: "Emory University"
    }
  ];

  const formerMembers = [
    {
      name: "Ryan Schaefer",
      role: "Technical Lead (2022–2025)",
      institution: "University of California, Berkeley",
      link: "https://www.linkedin.com/in/ryandschaefer/",
      linkType: "LinkedIn"
    },
    {
      name: "Alisha Morejon",
      role: "Project Manager (2024–2025)",
      institution: "Emory University"
    },
    {
      name: "Shawn Chen",
      role: "UI / UX (2024–2025)",
      institution: "Emory University"
    },
    {
      name: "Francesca La Marca",
      role: "UI / UX (2024–2025)",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/francesca-la-marca-a10706208/",
      linkType: "LinkedIn"
    },
    {
      name: "Grace Schultz",
      role: "UI / UX (2024–2025)",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/grace-schultz44/",
      linkType: "LinkedIn"
    },
    {
      name: "Wes Anderson",
      role: "Software Developer (2022–2023)",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/wes-anderson-47552220a/",
      linkType: "LinkedIn"
    },
    {
      name: "Matthew Swigart",
      role: "Software Developer (2022–2023)",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/matthew-swigart-11bb1721b/",
      linkType: "LinkedIn"
    },
    {
      name: "Chris Miller",
      role: "Software Developer (2022–2023)",
      institution: "Southern Methodist University",
      link: "https://www.linkedin.com/in/christophermiller222/",
      linkType: "LinkedIn"
    }
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const PersonCard = ({ person }) => (
    <Card sx={{ 
      height: "100%", 
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }
    }}>
      <CardContent sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        textAlign: "center",
        p: 3
      }}>
        <Avatar sx={{ 
          bgcolor: "#e0f2fe", 
          mb: 2, 
          width: 56, 
          height: 56,
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#0369a1"
        }}>
          {getInitials(person.name)}
        </Avatar>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem", mb: 1 }}>
          {person.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
          {person.role}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.8rem", fontStyle: "italic" }}>
          {person.institution}
        </Typography>
        {person.link && (
          <MuiLink
            href={person.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "0.75rem",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline"
              }
            }}
          >
            {person.linkType} →
          </MuiLink>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Header Section */}
      <Box sx={{ 
        background: "#f8f9fa",
        pt: { xs: 6, md: 12 }, 
        pb: { xs: 2, md: 4 },
        borderBottom: "1px solid #e2e8f0"
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" align="center"  sx={{ mb: 1 }}>
            Acknowledgements
          </Typography>
          <Typography  variant="h6"  color="text.secondary" align="center" sx={{ fontWeight: 400 }}>
            Meet the team behind Democracy Viewer
          </Typography>
        </Container>
      </Box>

      {/* Directors Section */}
      <Box sx={{ py: 6, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Team Directors
          </Typography>
          <Box sx={{ 
            width: "60px", 
            height: "4px", 
            bgcolor: "#fbbf24", 
            mx: "auto", 
            mb: 4 
          }} />
          <Grid container spacing={4} justifyContent="center">
            {directors.map((person, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PersonCard person={person} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Current Lab Members Section */}
      <Box sx={{ py: 6, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Lab Members
          </Typography>
          <Box sx={{ 
            width: "60px", 
            height: "4px", 
            bgcolor: "#fbbf24", 
            mx: "auto", 
            mb: 4 
          }} />
          <Grid container spacing={3} justifyContent="center">
            {currentMembers.map((person, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <PersonCard person={person} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Former Lab Members Section */}
      <Box sx={{ py: 6, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Former Lab Members
          </Typography>
          <Box sx={{ 
            width: "60px", 
            height: "4px", 
            bgcolor: "#fbbf24", 
            mx: "auto", 
            mb: 4 
          }} />
          <Grid container spacing={3} justifyContent="center">
            {formerMembers.map((person, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <PersonCard person={person} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};