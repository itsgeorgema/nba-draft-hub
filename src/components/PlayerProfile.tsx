import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateAge, calculatePerGameStats, formatGameLogTime } from '../dataUtils';
import {
  Typography, Paper, Avatar, Box, ListItem, ListItemText,
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

type TypographyPropsOverride = Partial<React.ComponentProps<typeof ListItemText>['primaryTypographyProps']>;


const StatDisplay: React.FC<{
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  primaryTypographyProps?: TypographyPropsOverride;
  secondaryTypographyProps?: TypographyPropsOverride;
}> = ({ label, value, unit = '', primaryTypographyProps: primaryOverride, secondaryTypographyProps: secondaryOverride }) => (
  <ListItem sx={{ py: 0.5, px: 0 }}>
    <ListItemText
      primary={label}
      secondary={value != null && String(value).trim() !== '' ? `${String(value)}${unit}` : 'N/A'}
      primaryTypographyProps={{
        color: 'var(--nba-silver)',
        fontWeight: 'medium',
        fontSize: '1.0rem', 
        ...primaryOverride,
      }}
      secondaryTypographyProps={{
        color: 'var(--nba-white)',
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        ...secondaryOverride,
      }}
    />
  </ListItem>
);

const SectionPaper: React.FC<{ children: React.ReactNode, title: string, sx?: object }> = ({ children, title, sx }) => (
    <Paper elevation={3} sx={{ p: {xs: 2, sm: 3}, mb: 3, backgroundColor: 'var(--nba-navy-blue)', borderRadius: '16px', border: '2px solid var(--nba-red)', ...sx }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'var(--nba-white)', borderBottom: '2px solid var(--nba-red)', pb: 1, mb: 2, fontWeight: 'bold' }}>
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
      date: new Date().toISOString().split('T')[0],
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
    return ( // This Container might need to be a Box if PlayerProfile is wrapped in App.tsx's Container
        <Box sx={{textAlign: 'center', mt: 4, color: 'var(--nba-white)'}}> {/* Changed to Box */}
            <Typography variant="h5" color="error">Player not found.</Typography>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/bigboard')} sx={{ mt: 2, color: 'var(--nba-silver)', borderColor: 'var(--nba-silver)', '&:hover': {color: 'var(--nba-white)', borderColor: 'var(--nba-white)'} }}>
              Back to Big Board
            </Button>
        </Box>
    );
  }

  const formatHeight = (inches?: number | null) => inches ? `${Math.floor(inches / 12)}' ${inches % 12}"` : 'N/A';
  
  const gameLogTableCellSx = {
    fontSize: '1.05rem', 
    py: '12px', 
    px: '14px', 
    color: 'var(--nba-white)'
  };

  const gameLogTableHeadCellSx = {
    ...gameLogTableCellSx,
    backgroundColor: 'var(--nba-royal-blue)',
    fontWeight: 'bold',
  };

  const careerStatsPrimaryProps: TypographyPropsOverride = { fontSize: '1.1rem' };
  const careerStatsSecondaryProps: TypographyPropsOverride = { fontSize: '1.4rem' };


  return (
    // Changed root from Container to Box, as App.tsx now wraps PlayerProfile route in a Container
    <Box sx={{color: 'var(--nba-white)'}}> 
      <IconButton onClick={() => navigate('/bigboard')} sx={{ position: 'absolute', top: {xs: 100, sm: 110}, left: {xs: 16, sm: 24}, color: 'var(--nba-silver)', zIndex: 10, '&:hover': {color: 'var(--nba-white)', backgroundColor: 'rgba(255,255,255,0.1)'} }}>
        <ArrowBackIcon fontSize="large"/>
      </IconButton>

      <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}> {/* This mt:2 provides spacing from the top of the page content area */}
        <Avatar
          src={playerBio.photoUrl || undefined}
          alt={playerBio.name}
          sx={{ width: {xs: 120, sm: 180}, height: {xs: 120, sm: 180}, margin: '0 auto 16px auto', borderRadius: '50%'}}
        >
          {playerBio.firstName?.charAt(0)}{playerBio.lastName?.charAt(0)}
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>{playerBio.name}</Typography>
        <Typography variant="h6" sx={{color: 'var(--nba-silver)'}}>
            {playerBio.currentTeam || 'N/A'} - {playerBio.league || 'N/A'}
        </Typography>
      </Box>

      <SectionPaper title="Biographical Information">
        <Grid container spacing={{xs: 1, sm: 2}}>
          {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Birth Date" value={playerBio.birthDate ? new Date(playerBio.birthDate).toLocaleDateString() : 'N/A'} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Age" value={calculateAge(playerBio.birthDate)} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Height (Listed)" value={formatHeight(playerBio.height)} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Weight (Listed)" value={playerBio.weight} unit=" lbs" /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Nationality" value={playerBio.nationality} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="Hometown" value={`${playerBio.homeTown || ''}${playerBio.homeState ? `, ${playerBio.homeState}` : ''}`.trim() || 'N/A'} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="High School" value={`${playerBio.highSchool || ''} ${playerBio.highSchoolState ? `(${playerBio.highSchoolState})` : ''}`.trim() || 'N/A'} /></Grid>
            {/*@ts-ignore*/}
            <Grid item xs={12} sm={6} md={4}><StatDisplay label="League Type" value={playerBio.leagueType} /></Grid>
        </Grid>
      </SectionPaper>

      {playerMeasurements && (
        <SectionPaper title="Combine Measurements">
          <Grid container spacing={{xs: 1, sm: 2}}>
            {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="Height (Shoes)" value={playerMeasurements.heightShoes} unit='"' /></Grid>
           {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="Weight" value={playerMeasurements.weight} unit=" lbs" /></Grid>
           {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="Wingspan" value={playerMeasurements.wingspan} unit='"' /></Grid>
           {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="Standing Reach" value={playerMeasurements.reach} unit='"' /></Grid>
           {/*@ts-ignore*/}
            {playerMeasurements.bodyFat != null && <Grid item xs={6} sm={4} md={3}><StatDisplay label="Body Fat %" value={playerMeasurements.bodyFat} unit="%" /></Grid>}
           {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="Max Vertical" value={playerMeasurements.maxVertical} unit='"' /></Grid>
           {/*@ts-ignore*/}
            <Grid item xs={6} sm={4} md={3}><StatDisplay label="No-Step Vertical" value={playerMeasurements.noStepVertical} unit='"' /></Grid>
           {/*@ts-ignore*/}
            {playerMeasurements.sprint != null && <Grid item xs={6} sm={4} md={3}><StatDisplay label="Sprint" value={playerMeasurements.sprint} unit="s" /></Grid>}
            {/*@ts-ignore*/}
            {playerMeasurements.agility != null && <Grid item xs={6} sm={4} md={3}><StatDisplay label="Lane Agility" value={playerMeasurements.agility} unit="s" /></Grid>}
            {/*@ts-ignore*/}
            {playerMeasurements.handLength != null && <Grid item xs={6} sm={4} md={3}><StatDisplay label="Hand Length" value={playerMeasurements.handLength} unit='"' /></Grid>}
            {/*@ts-ignore*/}
            {playerMeasurements.handWidth != null && <Grid item xs={6} sm={4} md={3}><StatDisplay label="Hand Width" value={playerMeasurements.handWidth} unit='"' /></Grid>}
          </Grid>
        </SectionPaper>
      )}

      {playerSeasonLogs.length > 0 && (
        <SectionPaper title="Career Statistics">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <ToggleButtonGroup
              value={statsView}
              exclusive
              onChange={(_event, newView) => { if (newView !== null) setStatsView(newView); }}
              aria-label="stats view"
              size="small"
              sx={{
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid var(--nba-white)',
                  '&:not(:first-of-type)': {
                    borderLeft: '1px solid var(--nba-white)'
                  }
                }
              }}
            >
              <ToggleButton value="perGame" aria-label="per game" sx={{
                backgroundColor: 'var(--nba-red)',
                color: 'var(--nba-white)',
                fontWeight: 'bold',
                '&.Mui-selected': {backgroundColor: 'var(--nba-red)', color: 'var(--nba-white)', fontWeight: 'bold'},
                '&:not(.Mui-selected)': {backgroundColor: 'rgba(200, 0, 0, 0.6)', boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'},
                '&:hover': {backgroundColor: 'var(--nba-red)'},
                '&.Mui-selected:hover': {backgroundColor: 'var(--nba-red)'}
              }}>Per Game</ToggleButton>
              <ToggleButton value="seasonTotal" aria-label="season totals" sx={{
                backgroundColor: 'var(--nba-red)',
                color: 'var(--nba-white)',
                fontWeight: 'bold',
                '&.Mui-selected': {backgroundColor: 'var(--nba-red)', color: 'var(--nba-white)', fontWeight: 'bold'},
                '&:not(.Mui-selected)': {backgroundColor: 'rgba(200, 0, 0, 0.6)', boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'},
                '&:hover': {backgroundColor: 'var(--nba-red)'},
                '&.Mui-selected:hover': {backgroundColor: 'var(--nba-red)'}
              }}>Season Totals</ToggleButton>
            </ToggleButtonGroup>
            {availableSeasons.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'var(--nba-silver)'},'&:hover fieldset': {borderColor: 'var(--nba-white)'},}, '& .MuiInputLabel-root': {color: 'var(--nba-silver)'}, '& .MuiSelect-icon': {color: 'var(--nba-silver)'}}}>
                <InputLabel id="season-select-label-profile">Season</InputLabel>
                <Select<typeof selectedSeason>
                    labelId="season-select-label-profile"
                    value={selectedSeason}
                    label="Season"
                    onChange={(e: SelectChangeEvent<typeof selectedSeason>) => setSelectedSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    sx={{color: 'var(--nba-white)'}}
                    MenuProps={{ PaperProps: { sx: { backgroundColor: 'var(--nba-navy-blue)'}}}}
                >
                  <MenuItem value="all" sx={{color: 'var(--nba-white)'}}>All Seasons</MenuItem>
                  {availableSeasons.map(season => (
                    <MenuItem key={season} value={season} sx={{color: 'var(--nba-white)'}}>{season}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          {displaySeasonLogs.map((log, index) => (
            <Card key={`${log.playerId}-${log.Season}-${log.Team}-${index}`} sx={{ mb: 2, backgroundColor: 'var(--nba-royal-blue)', borderRadius: '12px', border: '1px solid var(--nba-red)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{color: 'var(--nba-white)', fontWeight:'bold'}}>{log.Season} Season - {log.Team} ({log.League})</Typography>
                <Grid container spacing={1}>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="PTS" value={log.PTS?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="REB" value={log.TRB?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="AST" value={log.AST?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label={statsView === 'perGame' ? "MPG" : "MP"} value={log.MP?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="GP" value={log.GP} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="GS" value={log.GS} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="STL" value={log.STL?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="BLK" value={log.BLK?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="FG%" value={log["FG%"]?.toFixed(1)} unit="%" primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="3P%" value={log["3P%"]?.toFixed(1)} unit="%" primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                 {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="FT%" value={(log.FTP ?? log["FT%"])?.toFixed(1)} unit="%" primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                  {/*@ts-ignore*/}
                  <Grid item xs={12} sm={12} md={12}><StatDisplay label="TOV" value={log.TOV?.toFixed(1)} primaryTypographyProps={careerStatsPrimaryProps} secondaryTypographyProps={careerStatsSecondaryProps} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </SectionPaper>
      )}

      {playerGameLogs.length > 0 && (
        <SectionPaper title="Recent Game Logs (Max 10)">
           <TableContainer component={Paper} sx={{ maxHeight: 400, backgroundColor: 'var(--nba-navy-blue)', border: '2px solid var(--nba-red)', borderRadius: '8px' }}>
            <Table stickyHeader size="small" aria-label="player game logs">
              <TableHead>
                <TableRow>
                  <TableCell sx={gameLogTableHeadCellSx}>Date</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>Opponent</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>MP</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>PTS</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>REB</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>AST</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>FG%</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>3P%</TableCell>
                  <TableCell sx={gameLogTableHeadCellSx}>+/-</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerGameLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.gameId} sx={{ '&:hover': { backgroundColor: 'rgba(23, 64, 139, 0.3)' }}}>
                    <TableCell sx={gameLogTableCellSx}>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log.opponent}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{formatGameLogTime(log.timePlayed)}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log.pts ?? 'N/A'}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log.reb ?? 'N/A'}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log.ast ?? 'N/A'}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log["fg%"] != null ? `${log["fg%"].toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log["tp%"] != null ? `${log["tp%"].toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell sx={gameLogTableCellSx}>{log.plusMinus ?? 'N/A'}</TableCell>
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
                '&::-webkit-scrollbar-track': { backgroundColor: 'var(--nba-navy-blue)' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--nba-silver)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'var(--nba-white)' }
            }}>
          {currentReports.length > 0 ? currentReports.map((report) => (
            <Paper key={report.reportId} sx={{ p: 2, mb: 2, backgroundColor: 'var(--nba-royal-blue)', borderRadius: '8px', border: '1px solid var(--nba-red)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" sx={{color: 'var(--nba-white)', fontWeight: 'bold', fontSize: '1.0rem'}}>{report.scout}</Typography>
                <Typography variant="caption" sx={{color: 'var(--nba-silver)', fontSize: '0.9rem'}}>{report.date ? new Date(report.date).toLocaleDateString() : 'No Date'}</Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(184, 196, 202, 0.3)', mb:1 }}/>
              <Typography variant="body2" sx={{whiteSpace: "pre-wrap", color: 'var(--nba-white)', fontSize: '1.0rem'}}>{report.report}</Typography>
            </Paper>
          )) : <Typography sx={{color: 'var(--nba-silver)', fontStyle: 'italic', fontSize: '1.0rem' }}>No scouting reports available for this player yet.</Typography>}
        </Box>
        <Typography variant="h6" gutterBottom sx={{color: 'var(--nba-white)', mt: 3, fontWeight: 'bold'}}>Add New Report</Typography>
         <TextField
              label="Scout Name"
              value={selectedScout}
              onChange={(e) => setSelectedScout(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ input: { color: 'var(--nba-white)' }, label: { color: 'var(--nba-silver)' }, '& .MuiOutlinedInput-root': {'& fieldset': {borderColor: 'red'},'&:hover fieldset': {borderColor: 'red'}, '&.Mui-focused fieldset': {borderColor: 'red'}}}}
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
                  '& fieldset': { borderColor: 'var(--nba-red)' },
                  '&:hover fieldset': { borderColor: 'var(--nba-red)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--nba-red)' },
                  '& textarea': { color: 'var(--nba-white)' },
              },
              label: { color: 'var(--nba-silver)'}
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddReport}
          sx={{
            backgroundColor: 'var(--nba-red)',
            color: 'var(--nba-white)',
            fontWeight: 'bold',
            border: '2px solid var(--nba-white)',
            mt: 1,
            '&:hover': {
              backgroundColor: '#a00020', 
              borderColor: 'var(--nba-silver)',
            },
          }}
        >
          Add Report
        </Button>
      </SectionPaper>
    </Box>
  );
};

export default PlayerProfile;