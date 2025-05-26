import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateAge, calculatePerGameStats, formatGameLogTime } from '../dataUtils';
import {
  Container, Typography, Paper, Avatar, Box, List, ListItem, ListItemText,
  Divider, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid,
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { DraftData, PlayerBio, Measurement, GameLog, SeasonLog, ScoutingReport } from '../types';

interface PlayerProfileProps {
  playerData: DraftData;
}

const StatDisplay: React.FC<{ label: string; value: string | number | null | undefined; unit?: string }> = ({ label, value, unit = '' }) => (
  <ListItem sx={{ py: 0.5, px: 0 }}>
    <ListItemText
      primary={label}
      secondary={value != null && String(value).trim() !== '' ? `${String(value)}${unit}` : 'N/A'}
      primaryTypographyProps={{ color: 'var(--mavs-silver)', fontWeight: 'medium', fontSize: '0.9rem' }}
      secondaryTypographyProps={{color: 'var(--mavs-white)', fontSize: '1rem', fontWeight: 'bold'}}
    />
  </ListItem>
);

const SectionPaper: React.FC<{ children: React.ReactNode, title: string, sx?: object }> = ({ children, title, sx }) => (
    <Paper elevation={3} sx={{ p: {xs: 2, sm: 3}, mb: 3, backgroundColor: 'var(--mavs-navy-blue)', borderRadius: '16px', border: '1px solid var(--mavs-royal-blue)', ...sx }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'var(--mavs-white)', borderBottom: '2px solid var(--mavs-royal-blue)', pb: 1, mb: 2, fontWeight: 'bold' }}>
            {title}
        </Typography>
        {children}
    </Paper>
);

