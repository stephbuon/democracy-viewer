import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItemIcon,ListItemText,Box,Tooltip} from '@mui/material';
import {Menu as MenuIcon, Person, Home, Search, MilitaryTech, ScreenSearchDesktop, Cable, ImageSearch, Groups} from '@mui/icons-material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import UploadIcon from '@mui/icons-material/Upload';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import { useEffect, useState } from 'react';

export const Layout = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const getCurrentPage = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/datasets/search':
        return 'Search Datasets';
      case '/graph':
        return 'Graphs';
      case '/graphs/search':
        return 'Visualization Search';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      case '/datasets/subsets/search':
        return 'Subset Search';
      case '/acknowledgements':
        return "Acknowledgements";
      case "/graph/zoom":
        return "Graph Zoom";
      default:
        if (location.pathname.includes("/profile/")) {
          return "Profile";
        } else if (location.pathname.includes("/upload")) {
          return "Upload";
        } else if (location.pathname.includes("/graph/published/")) {
          return "Graphs";
        } else if (location.pathname.includes("/groups")) {
          return "Private Groups";
        } else {
          return 'Home';
        }
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#333', color: 'white', boxShadow: 'none', borderBottom: '1px solid #ddd' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="black"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPage()}
          </Typography>
          {location.pathname !== '/login' ? (
            <>{props.user === undefined && 
            <Button color="inherit" component={Link} to="/login">
              Login or register
            </Button>}
            {props.user !== undefined && 
            <Button color="inherit" onClick={()=>{props.logout(); navigate('/')}}>
              Logout
            </Button>}</>
          ) : (
            <Button color="inherit" component={Link} to="/">
              Back
            </Button>
          )}        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ marginTop: '64px' }}>
        <Drawer
          variant="permanent"
          anchor="left"
          open={open}
          onClose={handleDrawerToggle}
          PaperProps={{
            style: {
              width: open ? 240 : 72,
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: '64px',
            },
          }}
        >
          <List component="nav">
            <ListItemButton component={Link} to="/" sx = {{ height: "50px" }}>
              <Tooltip title = "Home" arrow>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Home" />
            </ListItemButton>

            <ListItemButton component={Link} to="/datasets/search" sx = {{ height: "50px" }}>
              <Tooltip title = "Dataset Search" arrow>
                <ListItemIcon>
                  <Search />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Dataset Search" />
            </ListItemButton>

            <ListItemButton component={Link} to="/datasets/subsets/search" sx = {{ height: "50px" }}>
              <Tooltip title = "Subset Search" arrow>
                <ListItemIcon>
                  <ScreenSearchDesktop />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Subset Search" />
            </ListItemButton>

            <ListItemButton component={Link} to='/graph' sx = {{ height: "50px" }}>
              <Tooltip title = "Visualize" arrow>
                <ListItemIcon>
                  <ShowChartIcon/>
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Visualize" />
            </ListItemButton>

            <ListItemButton component={Link} to="/graphs/search" sx = {{ height: "50px" }}>
              <Tooltip title = "Graph Search" arrow>
                <ListItemIcon>
                  <ImageSearch />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Graph Search" />
            </ListItemButton>

            <ListItemButton component={Link} to='/upload' sx = {{ height: "50px" }}>
              <Tooltip title = "Dataset Upload" arrow>
                <ListItemIcon>
                  <UploadIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Dataset Upload" />
            </ListItemButton>

            <ListItemButton component={Link} to='/groups' sx = {{ height: "50px" }}>
              <Tooltip title = "Private Groups" arrow>
                <ListItemIcon>
                  <Groups />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Private Groups" />
            </ListItemButton>

            {
              props.user !== undefined && 
              <ListItemButton component={Link} to={`/profile/${ props.user.email }`} sx = {{ height: "50px" }}>
                <Tooltip title = "Profile" arrow>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Profile" />
              </ListItemButton>
            }
            {
              props.user === undefined && 
              <ListItemButton component={Link} to={`/login`} sx = {{ height: "50px" }}>
                <Tooltip title = "Profile" arrow>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Profile" />
              </ListItemButton>
            }

            <ListItemButton component={Link} to='/acknowledgements' sx = {{ height: "50px" }}>
              <Tooltip title = "Acknowledgements" arrow>
                <ListItemIcon>
                  <MilitaryTech />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Acknowledgements" />
            </ListItemButton>
            
            <Divider sx={{ my: 1 }} />
            

          </List>
        </Drawer>
        {/* Your main content */}
      </Box>
    </>
  );
}
