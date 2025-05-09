import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItemIcon,ListItemText,Box,Tooltip} from '@mui/material';
import {Menu as MenuIcon, Person, Home, Search, MilitaryTech, ScreenSearchDesktop, Cable, ImageSearch} from '@mui/icons-material';
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
        return 'Search Visualizations';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      case '/datasets/subsets/search':
        return 'View Dataset';
      case '/acknowledgements':
        return "Acknowledgements";
      // case "/distributed":
      //   return "Distributed Connection";
      case "/graph/zoom":
        return "Graph Zoom";
      default:
        if (location.pathname.includes("/profile/")) {
          return "Profile";
        } else if (location.pathname.includes("/upload")) {
          return "Upload";
        } else if (location.pathname.includes("/graph/published/")) {
          return "Graphs";
        } else {
          return 'Home';
        }
    }
  };
  
  // Helper function to find active tab for sidebar
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    } else if (path !== '/') {
      if (path === '/graph' && (location.pathname === '/graph' || location.pathname.startsWith('/graph/') || location.pathname.includes('/graph/published/'))) {
        return true;
      } 
      else if (location.pathname === path || location.pathname.startsWith(`${path}/`)) {
        return true;
      }
    }
    return false;
  };

  // Active item styles
  const activeStyle = {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    borderLeft: '4px solid #1976d2',
  };

  // Active icon style
  const activeIconStyle = {
    color: '#1976d2',
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
            {props.user !== undefined && ( <>
            <Button color="inherit" onClick={() => { navigate(`/profile/${props.user.email}`); }} >
                Profile
            </Button>
            <Button color="inherit" onClick={() => { props.logout(); navigate('/'); }}>
              Logout
            </Button> </>
          )} </>
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
            <ListItemButton component={Link}  to="/"  sx={{  height: "50px", ...(isActive('/') ? activeStyle : {}) }}>
              <ListItemIcon>
                <Home sx={isActive('/') ? activeIconStyle : {}} />
              </ListItemIcon>
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{
                  fontWeight: isActive('/') ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>

            <ListItemButton component={Link} to="/datasets/search" sx={{height: "50px", ...(isActive('/datasets/search') ? activeStyle : {})}}>
              <ListItemIcon>
                <Search sx={isActive('/datasets/search') ? activeIconStyle : {}} />
              </ListItemIcon>
              <ListItemText 
                primary="Dataset Search" 
                primaryTypographyProps={{
                  fontWeight: isActive('/datasets/search') ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>

            <ListItemButton component={Link} to="/datasets/subsets/search" sx={{height: "50px", ...(isActive('/datasets/subsets/search') ? activeStyle : {})}}>
              <ListItemIcon>
                <ScreenSearchDesktop sx={isActive('/datasets/subsets/search') ? activeIconStyle : {}} />
              </ListItemIcon>
              <ListItemText 
                primary="View Dataset" 
                primaryTypographyProps={{
                  fontWeight: isActive('/datasets/subsets/search') ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>

            <ListItemButton component={Link} to='/graph' sx={{height: "50px", ...(isActive('/graph') ? activeStyle : {})}}>
              <ListItemIcon>
                <ShowChartIcon sx={isActive('/graph') ? activeIconStyle : {}} />
              </ListItemIcon>
              <ListItemText 
                primary="Visualize" 
                primaryTypographyProps={{
                  fontWeight: isActive('/graph') ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>

            <ListItemButton component={Link} to="/graphs/search" sx={{height: "50px", ...(isActive('/graphs/search') ? activeStyle : {})}}>
              <ListItemIcon>
                <ImageSearch sx={isActive('/graphs/search') ? activeIconStyle : {}} />
              </ListItemIcon>
              <ListItemText 
                primary="Search Visualizations" 
                primaryTypographyProps={{
                  fontWeight: isActive('/graphs/search') ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/upload" sx={{height: "50px", ...(isActive('/upload') ? activeStyle : {})}}>
                <ListItemIcon>
                  <UploadIcon sx={isActive('/upload') ? activeIconStyle : {}} />
                </ListItemIcon>
                <ListItemText 
                  primary="Dataset Upload" 
                  primaryTypographyProps={{
                    fontWeight: isActive('/upload') ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>

            <Divider sx={{ my: 1 }} />
          </List>
        </Drawer>
        {/* Your main content */}
      </Box>
    </>
  );
}
