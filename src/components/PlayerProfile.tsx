// src/components/PlayerProfile.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateAge, calculatePerGameStats } from '../dataUtils'; // Assuming dataUtils is in src/
import {
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select'; // More specific import for SelectChangeEvent
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Ensure this path is correct relative to PlayerProfile.tsx
// If PlayerProfile.tsx is in src/components/ and types.ts is in src/, then '../types' is correct.
import type { DraftData, PlayerBio, Measurement, GameLog, SeasonLog, ScoutingReport } from '../types';

interface PlayerProfileProps {
  playerData: DraftData;
}

const PlayerProfile = ({ playerData }: PlayerProfileProps) => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate(); // Hook for navigation
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

  // Not directly used in current JSX, but available
  const playerGameLogs: GameLog[] = useMemo(
    () => playerData.game_logs.filter(gl => gl.playerId === numericPlayerId),
    [playerData.game_logs, numericPlayerId]
  );

  const playerSeasonLogs: SeasonLog[] = useMemo(
    () => playerData.seasonLogs.filter(sl => sl.playerId === numericPlayerId),
    [playerData.seasonLogs, numericPlayerId]
  );

  useEffect(() => {
    if (numericPlayerId !== -1) {
      const initialReports = playerData.scoutingReports.filter(
        (sr) => sr.playerId === numericPlayerId
      );
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
      date: new Date().toLocaleDateString(),
    };
    setCurrentReports(prevReports => [...prevReports, newReport]);
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
    ? filteredSeasonLogs.map(log => calculatePerGameStats(log)) // Pass the log to the function
    : filteredSeasonLogs), [filteredSeasonLogs, statsView]);

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to handle navigation back to Big Board
  const handleExitToBigBoard = () => {
    navigate('/'); // Navigate to the root path where BigBoard is
  };
  
  if (!playerBio) {
    // Using Container for consistent layout even on error/loading states
    return (
        <Container sx={{textAlign: 'center', mt: 4}}>
            <Typography variant="h5" color="error">Player not found.</Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleExitToBigBoard}
              sx={{ mt: 2 }}
            >
              Back to Big Board
            </Button>
        </Container>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3}, backgroundColor: 'var(--mavs-black)', color: 'var(--mavs-white)' }}>
      {/* Exit to Big Board Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleExitToBigBoard}
        sx={{ 
          mb: 3, 
          borderColor: 'var(--mavs-silver)', 
          color: 'var(--mavs-silver)', 
          '&:hover': { 
            borderColor: 'var(--mavs-white)', 
            color: 'var(--mavs-white)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)' 
          } 
        }}
      >
        Back to Big Board
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src={playerBio.photoUrl || undefined}
            alt={playerBio.name}
            sx={{ width: 150, height: 150, margin: '0 auto 16px auto', border: '3px solid var(--mavs-silver)' }}
          >
            {playerBio.firstName?.charAt(0)}{playerBio.lastName?.charAt(0)}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{color: 'var(--mavs-white)'}}>{playerBio.name}</Typography>
          <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Team: {playerBio.currentTeam || 'N/A'} ({playerBio.league || 'N/A'})</Typography>
          <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Age: {calculateAge(playerBio.birthDate)}</Typography>
          <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Height: {playerBio.height ? `${Math.floor(playerBio.height / 12)}' ${playerBio.height % 12}"` : 'N/A'}</Typography>
          <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Weight: {playerBio.weight ? `${playerBio.weight} lbs` : 'N/A'}</Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="player profile tabs"
              TabIndicatorProps={{ style: { backgroundColor: 'var(--mavs-silver)'}}}
              sx={{ "& .MuiTab-root": { color: 'var(--mavs-silver)'}, "& .Mui-selected": { color: 'var(--mavs-white)'}}}
            >
              <Tab label="Bio & Measurements" />
              <Tab label="Stats" />
              <Tab label="Scouting Reports" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Biographical Information</Typography>
              <List dense>
                <ListItem><ListItemText primary="Full Name" secondary={playerBio.name || 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}}/></ListItem>
                <ListItem><ListItemText primary="Birth Date" secondary={playerBio.birthDate ? new Date(playerBio.birthDate).toLocaleDateString() : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                <ListItem><ListItemText primary="High School" secondary={`${playerBio.highSchool || 'N/A'} (${playerBio.highSchoolState || 'N/A'})`} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                <ListItem><ListItemText primary="Hometown" secondary={`${playerBio.homeTown || 'N/A'}, ${playerBio.homeState || playerBio.homeCountry || 'N/A'}`} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                <ListItem><ListItemText primary="Nationality" secondary={playerBio.nationality || 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
              </List>
              <Divider sx={{ my: 2, borderColor: 'var(--mavs-royal-blue)' }} />
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Measurements</Typography>
              {playerMeasurements ? (
                <List dense>
                  <ListItem><ListItemText primary="Height (Shoes)" secondary={playerMeasurements.heightShoes ? `${playerMeasurements.heightShoes}"` : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                  <ListItem><ListItemText primary="Wingspan" secondary={playerMeasurements.wingspan ? `${playerMeasurements.wingspan}"` : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                  <ListItem><ListItemText primary="Standing Reach" secondary={playerMeasurements.reach ? `${playerMeasurements.reach}"` : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                  <ListItem><ListItemText primary="Max Vertical" secondary={playerMeasurements.maxVertical ? `${playerMeasurements.maxVertical}"` : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                  <ListItem><ListItemText primary="Weight" secondary={playerMeasurements.weight ? `${playerMeasurements.weight} lbs` : 'N/A'} secondaryTypographyProps={{color: 'var(--mavs-silver)'}} /></ListItem>
                </List>
              ) : <Typography sx={{color: 'var(--mavs-silver)'}}>No measurement data available.</Typography>}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Player Statistics</Typography>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <FormControl size="small" sx={{ m: 1, minWidth: 120, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}, '& .MuiInputLabel-root': {color: 'var(--mavs-silver)'}, '& .MuiSelect-icon': {color: 'var(--mavs-silver)'}}}>
                        <InputLabel id="stats-view-label">View</InputLabel>
                        <Select<typeof statsView> // Explicitly type Select
                            labelId="stats-view-label"
                            value={statsView}
                            label="View"
                            onChange={(e: SelectChangeEvent<typeof statsView>) => setStatsView(e.target.value as 'perGame' | 'seasonTotal')}
                            sx={{color: 'var(--mavs-silver)'}}
                        >
                            <MenuItem value="perGame">Per Game</MenuItem>
                            <MenuItem value="seasonTotal">Season Totals</MenuItem>
                        </Select>
                    </FormControl>
                    {availableSeasons.length > 0 && (
                       <FormControl size="small" sx={{ m: 1, minWidth: 120, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}, '& .MuiInputLabel-root': {color: 'var(--mavs-silver)'}, '& .MuiSelect-icon': {color: 'var(--mavs-silver)'} }}>
                            <InputLabel id="season-select-label">Season</InputLabel>
                            <Select<typeof selectedSeason> // Explicitly type Select
                                labelId="season-select-label"
                                value={selectedSeason}
                                label="Season"
                                onChange={(e: SelectChangeEvent<typeof selectedSeason>) => setSelectedSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                 sx={{color: 'var(--mavs-silver)'}}
                            >
                                <MenuItem value="all">All Seasons</MenuItem>
                                {availableSeasons.map(season => (
                                    <MenuItem key={season} value={season}>{season}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>
              {displaySeasonLogs.length > 0 ? (
                <TableContainer component={Paper} sx={{backgroundColor: 'var(--mavs-navy-blue)'}}>
                  <Table size="small" aria-label="player statistics table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>Season</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>Team</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>League</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>GP</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>{statsView === 'perGame' ? 'MPG' : 'MP'}</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>PTS</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>REB</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>AST</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>STL</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>BLK</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>FG%</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>3P%</TableCell>
                        <TableCell sx={{color: 'var(--mavs-white)', fontWeight: 'bold'}}>FT%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displaySeasonLogs.map((log, index) => (
                        <TableRow key={`${log.playerId}-${log.Season}-${log.Team}-${index}`} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(184, 196, 202, 0.05)'}}}>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.Season}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.Team}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.League}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.GP != null ? log.GP : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.MP != null ? log.MP.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.PTS != null ? log.PTS.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.TRB != null ? log.TRB.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.AST != null ? log.AST.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.STL != null ? log.STL.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.BLK != null ? log.BLK.toFixed(1) : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log["FG%"] != null ? `${(log["FG%"]).toFixed(1)}%` : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log["3P%"] != null ? `${(log["3P%"]).toFixed(1)}%` : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.FTP != null ? `${(log.FTP).toFixed(1)}%` : (log["FT%"] != null ? `${(log["FT%"] * 100).toFixed(1)}%` : 'N/A')}</TableCell> {/* Assuming FT% might be a decimal like 0.75 */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Typography sx={{color: 'var(--mavs-silver)'}}>No season statistics available.</Typography>}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Scouting Reports</Typography>
              <Box mb={2} sx={{maxHeight: '300px', overflowY: 'auto', pr: 1, 
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-track': { backgroundColor: 'var(--mavs-navy-blue)' },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--mavs-silver)', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'var(--mavs-white)' }
              }}> {/* Added padding right for scrollbar & scrollbar styling */}
                {currentReports.length > 0 ? currentReports.map((report) => (
                  <Paper key={report.reportId} sx={{ p: 2, mb: 1, backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)' }}>
                    <Typography variant="subtitle2" gutterBottom><strong>Scout:</strong> {report.scout} {report.date && `(${report.date})`}</Typography>
                    <Typography variant="body2" sx={{whiteSpace: "pre-wrap"}}>{report.report}</Typography> {/* Allow line breaks */}
                  </Paper>
                )) : <Typography sx={{color: 'var(--mavs-silver)'}}>No scouting reports available for this player yet.</Typography>}
              </Box>
              <Typography variant="h6" gutterBottom sx={{color: 'var(--mavs-white)'}}>Add New Report</Typography>
               <TextField
                    label="Scout Name" // Changed from Scout Name (Optional) to just Scout Name as it's always set
                    value={selectedScout}
                    onChange={(e) => setSelectedScout(e.target.value)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    sx={{ input: { color: 'var(--mavs-white)' }, label: { color: 'var(--mavs-silver)' }, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}}}
                />
              <TextField
                label="New Scouting Report"
                multiline
                rows={4}
                value={newReportText}
                onChange={(e) => setNewReportText(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                InputLabelProps={{ style: { color: 'var(--mavs-silver)' } }}
                InputProps={{ style: { color: 'var(--mavs-white)' } }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'var(--mavs-silver)' },
                        '&:hover fieldset': { borderColor: 'var(--mavs-white)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--mavs-white)' },
                        '& textarea': { color: 'var(--mavs-white)' }, // Ensure textarea text color
                    },
                    label: { color: 'var(--mavs-silver)'}
                }}
              />
              <Button variant="contained" onClick={handleAddReport} sx={{ mt: 1, backgroundColor: 'var(--mavs-silver)', color: 'var(--mavs-navy-blue)', '&:hover': {backgroundColor: 'var(--mavs-white)'} }}>
                Add Report
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PlayerProfile;