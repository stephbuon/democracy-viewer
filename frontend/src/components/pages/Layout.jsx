import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Button,Box,Tooltip} from '@mui/material';
import { useEffect, useState } from 'react';
import homeIcon from '../images/IMG_0266.jpg';
import AccountCircle from '@mui/icons-material/AccountCircle';


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

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'white', boxShadow: 'none', borderBottom: '1px solid #ddd' }}>
      <Toolbar>
      <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="home"
          sx={{ mr: 2 }}
          onClick={() => navigate("/")}
        >
          <img 
            src={homeIcon}
            alt="Home"
            style={{ width: 32, height: 32 }} 
          />
        </IconButton>

        <Button
          onClick={() => navigate("/")}
          sx={{ textTransform: 'none', color: 'black', fontSize: '1.0rem' }}
        >
         Democracy Viewer
        </Button>
          
          {/* Navigation menu items */}
          <Box sx={{ display: 'flex', mx: 2, flexGrow: 1, color: 'black', justifyContent: 'center'}}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/upload"
              sx={{ fontWeight: isActive('/upload') ? 'bold' : 'normal', textTransform: 'capitalize' }}
            >
              upload dataset
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/datasets/search"
              sx={{ fontWeight: isActive('/datasets/search') ? 'bold' : 'normal', textTransform: 'capitalize' }}
            >
              search datasets
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/datasets/subsets/search"
              sx={{ fontWeight: isActive('/datasets/subsets/search') ? 'bold' : 'normal', textTransform: 'capitalize' }}
            >
              view dataset
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/graph"
              sx={{ fontWeight: isActive('/graph') ? 'bold' : 'normal', textTransform: 'capitalize' }}
            >
              visualize
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/graphs/search"
              sx={{ fontWeight: isActive('/graphs/search') ? 'bold' : 'normal', textTransform: 'capitalize' }}
            >
              search visualizations
            </Button>
          </Box>

          {/* User authentication buttons */}
          {location.pathname !== '/login' ? (
            <>{props.user === undefined && 
            <Button sx={{ color: "black", textTransform: 'capitalize'}} component={Link} to="/login">
              login or register
            </Button>}
            {props.user !== undefined && ( <>
              <Tooltip title="Profile">
                <IconButton
                  sx={{ color: "black" }}
                  onClick={() => { navigate(`/profile/${props.user.email}`); }}
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            <Button sx={{ color: "black", textTransform: 'capitalize' }} onClick={() => { props.logout(); navigate('/'); }}>
              logout
            </Button> </>
            )} </>
          ) : (
            <Button sx={{ color: "black" }} component={Link} to="/">
              Back
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}