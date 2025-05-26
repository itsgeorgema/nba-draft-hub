import { Typography, Container, Button, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import mavsLogo from '../assets/mavs-logo.png';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: { xs: 2, sm: 4 }, py: { xs: 2, sm: 4 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          backgroundColor: 'var(--mavs-navy-blue)', 
          color: 'var(--mavs-white)',
          borderRadius: '16px',
          border: '1px solid var(--mavs-royal-blue)'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '100px', marginBottom: '16px' }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--mavs-white)'}}>
          Dallas Mavericks Draft Hub 2025
        </Typography>
        <Typography variant="h6" sx={{ color: 'var(--mavs-silver)', mb: 4, lineHeight: 1.6 }}>
          Welcome to the Dallas Mavericks Draft Hub for the 2025 NBA Draft.
          Explore comprehensive prospect information, including detailed bios, measurements,
          career statistics, and scouting reports to make the best decisions.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/bigboard')}
          sx={{
            backgroundColor: 'var(--mavs-royal-blue)',
            color: 'var(--mavs-white)',
            padding: '12px 24px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#006AD5', 
            },
          }}
        >
          View Big Board
        </Button>
      </Paper>
    </Container>
  );
};

export default HomePage;