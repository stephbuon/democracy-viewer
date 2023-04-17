import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItem,ListItemIcon,ListItemText,Box,} from '@mui/material';
import {Menu as MenuIcon,Home as HomeIcon,BarChart as BarChartIcon,Person,Home,Search,} from '@mui/icons-material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import PeopleIcon from '@mui/icons-material/People';
import { useEffect } from 'react';

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

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
      case '/datasetsearch':
        return 'Search';
      case '/graph':
        return 'Graphs';
      case '/login':
        return 'Login';
      case '/Profile':
        return 'Profile';
      case '/register':
        return 'Register';
      case '/subsetsearch':
        return 'Subset Search';
      default:
        return 'Home';
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPage()}
          </Typography>
          {location.pathname !== '/login' ? (
            <Button color="inherit" component={Link} to="/login">
              Login or register
            </Button>
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
            <ListItemButton component={Link} to="/" sx={{ pt: 3 }} >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/datasetsearch" sx={{ pt: 3 }}>
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText primary="Search" />
            </ListItemButton>
            <ListItemButton component={Link} to="/subsetsearch" sx={{ pt: 3 }}>
              <ListItemIcon>
                <ManageSearchIcon />
              </ListItemIcon>
              <ListItemText primary="Subset Search" />
            </ListItemButton>
            <ListItemButton sx={{ pt: 3 }}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>
            <ListItemButton component={Link} to='/graph'>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Upload/Edit Data Sets" />
            </ListItemButton>
            <ListItemButton component={Link} to="/Profile">
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />

          </List>
        </Drawer>
        {/* Your main content */}
      </Box>
    </>
  );
}


