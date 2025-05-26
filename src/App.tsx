import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HomePage from './components/HomePage'; 
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { draftData } from './dataUtils';
import './App.css';
import mavsLogo from './assets/mavs-logo.png';

const mavsTheme = createTheme({
  palette: {
    mode: 'dark', 
    primary: { main: '#00538C', contrastText: '#FFFFFF' },
    secondary: { main: '#B8C4CA', contrastText: '#002B5E' },
    background: { default: '#00204A', paper: '#002B5E' },
    text: { primary: '#FFFFFF', secondary: '#B8C4CA' },
    error: { main: '#FF6B6B' },
    success: { main: '#6BCB77' }
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    allVariants: { color: '#FFFFFF' },
    body1: { color: 'var(--mavs-silver)'}, 
    body2: { color: 'var(--mavs-silver)'},
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#000000', borderBottom: '2px solid var(--mavs-royal-blue)' },
      },
    },
    MuiButton: { 
      styleOverrides: {
        root: {
          color: 'var(--mavs-white)',
          borderColor: 'var(--mavs-silver)',
          '&:hover': { borderColor: 'var(--mavs-white)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }
        },
        containedPrimary: {
           backgroundColor: 'var(--mavs-royal-blue)',
           '&:hover': { backgroundColor: '#006AD5' }
        },
        outlinedPrimary: {
            borderColor: 'var(--mavs-royal-blue)',
            color: 'var(--mavs-royal-blue)',
             '&:hover': { borderColor: 'var(--mavs-silver)', backgroundColor: 'rgba(0, 83, 140, 0.1)'}
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: { backgroundColor: 'var(--mavs-navy-blue)', backgroundImage: 'none' }
        }
    },
    MuiTableCell: {
        styleOverrides: {
            head: { backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold' },
            body: { color: 'var(--mavs-silver)', borderColor: 'rgba(184, 196, 202, 0.2)' }
        }
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 43, 94, 0.3)' },
                 '&:hover': { backgroundColor: 'rgba(0, 83, 140, 0.3) !important' }
            }
        }
    },
     MuiAvatar: {
        styleOverrides: {
            root: { border: '2px solid var(--mavs-silver)', backgroundColor: 'var(--mavs-royal-blue)' }
        }
     },
     MuiChip: {
        styleOverrides: { root: { margin: '0 4px' } }
     }
  },
});

function App() {
  return (
    <ThemeProvider theme={mavsTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: mavsTheme.palette.common.white }}>
              Dallas Mavericks Draft Hub 2025
            </Typography>
            <nav className="app-nav">
               <NavLink
                to="/home"
                className={({ isActive }) => isActive ? "active-nav-link" : "inactive-nav-link"}
                style={({ isActive }) => ({
                  marginRight: '20px',
                  color: mavsTheme.palette.common.white,
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px', 
                  fontWeight: isActive ? 'bold' : 'normal',
                  backgroundColor: isActive ? 'rgba(0, 83, 140, 0.5)' : 'transparent', 
                  transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center'
                })}
              >
                <HomeIcon sx={{mr: 0.5}} /> Home
              </NavLink>
            </nav>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: {xs: 2, sm: 4}, mb: 4 }}> 
          <Routes>
            <Route path="/" element={<HomePage />} /> 
            <Route path="/home" element={<HomePage />} />
            <Route path="/bigboard" element={<BigBoard playerData={draftData} />} />
            <Route path="/player/:playerId" element={<PlayerProfile playerData={draftData} />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;