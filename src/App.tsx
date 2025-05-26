import { useState } from 'react'; // useEffect and other async related imports removed
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { Typography, Box, AppBar, Toolbar, CssBaseline, Container, Button } from '@mui/material';
import type { DraftData } from './types';
import mavsLogo from './assets/mavs-logo.png';
import { draftData } from './dataUtils'; // Import draftData directly from dataUtils

function AppContent() {
  // Initialize playerData directly from the imported draftData.
  // Since the data is bundled, it's immediately available, so no async loading is needed.
  const [playerData] = useState<DraftData>(draftData); 
  // No 'loading' or 'error' states related to async fetch needed anymore for this data.
  const navigate = useNavigate();

  // The previous useEffect block for fetching data is no longer necessary.

  // Simplified loading/error handling, assuming data is always bundled.
  // If `draftData` itself could theoretically be null/empty, you'd add a check here.
  // However, given it's a direct import of a static JSON, it should always be present.
  if (!playerData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--mavs-navy-blue)', color: 'var(--mavs-white)', p:3, textAlign: 'center' }}>
        <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '100px', marginBottom: '20px' }} />
        <Typography variant="h5" sx={{color: 'var(--mavs-error-red)'}} gutterBottom>Critical Error: Player Data Missing</Typography>
        <Typography sx={{color: 'var(--mavs-silver)'}}>The essential player data could not be loaded from the application bundle. This indicates a build or packaging issue.</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'var(--mavs-black)' }} elevation={0}>
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
              <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
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