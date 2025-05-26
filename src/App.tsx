import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { Typography, CircularProgress, Box, AppBar, Toolbar, CssBaseline, Container, Button } from '@mui/material';
import type { DraftData } from './types';
import mavsLogo from './assets/mavs-logo.png'; // Ensure this path is correct: src/assets/mavs-logo.png

// Main App component structure
function AppContent() {
  const [playerData, setPlayerData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/intern_project_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData: DraftData = await response.json();
        setPlayerData(jsonData);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          console.error("Failed to fetch player data:", e.message);
        } else {
          setError('An unknown error occurred during data fetching.');
          console.error("An unknown error occurred during data fetching.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--mavs-navy-blue)', color: 'var(--mavs-white)' }}>
        <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '100px', marginBottom: '20px' }} />
        <CircularProgress color="inherit" sx={{mb: 2}}/>
        <Typography variant="h6">Loading Draft Hub Data...</Typography>
      </Box>
    );
  }

  if (error || !playerData) {
    return (
       <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--mavs-navy-blue)', color: 'var(--mavs-white)', p:3, textAlign: 'center' }}>
        <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '100px', marginBottom: '20px' }} />
        <Typography variant="h5" sx={{color: 'var(--mavs-error-red)'}} gutterBottom>Error Loading Application Data</Typography> {/* Using CSS Variable */}
        <Typography sx={{color: 'var(--mavs-silver)'}}>{error || 'Player data could not be loaded. Please try refreshing the page or check the console for more details.'}</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'var(--mavs-black)' /* Black background from CSS variable */ }}>
        <Container maxWidth="xl" sx={{ px: { xs: '8px', sm: '12px' } /* Further Reduced horizontal padding */ }}>
          <Toolbar disableGutters>
            <img 
              src={mavsLogo} 
              alt="Mavs Logo" 
              style={{height: 55, marginRight: 16, cursor: 'pointer'}} // Further Increased logo size
              onClick={() => navigate('/')}
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, color: 'var(--mavs-white)', cursor: 'pointer',  '&:hover': { textDecoration: 'underline' } }} 
              onClick={() => navigate('/')}
            >
              Mavs Draft Hub
            </Typography>
            <Button color="inherit" onClick={() => navigate('/')} sx={{color: 'var(--mavs-silver)', '&:hover': {color: 'var(--mavs-white)'}}}>Home</Button>
            <Button color="inherit" onClick={() => navigate('/bigboard')} sx={{color: 'var(--mavs-silver)', '&:hover': {color: 'var(--mavs-white)'}}}>Big Board</Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, py: {xs: 2, sm:3}, backgroundColor: 'var(--mavs-background)' , minHeight: 'calc(100vh - 70px)' /* Adjusted for potentially taller AppBar */ }}>
        <Routes>
          <Route path="/" element={<HomePage playerData={playerData} />} />
          <Route path="/bigboard" element={<BigBoard playerData={playerData} />} />
          <Route path="/player/:playerId" element={<PlayerProfile playerData={playerData} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
}

// Wrapper component to include BrowserRouter
function App() {
  return (
    <>
      <CssBaseline /> 
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
}

export default App;
