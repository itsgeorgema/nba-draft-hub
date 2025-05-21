// src/components/PlayerProfile.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { draftData, getPlayerNameById, calculateAge } from '../dataUtils'; 
import {
  Container, Typography, Paper, Grid, Avatar, Box, List, ListItem, ListItemText,
  Divider, Tabs, Tab, TextField, Button, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent
} from '@mui/material';

// Define types for clarity (can be in a separate types.ts file)
interface PlayerBio {
  playerId: number;
  name: string;
  photoUrl?: string | null;
  birthDate?: string;
  height?: number;
  weight?: number;
  highSchool?: string;
  homeTown?: string;
  homeState?: string | null;
  homeCountry?: string;
  nationality?: string;
  currentTeam?: string;
  league?: string;
  // ... other fields
}

interface Measurement {
  playerId: number;
  heightNoShoes?: number | null;
  heightShoes?: number | null;
  wingspan?: number | null;
  reach?: number | null;
  maxVertical?: number | null;
  noStepVertical?: number | null;
  weight?: number | null;
  bodyFat?: number | null;
  handLength?: number | null;
  handWidth?: number | null;
  // ... other fields
}

interface GameLog {
    playerId: number;
    season: number;
    date: string;
    team: string;
    opponent: string;
    gp: number; // Assuming this is minutes played or a similar metric for "games played"
    timePlayed: string;
    fgm: number;
    fga: number;
    "fg%": number | null;
    tpm: number;
    tpa: number;
    "tp%": number | null;
    ftm: number;
    fta: number;
    "ft%": number | null;
    oreb: number;
    dreb: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    pts: number;
    // ... other fields
}
interface SeasonLog {
    playerId: number;
    Season: number;
    Team: string;
    League: string;
    GP: number; // Games Played
    GS?: number;
    MP?: number; // Minutes Per Game
    FGM?: number;
    FGA?: number;
    "FG%"?: number;
    "3PM"?: number;
    "3PA"?: number;
    "3P%"?: number;
    FTM?: number; // Renamed from FT for clarity
    FTA?: number;
    "FTP"?: number; // Renamed from FTP for clarity
    ORB?: number;
    DRB?: number;
    TRB?: number;
    AST?: number;
    STL?: number;
    BLK?: number;
    TOV?: number;
    PF?: number;
    PTS?: number;
    // ... other fields
}


interface ScoutingReport {
  reportId: string;
  scout: string;
  report: string;
  playerId: number;
  date?: string; // Optional: Add date if you want to include it
}

interface PlayerProfileProps {
  playerData: typeof draftData;
}

