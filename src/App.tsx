import { useState } from 'react'; // useEffect and other async related imports removed
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import BigBoard from './components/BigBoard';
import PlayerProfile from './components/PlayerProfile';
import { Typography, Box, AppBar, Toolbar, CssBaseline, Container, Button } from '@mui/material';
import type { DraftData } from './types';
import mavsLogo from './assets/nba-logo.png';
import { draftData } from './dataUtils'; // Import draftData directly from dataUtils

function AppContent() {
  const [playerData] = useState<DraftData>(draftData); 
  const navigate = useNavigate();
  if (!playerData) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--nba-navy-blue)', color: 'var(--nba-white)', p:3, textAlign: 'center' }}>
        <img src={mavsLogo} alt="NBA Logo" style={{ height: '100px', marginBottom: '20px' }} />
        <Typography variant="h5" sx={{color: 'var(--nba-error-red)'}} gutterBottom>Critical Error: Player Data Missing</Typography>
        <Typography sx={{color: 'var(--nba-silver)'}}>The essential player data could not be loaded from the application bundle. This indicates a build or packaging issue.</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'var(--nba-background)' }} elevation={0}>
        <Container maxWidth="xl" sx={{ px: 3 }}>
          <Toolbar disableGutters sx={{ minHeight: '80px', py: 2 }}>
            <img 
              src={mavsLogo} 
              alt="NBA Logo" 
              style={{height: 60, marginRight: 16, cursor: 'pointer'}}
              onClick={() => navigate('/')}
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, color: 'var(--nba-white)', cursor: 'pointer',  '&:hover': { textDecoration: 'underline' } }} 
              onClick={() => navigate('/')}
            >
              NBA Draft Hub
            </Typography>
            <Button color="inherit" onClick={() => navigate('/')} sx={{color: 'var(--nba-white)', fontSize: '1.1rem', fontWeight: 'semibold', '&:hover': {color: 'var(--nba-white)', backgroundColor: 'rgba(255,255,255,0.1)'}}}>Home</Button>
            <Button color="inherit" onClick={() => navigate('/bigboard')} sx={{color: 'var(--nba-white)', fontSize: '1.1rem', fontWeight: 'semibold', '&:hover': {color: 'var(--nba-white)', backgroundColor: 'rgba(255,255,255,0.1)'}}}>Big Board</Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'var(--nba-background)', minHeight: 'calc(100vh - 64px)' }}>
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