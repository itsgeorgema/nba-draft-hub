import React, { useMemo } from 'react';
import { Typography, Container, Button, Paper, Box, Grid, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import mavsLogo from '../assets/mavs-logo.png';
import type { DraftData, PlayerBio, ScoutRanking, SeasonLog } from '../types';
import { calculateAge, calculatePerGameStats } from '../dataUtils';

interface HomePageProps {
  playerData: DraftData | null;
}

const OverviewStat: React.FC<{ label: string; value: string | number | undefined | null; unit?: string; subValue?: string | null }> = ({ label, value, unit = '', subValue }) => (
  <Paper elevation={2} sx={{ p: {xs: 2, sm: 2.5}, textAlign: 'center', backgroundColor: 'var(--mavs-royal-blue)', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="h6" sx={{ color: 'var(--mavs-silver)', fontWeight: 'medium', fontSize: '1rem', mb: 0.5 }}>{label}</Typography>
    <Typography variant="h4" sx={{ color: 'var(--mavs-white)', fontWeight: 'bold', fontSize: {xs: '1.8rem', sm: '2.1rem'}, lineHeight: 1.2 }}>
      {value ?? 'N/A'}{value != null && String(value).trim() !== 'N/A' && unit ? unit : ''}
    </Typography>
    {subValue && <Typography variant="caption" sx={{color: 'var(--mavs-silver)', fontSize: '0.85rem', mt: 0.5}}>{subValue}</Typography>}
  </Paper>
);

const HomePage = ({ playerData }: HomePageProps) => {
  const navigate = useNavigate();

  const scoutSources = useMemo(() => {
    if (playerData && playerData.scoutRankings.length > 0) {
      const firstRankings = playerData.scoutRankings[0];
      // Ensure that we only return keys that actually exist on the object and are not 'playerId'
      return Object.keys(firstRankings).filter(key => key !== 'playerId' && Object.prototype.hasOwnProperty.call(firstRankings, key) && firstRankings[key as keyof ScoutRanking] != null);
    }
    // Default scout sources if no rankings data or empty
    return ["ESPN Rank", "Sam Vecenie Rank", "Kevin O'Connor Rank", "Kyle Boone Rank", "Gary Parrish Rank"];
  }, [playerData]);

  const topRankedPlayerInfo = useMemo(() => {
    if (!playerData || !playerData.bio.length || !playerData.scoutRankings.length) return { name: 'N/A', rank: 'N/A' };

    let bestAvgRank = Infinity;
    let topPlayer: PlayerBio | null = null;

    playerData.bio.forEach(bio => {
      const rankings = playerData.scoutRankings.find(r => r.playerId === bio.playerId);
      if (rankings) {
        let sumRanks = 0;
        let countRanks = 0;
        scoutSources.forEach(source => {
          // Check if the source key actually exists on the rankings object
          if (Object.prototype.hasOwnProperty.call(rankings, source)) {
            const rankValue = rankings[source as keyof ScoutRanking];
            if (rankValue != null && typeof rankValue === 'number') {
              sumRanks += rankValue;
              countRanks++;
            }
          }
        });
        if (countRanks > 0) {
          const avgRank = sumRanks / countRanks;
          if (avgRank < bestAvgRank) {
            bestAvgRank = avgRank;
            topPlayer = bio;
          }
        }
      }
    });
    
    return topPlayer ? { name: topPlayer.name, rank: bestAvgRank.toFixed(1) } : { name: 'N/A', rank: 'N/A' };
  }, [playerData, scoutSources]);

  const classAverages = useMemo(() => {
    if (!playerData || !playerData.bio.length) return { age: 'N/A', height: 'N/A', weight: 'N/A' };
    let totalAge = 0, ageCount = 0;
    let totalHeightInches = 0, heightCount = 0;
    let totalWeightLbs = 0, weightCount = 0;

    playerData.bio.forEach(p => {
      if (p.birthDate) {
        const age = calculateAge(p.birthDate);
        if (age !== null && !isNaN(age)) { totalAge += age; ageCount++; }
      }
      if (p.height != null) { totalHeightInches += p.height; heightCount++; }
      if (p.weight != null) { totalWeightLbs += p.weight; weightCount++; }
    });

    const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : 'N/A';
    const avgHeightVal = heightCount > 0 ? (totalHeightInches / heightCount) : null;
    const avgHeightStr = avgHeightVal ? `${Math.floor(avgHeightVal / 12)}' ${(avgHeightVal % 12).toFixed(1)}"` : 'N/A';
    const avgWeight = weightCount > 0 ? (totalWeightLbs / weightCount).toFixed(1) : 'N/A';
    
    return { age: avgAge, height: avgHeightStr, weight: avgWeight };
  }, [playerData]);

  const avgPerformanceStats = useMemo(() => {
    if (!playerData || !playerData.seasonLogs.length) return { pts: 'N/A', reb: 'N/A', ast: 'N/A' };

    const latestSeasonStatsPerPlayer = new Map<number, SeasonLog>();
    playerData.seasonLogs.forEach(log => {
      const existing = latestSeasonStatsPerPlayer.get(log.playerId);
      if (!existing || log.Season > existing.Season) {
        latestSeasonStatsPerPlayer.set(log.playerId, log);
      }
    });

    let totalPts = 0, totalReb = 0, totalAst = 0, ptsCount = 0, rebCount = 0, astCount = 0;
    
    latestSeasonStatsPerPlayer.forEach(log => {
      const perGame = calculatePerGameStats(log); // Assumes calculatePerGameStats handles missing fields gracefully
      if (perGame.PTS != null && !isNaN(perGame.PTS)) { totalPts += perGame.PTS; ptsCount++; }
      if (perGame.TRB != null && !isNaN(perGame.TRB)) { totalReb += perGame.TRB; rebCount++; }
      if (perGame.AST != null && !isNaN(perGame.AST)) { totalAst += perGame.AST; astCount++; }
    });

    return {
      pts: ptsCount > 0 ? (totalPts / ptsCount).toFixed(1) : 'N/A',
      reb: rebCount > 0 ? (totalReb / rebCount).toFixed(1) : 'N/A',
      ast: astCount > 0 ? (totalAst / astCount).toFixed(1) : 'N/A',
    };
  }, [playerData]);


  if (!playerData) { 
    return (
      <Container sx={{ textAlign: 'center', mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)'}}>
        <CircularProgress sx={{color: 'var(--mavs-white)'}}/>
        <Typography sx={{mt: 2, color: 'var(--mavs-silver)'}}>Loading player data for homepage...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          mb: 4,
          backgroundColor: 'var(--mavs-navy-blue)', 
          color: 'var(--mavs-white)',
          borderRadius: '20px',
          border: '1px solid var(--mavs-royal-blue)',
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <img src={mavsLogo} alt="Dallas Mavericks Logo" style={{ height: '100px', marginBottom: '16px' }} />
        </Box>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--mavs-white)', fontSize: {xs: '2.2rem', sm: '3rem', md: '3.5rem'} }}>
          Dallas Mavericks Draft Hub 2025
        </Typography>
        <Typography variant="h5" sx={{ color: 'var(--mavs-silver)', mb: 4, lineHeight: 1.6, fontSize: {xs: '1rem', sm: '1.15rem', md: '1.25rem'}, maxWidth: '750px', marginX: 'auto' }}>
          Welcome to the central hub for the 2025 NBA Draft.
          Explore comprehensive prospect information, including detailed bios, measurements,
          career statistics, and scouting reports to make informed decisions.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/bigboard')}
          sx={{
            backgroundColor: 'var(--mavs-royal-blue)',
            color: 'var(--mavs-white)',
            padding: '14px 28px',
            fontSize: {xs: '1rem', sm: '1.15rem'},
            fontWeight: 'bold',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#004A9E', 
            },
          }}
        >
          View Big Board
        </Button>
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 4,
          backgroundColor: 'var(--mavs-navy-blue)', 
          color: 'var(--mavs-white)',
          borderRadius: '20px',
          border: '1px solid var(--mavs-royal-blue)'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--mavs-white)', textAlign: 'center', mb: {xs: 3, sm: 4}, fontSize: {xs: '1.8rem', sm: '2.2rem', md: '2.5rem'} }}>
          Draft Class Snapshot
        </Typography>
        <Grid container spacing={{xs: 2, sm: 3}} justifyContent="center">
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Total Prospects" value={playerData.bio.length} /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Top Ranked" value={topRankedPlayerInfo.name} subValue={topRankedPlayerInfo.rank !== 'N/A' ? `Avg. Rank: ${topRankedPlayerInfo.rank}` : null} /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Average Age" value={classAverages.age} unit=" yrs" /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Average Height" value={classAverages.height} /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Average Weight" value={classAverages.weight} unit=" lbs" /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Avg. Class PTS" value={avgPerformanceStats.pts} unit="/g" /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Avg. Class REB" value={avgPerformanceStats.reb} unit="/g" /></Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}><OverviewStat label="Avg. Class AST" value={avgPerformanceStats.ast} unit="/g" /></Grid>
        </Grid>
      </Paper>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 4,
          backgroundColor: 'transparent',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{color: 'var(--mavs-silver)'}} align="center">
            Not officially affiliated with the Dallas Mavericks or the NBA.
          </Typography>
           <Typography variant="caption" sx={{color: 'var(--mavs-silver)', display: 'block', textAlign: 'center', mt: 0.5}}>
            All data is for informational purposes only.
          </Typography>
        </Container>
      </Box>
    </Container>
  );
};

export default HomePage;