const PlayerProfile = ({ playerData }: PlayerProfileProps) => {
  const { playerId } = useParams<{ playerId: string }>();
  const [currentReports, setCurrentReports] = useState<ScoutingReport[]>([]);
  const [newReportText, setNewReportText] = useState('');
  const [selectedScout, setSelectedScout] = useState('Front Office User'); // Default or allow selection
  const [statsView, setStatsView] = useState<'perGame' | 'seasonTotal'>('perGame');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');


  const playerBio: PlayerBio | undefined = useMemo(
    () => playerData.bio.find(p => p.playerId === parseInt(playerId || '', 10)),
    [playerData.bio, playerId]
  );

  const playerMeasurements: Measurement | undefined = useMemo(
    () => playerData.measurements.find(m => m.playerId === parseInt(playerId || '', 10)),
    [playerData.measurements, playerId]
  );

  const playerGameLogs: GameLog[] = useMemo(
    () => playerData.game_logs.filter(gl => gl.playerId === parseInt(playerId || '', 10)),
    [playerData.game_logs, playerId]
  );
  const playerSeasonLogs: SeasonLog[] = useMemo(
    () => playerData.seasonLogs.filter(sl => sl.playerId === parseInt(playerId || '', 10)),
    [playerData.seasonLogs, playerId]
  );

  useEffect(() => {
    if (playerId) {
      const initialReports = playerData.scoutingReports.filter(
        (sr) => sr.playerId === parseInt(playerId, 10)
      );
      setCurrentReports(initialReports);
    }
  }, [playerId, playerData.scoutingReports]);

  if (!playerBio) {
    return <Typography variant="h5">Player not found.</Typography>;
  }

  const handleAddReport = () => {
    if (newReportText.trim() === '') return;
    const newReport: ScoutingReport = {
      reportId: `report-${Date.now()}`, // Simple unique ID
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
    return Array.from(seasons).sort((a, b) => b - a); // Sort descending
  }, [playerSeasonLogs]);

  const filteredSeasonLogs = useMemo(() => {
    if (selectedSeason === 'all') return playerSeasonLogs;
    return playerSeasonLogs.filter(log => log.Season === selectedSeason);
  }, [playerSeasonLogs, selectedSeason]);

  const calculatePerGameStats = (log: SeasonLog): SeasonLog => {
    const gp = log.GP || 1; // Avoid division by zero
    return {
        ...log,
        MP: log.MP ? parseFloat((log.MP / gp).toFixed(1)) : undefined,
        FGM: log.FGM ? parseFloat((log.FGM / gp).toFixed(1)) : undefined,
        FGA: log.FGA ? parseFloat((log.FGA / gp).toFixed(1)) : undefined,
        "3PM": log["3PM"] ? parseFloat((log["3PM"] / gp).toFixed(1)) : undefined,
        "3PA": log["3PA"] ? parseFloat((log["3PA"] / gp).toFixed(1)) : undefined,
        FTM: log.FTM ? parseFloat((log.FTM / gp).toFixed(1)) : undefined,
        FTA: log.FTA ? parseFloat((log.FTA / gp).toFixed(1)) : undefined,
        ORB: log.ORB ? parseFloat((log.ORB / gp).toFixed(1)) : undefined,
        DRB: log.DRB ? parseFloat((log.DRB / gp).toFixed(1)) : undefined,
        TRB: log.TRB ? parseFloat((log.TRB / gp).toFixed(1)) : undefined,
        AST: log.AST ? parseFloat((log.AST / gp).toFixed(1)) : undefined,
        STL: log.STL ? parseFloat((log.STL / gp).toFixed(1)) : undefined,
        BLK: log.BLK ? parseFloat((log.BLK / gp).toFixed(1)) : undefined,
        TOV: log.TOV ? parseFloat((log.TOV / gp).toFixed(1)) : undefined,
        PF: log.PF ? parseFloat((log.PF / gp).toFixed(1)) : undefined,
        PTS: log.PTS ? parseFloat((log.PTS / gp).toFixed(1)) : undefined,
    };
  };

  const displaySeasonLogs = statsView === 'perGame'
    ? filteredSeasonLogs.map(calculatePerGameStats)
    : filteredSeasonLogs;


  // Tabs state
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, backgroundColor: 'var(--mavs-black)', color: 'var(--mavs-white)' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src={playerBio.photoUrl || undefined}
            alt={playerBio.name}
            sx={{ width: 150, height: 150, margin: '0 auto 16px auto', border: '3px solid var(--mavs-silver)' }}
          >
            {playerBio.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{color: 'var(--mavs-white)'}}>{playerBio.name}</Typography>
          <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Team: {playerBio.currentTeam || 'N/A'} ({playerBio.league || 'N/A'})</Typography>
           <Typography variant="subtitle1" sx={{color: 'var(--mavs-silver)'}}>Age: {playerBio.birthDate ? calculateAge(playerBio.birthDate) : 'N/A'}</Typography>
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

          {/* Bio & Measurements Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Biographical Information</Typography>
              <List dense>
                <ListItem><ListItemText primary="Full Name" secondary={playerBio.name} secondaryTypographyProps={{color: 'var(--mavs-silver)'}}/></ListItem>
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
                  {/* Add more measurements as needed */}
                </List>
              ) : <Typography sx={{color: 'var(--mavs-silver)'}}>No measurement data available.</Typography>}
            </Box>
          )}

          {/* Stats Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Player Statistics</Typography>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <FormControl size="small" sx={{ m: 1, minWidth: 120, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}, '& .MuiInputLabel-root': {color: 'var(--mavs-silver)'}, '& .MuiSelect-icon': {color: 'var(--mavs-silver)'}}}>
                        <InputLabel id="stats-view-label">View</InputLabel>
                        <Select
                            labelId="stats-view-label"
                            value={statsView}
                            label="View"
                            onChange={(e: SelectChangeEvent) => setStatsView(e.target.value as 'perGame' | 'seasonTotal')}
                            sx={{color: 'var(--mavs-silver)'}}
                        >
                            <MenuItem value="perGame">Per Game</MenuItem>
                            <MenuItem value="seasonTotal">Season Totals</MenuItem>
                        </Select>
                    </FormControl>
                    {availableSeasons.length > 0 && (
 광고                       <FormControl size="small" sx={{ m: 1, minWidth: 120, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}, '& .MuiInputLabel-root': {color: 'var(--mavs-silver)'}, '& .MuiSelect-icon': {color: 'var(--mavs-silver)'} }}>
                            <InputLabel id="season-select-label">Season</InputLabel>
                            <Select
                                labelId="season-select-label"
                                value={selectedSeason}
                                label="Season"
                                onChange={(e: SelectChangeEvent<number | 'all'>) => setSelectedSeason(e.target.value as number | 'all')}
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
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Season</TableCell>
                        <TableCell>Team</TableCell>
                        <TableCell>League</TableCell>
                        <TableCell>GP</TableCell>
                        <TableCell>MPG</TableCell>
                        <TableCell>PTS</TableCell>
                        <TableCell>REB</TableCell>
                        <TableCell>AST</TableCell>
                        <TableCell>STL</TableCell>
                        <TableCell>BLK</TableCell>
                        <TableCell>FG%</TableCell>
                        <TableCell>3P%</TableCell>
                        <TableCell>FT%</TableCell>
                        {/* Add more stats as needed */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displaySeasonLogs.map((log, index) => (
                        <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(184, 196, 202, 0.05)'}}}>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.Season}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.Team}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.League}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.GP}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.MP?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.PTS?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.TRB?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.AST?.toFixed(1) || 'N/A'}</TableCell>
                           <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.STL?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log.BLK?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log["FG%"] != null ? `${log["FG%"].toFixed(1)}%` : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log["3P%"] != null ? `${log["3P%"].toFixed(1)}%` : 'N/A'}</TableCell>
                          <TableCell sx={{color: 'var(--mavs-silver)'}}>{log["FTP"] != null ? `${log["FTP"].toFixed(1)}%` : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : <Typography sx={{color: 'var(--mavs-silver)'}}>No season statistics available.</Typography>}
            </Box>
          )}

          {/* Scouting Reports Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{color: 'var(--mavs-white)'}}>Scouting Reports</Typography>
              <Box mb={2}>
                {currentReports.map((report) => (
                  <Paper key={report.reportId} sx={{ p: 2, mb: 1, backgroundColor: 'var(--mavs-royal-blue)', color: 'var(--mavs-white)' }}>
                    <Typography variant="subtitle2" gutterBottom><strong>Scout:</strong> {report.scout} {report.date && `(${report.date})`}</Typography>
                    <Typography variant="body2">{report.report}</Typography>
                  </Paper>
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{color: 'var(--mavs-white)'}}>Add New Report</Typography>
               <TextField
                    label="Scout Name (Optional)"
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
                sx={{ textarea: { color: 'var(--mavs-white)' }, label: { color: 'var(--mavs-silver)' }, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--mavs-silver)'},'&:hover fieldset': {borderColor: 'var(--mavs-white)'},}}}
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