// src/App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { draftData } from './dataUtils'; // Import the data
import './App.css';
import mavsLogo from './assets/dallas-mavericks.svg';

// Dallas Mavericks Theme for Material UI
const mavsTheme = createTheme({
  palette: {
    primary: {
      main: '#00538C', // Royal Blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B8C4CA', // Silver
      contrastText: '#002B5E', // Navy Blue
    },
    background: {
      default: '#002B5E', // Navy Blue
      paper: '#00204A', // Darker Navy for paper elements
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8C4CA',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: { color: '#FFFFFF' },
    h2: { color: '#FFFFFF' },
    h3: { color: '#FFFFFF' },
    h4: { color: '#FFFFFF' },
    h5: { color: '#FFFFFF' },
    h6: { color: '#FFFFFF' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000', // Black for AppBar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        }
      }
    }
  },
});

function App() {
  // Example state for shared data or settings if needed
  // const [someSharedState, setSomeSharedState] = useState(null);

  return (
    <ThemeProvider theme={mavsTheme}>
      <CssBaseline /> {/* Ensures Material UI styles are applied globally */}
      <Router>
        <AppBar position="static">
          <Toolbar>
            {/* Replace this Box with your actual logo image */}
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundColor: 'primary.main', // Placeholder color
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                borderRadius: '50%'
              }}
            >
              <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '40px', marginRight: '16px' }} />
              <Typography variant="h6" sx={{color: "white"}}>M</Typography> {/* Placeholder */}
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: mavsTheme.palette.common.white }}>
              Dallas Mavericks Draft Hub 2025
            </Typography>
            <nav className="app-nav">
              <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Big Board</NavLink>
              {/* Player profiles will be navigated to from the Big Board, so a direct nav link might not be needed here unless there's a search/dropdown */}
            </nav>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<BigBoard playerData={draftData} />} />
            <Route path="/player/:playerId" element={<PlayerProfile playerData={draftData} />} />
            {/* Add other routes as needed */}
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;