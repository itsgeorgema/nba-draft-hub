import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { Typography, CircularProgress, Box, AppBar, Toolbar, CssBaseline, Container, Button } from '@mui/material';
import type { DraftData } from './types';
import mavsLogo from './assets/mavs-logo.png';

function AppContent() {
  const [playerData, setPlayerData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        <Typography variant="h5" sx={{color: 'var(--mavs-error-red)'}} gutterBottom>Error Loading Application Data</Typography>
        <Typography sx={{color: 'var(--mavs-silver)'}}>{error || 'Player data could not be loaded. Please try refreshing the page or check the console for more details.'}</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'var(--mavs-black)' }} elevation={0}> {/* elevation={0} removes shadow */}
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 1 } }}> 
          <Toolbar disableGutters>
            <img 
              src={mavsLogo} 
              alt="Mavs Logo" 
              style={{height: 60, marginRight: 16, cursor: 'pointer'}}
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
      <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'var(--mavs-background)', minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<HomePage playerData={playerData} />} />
          <Route 
            path="/bigboard" 
            element={
              <Container maxWidth="xl" sx={{ py: {xs: 2, sm:3} }}> 
                <BigBoard playerData={playerData} />
              </Container>
            } 
          />
          <Route 
            path="/player/:playerId" 
            element={
              <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}> {/* Added Container for consistent padding */}
                <PlayerProfile playerData={playerData} />
              </Container>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
}

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