const PlayerProfile = ({ playerData }: PlayerProfileProps) => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [currentReports, setCurrentReports] = useState<ScoutingReport[]>([]);
  const [newReportText, setNewReportText] = useState('');
  const [selectedScout, setSelectedScout] = useState('Front Office User');
  const [statsView, setStatsView] = useState<'perGame' | 'seasonTotal'>('perGame');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');

  const numericPlayerId = useMemo(() => playerId ? parseInt(playerId, 10) : -1, [playerId]);

  const playerBio: PlayerBio | undefined = useMemo(
    () => playerData.bio.find(p => p.playerId === numericPlayerId),
    [playerData.bio, numericPlayerId]
  );

  const playerMeasurements: Measurement | undefined = useMemo(
    () => playerData.measurements.find(m => m.playerId === numericPlayerId),
    [playerData.measurements, numericPlayerId]
  );

  const playerGameLogs: GameLog[] = useMemo(
    () => playerData.game_logs
                    .filter(gl => gl.playerId === numericPlayerId)
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [playerData.game_logs, numericPlayerId]
  );

  const playerSeasonLogs: SeasonLog[] = useMemo(
    () => playerData.seasonLogs
                      .filter(sl => sl.playerId === numericPlayerId)
                      .sort((a,b) => b.Season - a.Season),
    [playerData.seasonLogs, numericPlayerId]
  );

  useEffect(() => {
    if (numericPlayerId !== -1) {
      const initialReports = playerData.scoutingReports
        .filter(sr => sr.playerId === numericPlayerId)
        .sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setCurrentReports(initialReports);
    } else {
      setCurrentReports([]);
    }
  }, [numericPlayerId, playerData.scoutingReports]);

  const handleAddReport = () => {
    if (newReportText.trim() === '' || !playerBio) return;
    const newReport: ScoutingReport = {
      reportId: `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      scout: selectedScout,
      report: newReportText,
      playerId: playerBio.playerId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };
    setCurrentReports(prevReports => [newReport, ...prevReports].sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
    setNewReportText('');
  };

  const availableSeasons = useMemo(() => {
    const seasons = new Set(playerSeasonLogs.map(log => log.Season));
    return Array.from(seasons).sort((a, b) => b - a);
  }, [playerSeasonLogs]);

  const filteredSeasonLogs = useMemo(() => {
    if (selectedSeason === 'all') return playerSeasonLogs;
    return playerSeasonLogs.filter(log => log.Season === selectedSeason);
  }, [playerSeasonLogs, selectedSeason]);

  const displaySeasonLogs = useMemo(() => (statsView === 'perGame'
    ? filteredSeasonLogs.map(log => calculatePerGameStats(log))
    : filteredSeasonLogs), [filteredSeasonLogs, statsView]);

  if (!playerBio) {
    return (
        <Container sx={{textAlign: 'center', mt: 4}}>
            <Typography variant="h5" color="error">Player not found.</Typography>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/bigboard')} sx={{ mt: 2 }}>
              Back to Big Board
            </Button>
        </Container>
    );
  }

  const formatHeight = (inches?: number | null) => inches ? `${Math.floor(inches / 12)}' ${inches % 12}"` : 'N/A';

  return (
    <Container maxWidth="lg" sx={{color: 'var(--mavs-white)'}}>
      <IconButton onClick={() => navigate('/bigboard')} sx={{ position: 'absolute', top: {xs: 80, sm: 90}, left: {xs: 16, sm: 24}, color: 'var(--mavs-silver)', zIndex: 10, '&:hover': {color: 'var(--mavs-white)', backgroundColor: 'rgba(255,255,255,0.1)'} }}>
        <ArrowBackIcon fontSize="large"/>
      </IconButton>

      <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
        <Avatar
          src={playerBio.photoUrl || undefined}
          alt={playerBio.name}
          sx={{ width: {xs: 120, sm: 180}, height: {xs: 120, sm: 180}, margin: '0 auto 16px auto', borderRadius: '50%'}}
        >
          {playerBio.firstName?.charAt(0)}{playerBio.lastName?.charAt(0)}
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>{playerBio.name}</Typography>
        <Typography variant="h6" sx={{color: 'var(--mavs-silver)'}}>
            {playerBio.currentTeam || 'N/A'} - {playerBio.league || 'N/A'}
        </Typography>
      </Box>

      <SectionPaper title="Biographical Information">
        {/* Changed md from 4 to 6 for a two-column layout on medium screens and up */}
        <Grid container spacing={{xs: 1, sm: 2}}>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="Birth Date" value={playerBio.birthDate ? new Date(playerBio.birthDate).toLocaleDateString() : 'N/A'} /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="Age" value={calculateAge(playerBio.birthDate)} /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="Nationality" value={playerBio.nationality} /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="League Type" value={playerBio.leagueType} /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="Height (Listed)" value={formatHeight(playerBio.height)} /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="Weight (Listed)" value={playerBio.weight} unit=" lbs" /></Grid>
            <Grid item xs={12} sm={6} md={6}><StatDisplay label="High School" value={`${playerBio.highSchool || ''} ${playerBio.highSchoolState ? `(${playerBio.highSchoolState})` : ''}`.trim() || 'N/A'} /></Grid>
             <Grid item xs={12} sm={6} md={6}><StatDisplay label="Hometown" value={`${playerBio.homeTown || ''}${playerBio.homeState ? `, ${playerBio.homeState}` : ''}`.trim() || 'N/A'} /></Grid>
        </Grid>
      </SectionPaper>

      {playerMeasurements && (
        <SectionPaper title="Combine Measurements">
          {/* Changed md from 3 to 4 for a three-column layout on medium screens and up, providing more space */}
          <Grid container spacing={{xs: 1, sm: 2}}>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="Height (Shoes)" value={playerMeasurements.heightShoes} unit='"' /></Grid>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="Weight" value={playerMeasurements.weight} unit=" lbs" /></Grid>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="Wingspan" value={playerMeasurements.wingspan} unit='"' /></Grid>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="Standing Reach" value={playerMeasurements.reach} unit='"' /></Grid>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="Max Vertical" value={playerMeasurements.maxVertical} unit='"' /></Grid>
            <Grid item xs={6} sm={4} md={4}><StatDisplay label="No-Step Vertical" value={playerMeasurements.noStepVertical} unit='"' /></Grid>
             {playerMeasurements.bodyFat != null && <Grid item xs={6} sm={4} md={4}><StatDisplay label="Body Fat %" value={playerMeasurements.bodyFat} unit="%" /></Grid>}
             {playerMeasurements.handLength != null && <Grid item xs={6} sm={4} md={4}><StatDisplay label="Hand Length" value={playerMeasurements.handLength} unit='"' /></Grid>}
             {playerMeasurements.handWidth != null && <Grid item xs={6} sm={4} md={4}><StatDisplay label="Hand Width" value={playerMeasurements.handWidth} unit='"' /></Grid>}
             {playerMeasurements.agility != null && <Grid item xs={6} sm={4} md={4}><StatDisplay label="Lane Agility" value={playerMeasurements.agility} unit="s" /></Grid>}
             {playerMeasurements.sprint != null && <Grid item xs={6} sm={4} md={4}><StatDisplay label="Sprint" value={playerMeasurements.sprint} unit="s" /></Grid>}
          </Grid>
        </SectionPaper>
      )}

      {playerSeasonLogs.length > 0 && (
        <SectionPaper title="Career Statistics">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <ToggleButtonGroup
              value={statsView}
              exclusive
              onChange={(event, newView) => { if (newView !== null) setStatsView(newView); }}
              aria-label="stats view"
              size="small"
            >
              <ToggleButton value="perGame" aria-label="per game" sx={{color: 'var(--mavs-silver)', '&.Mui-selected': {backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}, '&:hover': {backgroundColor: 'rgba(0, 83, 140, 0.2)'}}}>Per Game</ToggleButton>
              <ToggleButton value="seasonTotal" aria-label="season totals" sx={{color: 'var(--mavs-silver)', '&.Mui-selected': {backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}, '&:hover': {backgroundColor: 'rgba(0, 83, 140, 0.2)'}}}>Season Totals</ToggleButton>
            </ToggleButtonGroup>
            {availableSeasons.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}, '& .MuiInputLabel-root': {color: 'var(--mavs-silver)'}, '& .MuiSelect-icon': {color: 'var(--mavs-silver)'}}}>
                <InputLabel id="season-select-label-profile">Season</InputLabel>
                <Select<typeof selectedSeason>
                    labelId="season-select-label-profile"
                    value={selectedSeason}
                    label="Season"
                    onChange={(e: SelectChangeEvent<typeof selectedSeason>) => setSelectedSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    sx={{color: 'var(--mavs-white)'}}
                    MenuProps={{ PaperProps: { sx: { backgroundColor: 'var(--mavs-navy-blue)'}}}}
                >
                  <MenuItem value="all" sx={{color: 'var(--mavs-white)'}}>All Seasons</MenuItem>
                  {availableSeasons.map(season => (
                    <MenuItem key={season} value={season} sx={{color: 'var(--mavs-white)'}}>{season}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          {displaySeasonLogs.map((log, index) => (
            <Card key={`${log.playerId}-${log.Season}-${log.Team}-${index}`} sx={{ mb: 2, backgroundColor: 'var(--mavs-royal-blue)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{color: 'var(--mavs-white)', fontWeight:'bold'}}>{log.Season} Season - {log.Team} ({log.League})</Typography>
                {/* Changed md from 2 to 3 for stats, meaning 4 stats per row on md screens for better readability. Reordered stats. */}
                <Grid container spacing={1}>
                  {/* Group 1: Playing Time & Core Production */}
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="GP" value={log.GP} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="GS" value={log.GS} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label={statsView === 'perGame' ? "MPG" : "MP"} value={log.MP?.toFixed(1)} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="PTS" value={log.PTS?.toFixed(1)} /></Grid>
                  
                  {/* Group 2: Rebounds, Assists & Defensive */}
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="REB" value={log.TRB?.toFixed(1)} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="AST" value={log.AST?.toFixed(1)} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="STL" value={log.STL?.toFixed(1)} /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="BLK" value={log.BLK?.toFixed(1)} /></Grid>

                  {/* Group 3: Shooting Efficiency & Turnovers */}
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="FG%" value={log["FG%"]?.toFixed(1)} unit="%" /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="3P%" value={log["3P%"]?.toFixed(1)} unit="%" /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="FT%" value={(log.FTP ?? log["FT%"])?.toFixed(1)} unit="%" /></Grid>
                  <Grid item xs={6} sm={3} md={3}><StatDisplay label="TOV" value={log.TOV?.toFixed(1)} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </SectionPaper>
      )}

      {playerGameLogs.length > 0 && (
        <SectionPaper title="Recent Game Logs (Max 10)">
           <TableContainer component={Paper} sx={{ maxHeight: 400, backgroundColor: 'var(--mavs-navy-blue)', border: '1px solid var(--mavs-royal-blue)', borderRadius: '8px' }}>
            <Table stickyHeader size="small" aria-label="player game logs">
              <TableHead>
                <TableRow>
                  {/* Added sx for header cells for theming consistency */}
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>Date</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>Opponent</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>MP</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>PTS</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>REB</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>AST</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>FG%</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>3P%</TableCell>
                  <TableCell sx={{backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)', fontWeight: 'bold'}}>+/-</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerGameLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.gameId} sx={{ '&:hover': { backgroundColor: 'rgba(0, 83, 140, 0.3)' }}}> {/* Added hover effect */}
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log.opponent}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{formatGameLogTime(log.timePlayed)}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log.pts ?? 'N/A'}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log.reb ?? 'N/A'}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log.ast ?? 'N/A'}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log["fg%"] != null ? `${log["fg%"].toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log["tp%"] != null ? `${log["tp%"].toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell sx={{color: 'var(--mavs-white)'}}>{log.plusMinus ?? 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionPaper>
      )}

      <SectionPaper title="Scouting Reports">
         <Box mb={2} sx={{maxHeight: '400px', overflowY: 'auto', pr: 1,
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { backgroundColor: 'var(--mavs-navy-blue)' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--mavs-silver)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'var(--mavs-white)' }
            }}>
          {currentReports.length > 0 ? currentReports.map((report) => (
            <Paper key={report.reportId} sx={{ p: 2, mb: 2, backgroundColor: 'var(--mavs-royal-blue)', borderRadius: '8px' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>{report.scout}</Typography>
                <Typography variant="caption" sx={{color: 'var(--mavs-silver)'}}>{report.date ? new Date(report.date).toLocaleDateString() : 'No Date'}</Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(184, 196, 202, 0.3)', mb:1 }}/>
              <Typography variant="body2" sx={{whiteSpace: "pre-wrap", color: 'var(--mavs-white)'}}>{report.report}</Typography>
            </Paper>
          )) : <Typography sx={{color: 'var(--mavs-silver)', fontStyle: 'italic'}}>No scouting reports available for this player yet.</Typography>}
        </Box>
        <Typography variant="h6" gutterBottom sx={{color: 'var(--mavs-white)', mt: 3, fontWeight: 'bold'}}>Add New Report</Typography>
         <TextField
              label="Scout Name"
              value={selectedScout}
              onChange={(e) => setSelectedScout(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ input: { color: 'var(--mavs-white)' }, label: { color: 'var(--mavs-silver)' }, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'}, '&.Mui-focused fieldset': {borderColor: 'var(--mavs-white)'}}}}
          />
        <TextField
          label="New Scouting Report Details"
          multiline
          rows={4}
          value={newReportText}
          onChange={(e) => setNewReportText(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          sx={{
              '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'var(--mavs-silver)' },
                  '&:hover fieldset': { borderColor: 'var(--mavs-white)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--mavs-white)' },
                  '& textarea': { color: 'var(--mavs-white)' },
              },
              label: { color: 'var(--mavs-silver)'}
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddReport}
          sx={{ mt: 1, backgroundColor: 'var(--mavs-silver)', color: 'var(--mavs-navy-blue)', fontWeight: 'bold', '&:hover': {backgroundColor: 'var(--mavs-white)'} }}
        >
          Add Report
        </Button>
      </SectionPaper>
    </Container>
  );
};

export default PlayerProfile;