import { 
  Box, CssBaseline, createTheme, ThemeProvider,
  Typography, Container, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6",
    },
    background: {
      default: "#f0f0f0",
      paper: "#ffffff",
    },
  },
  typography: {
    h2: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h6: {
      fontWeight: 500,
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

  const PersonListItem = ({ person }) => (
    <ListItem sx={{ py: 1, px: 0 }}>
      <ListItemText>
        <Typography variant="h6" component="div" sx={{ fontWeight: 500, mb: 0.25 }}>
          {person.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          {person.role}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25, fontSize: '0.875rem' }}>
          {person.institution}
        </Typography>
        {person.link && (
          <Link 
            to={person.link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "#3b82f6", 
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500
            }}
          >
            {person.linkType} →
          </Link>
        )}
      </ListItemText>
    </ListItem>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Header Section */}
      <Box sx={{ 
        background: "white",
        py: { xs: 4, md: 8}
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" align="center" sx={{ mt: 4 }}>
            Acknowledgements
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" >
            Meet the team behind Democracy Viewer
          </Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Box sx={{ bgcolor: "white" }}>
        <Container maxWidth="md">
          
          {/* Directors */}
          <Typography variant="h4" component="h2" gutterBottom>
            Directors
          </Typography>
          <List sx={{ mb: 4 }}>
            {directors.map((person, index) => (
              <div key={index}>
                <PersonListItem person={person} />
                {index < directors.length - 1 && <Divider sx={{ my: 0.5 }} />}
              </div>
            ))}
          </List>

          {/* Current Lab Members */}
          <Typography variant="h4" component="h2" gutterBottom>
            Lab Members
          </Typography>
          <List sx={{ mb: 4 }}>
            {currentMembers.map((person, index) => (
              <div key={index}>
                <PersonListItem person={person} />
                {index < currentMembers.length - 1 && <Divider sx={{ my: 0.5 }} />}
              </div>
            ))}
          </List>

          {/* Former Lab Members */}
          <Typography variant="h4" component="h2" gutterBottom>
            Former Lab Members
          </Typography>
          <List>
            {formerMembers.map((person, index) => (
              <div key={index}>
                <PersonListItem person={person} />
                {index < formerMembers.length - 1 && <Divider sx={{ my: 0.5 }} />}
              </div>
            ))}
          </List>

        </Container>
      </Box>
    </ThemeProvider>
  );
};