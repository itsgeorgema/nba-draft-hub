import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, Avatar, Typography, Box, Chip, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { calculateAge } from '../dataUtils';
import type { DraftData, PlayerBio, ScoutRanking, CombinedPlayerData } from '../types';

interface BigBoardProps {
  playerData: DraftData;
}

const BigBoard = ({ playerData }: BigBoardProps) => {
  const navigate = useNavigate();
  const [orderBy, setOrderBy] = useState<keyof CombinedPlayerData | string>('avgRank');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const scoutSources: string[] = useMemo(() => {
    if (playerData && playerData.scoutRankings.length > 0) {
      const firstRankings = playerData.scoutRankings[0];
      return Object.keys(firstRankings).filter(key => key !== 'playerId' && Object.prototype.hasOwnProperty.call(firstRankings, key) && firstRankings[key as keyof ScoutRanking] != null);
    }
    return ["ESPN Rank", "Sam Vecenie Rank", "Kevin O'Connor Rank", "Kyle Boone Rank", "Gary Parrish Rank"];
  }, [playerData]);


  const combinedData: CombinedPlayerData[] = useMemo(() => {
    return playerData.bio.map((bio: PlayerBio) => {
      const rankings: ScoutRanking | undefined = playerData.scoutRankings.find(
        (r: ScoutRanking) => r.playerId === bio.playerId
      );
      let sumRanks = 0;
      let countRanks = 0;

      if (rankings) {
        scoutSources.forEach(source => {
           if (Object.prototype.hasOwnProperty.call(rankings, source)) {
            const rankValue = rankings[source as keyof ScoutRanking];
            if (rankValue != null && typeof rankValue === 'number') {
              sumRanks += rankValue;
              countRanks++;
            }
          }
        });
      }
      const avgRank = countRanks > 0 ? sumRanks / countRanks : null;

      return {
        ...bio,
        scoutRankings: rankings,
        avgRank: avgRank,
      };
    });
  }, [playerData, scoutSources]);

  const handleRequestSort = (property: keyof CombinedPlayerData | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAndSortedData = useMemo(() => {
    let sortableData = [...combinedData];

    if (searchTerm) {
      sortableData = sortableData.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.currentTeam?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    sortableData.sort((a, b) => {
      let valA, valB;

      if (scoutSources.includes(orderBy as string) || orderBy === 'avgRank') {
        valA = orderBy === 'avgRank' ? a.avgRank : a.scoutRankings?.[orderBy as string];
        valB = orderBy === 'avgRank' ? b.avgRank : b.scoutRankings?.[orderBy as string];
      } else {
        valA = a[orderBy as keyof CombinedPlayerData];
        valB = b[orderBy as keyof CombinedPlayerData];
      }
      
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1; 
      if (valB == null) return -1; 

      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? (Number(valA)) - (Number(valB)) : (Number(valB)) - (Number(valA));
    });
    return sortableData;
  }, [combinedData, order, orderBy, searchTerm, scoutSources]);

 const getRankDifferenceIndicator = (rank: number | null | undefined, avgRank: number | null | undefined) => {
    if (rank == null || avgRank == null) return null;
    const difference = rank - avgRank;
    // Chips with white text and colored outline
    if (difference < -3) return <Chip label="Valuable" size="medium" variant="outlined" sx={{ml: 1, borderColor: 'var(--mavs-green)', color: 'var(--mavs-white)', fontSize: '0.9rem', height: '32px', fontWeight: 'medium'}}/>;
    if (difference > 3) return <Chip label="Overrated" size="medium" variant="outlined" sx={{ml: 1, borderColor: 'var(--mavs-error-red)', color: 'var(--mavs-white)', fontSize: '0.9rem', height: '32px', fontWeight: 'medium'}}/>;
    return null;
  };

  const tableCellSx = { 
    padding: '18px',
    fontSize: '1.15rem',
    color: 'var(--mavs-white)', 
    borderBottom: '1px solid var(--mavs-royal-blue-transparent)', 
  };
  
  const tableHeadCellSx = {
    ...tableCellSx, 
    backgroundColor: 'var(--mavs-royal-blue)', 
    fontWeight: 'bold',
    color: 'var(--mavs-white)', // Explicitly white for header text
    borderBottom: '2px solid var(--mavs-silver)', 
  };

  return (
    <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden', 
        backgroundColor: 'var(--mavs-navy-blue)', 
        borderRadius: '16px', 
        border: '1px solid var(--mavs-royal-blue)'
    }}>
      <Box sx={{ p: {xs:2, sm:3}, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h3" gutterBottom component="div" sx={{ color: 'var(--mavs-white)', mb: {xs: 2, md: 0}, fontSize: {xs: '2.3rem', sm: '2.8rem'} }}>
          2025 NBA Draft Big Board
        </Typography>
        <TextField
          label="Search Prospects"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            minWidth: {xs: '100%', sm:'320px'},
            '& .MuiInputLabel-root': { color: 'var(--mavs-silver)', fontSize: '1.1rem' },
            '& .MuiOutlinedInput-root': {
              color: 'var(--mavs-white)', 
              fontSize: '1.1rem',
              '& fieldset': { borderColor: 'var(--mavs-silver)' },
              '&:hover fieldset': { borderColor: 'var(--mavs-white)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--mavs-white)' },
              '& .MuiOutlinedInput-input': { padding: '16px 18px', color: 'var(--mavs-white)' /* Ensure input text is white */ },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'var(--mavs-silver)', fontSize: '2rem' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeadCellSx}>Photo</TableCell>
              <TableCell sx={tableHeadCellSx}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  sx={{ 
                    '& .MuiTableSortLabel-icon': { color: 'var(--mavs-white) !important'}, 
                    '&, &:hover, &.Mui-active': { color: 'var(--mavs-white) !important'}, // Ensure text is white in all states
                    fontSize: '1.1rem'
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={tableHeadCellSx}>Team</TableCell>
              <TableCell sx={tableHeadCellSx}>Age</TableCell>
              <TableCell sx={tableHeadCellSx}>
                <TableSortLabel
                  active={orderBy === 'avgRank'}
                  direction={orderBy === 'avgRank' ? order : 'asc'}
                  onClick={() => handleRequestSort('avgRank')}
                   sx={{ 
                    '& .MuiTableSortLabel-icon': { color: 'var(--mavs-white) !important'},
                    '&, &:hover, &.Mui-active': { color: 'var(--mavs-white) !important'},
                    fontSize: '1.1rem'
                  }}
                >
                  Avg. Scout
                </TableSortLabel>
              </TableCell>
              {scoutSources.map(source => (
                <TableCell key={source} sx={tableHeadCellSx}>
                  <TableSortLabel
                     active={orderBy === source}
                     direction={orderBy === source ? order : 'asc'}
                     onClick={() => handleRequestSort(source)}
                      sx={{ 
                        '& .MuiTableSortLabel-icon': { color: 'var(--mavs-white) !important'}, 
                        '&, &:hover, &.Mui-active': { color: 'var(--mavs-white) !important'},
                        fontSize: '1.1rem' 
                      }}
                  >
                    {source.replace(' Rank','').replace('Sam Vecenie', 'Vecenie').replace("Kevin O'Connor", "KOC")}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.map((player) => (
              <TableRow
                hover
                key={player.playerId}
                onClick={() => navigate(`/player/${player.playerId}`)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'var(--mavs-royal-blue-transparent-hover)' 
                  }
                }}
              >
                <TableCell sx={tableCellSx}>
                  <Avatar src={player.photoUrl || undefined} alt={player.name} sx={{ width: 68, height: 68 }}>
                    {player.firstName?.charAt(0)}{player.lastName?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell sx={{...tableCellSx, fontWeight: 'medium'}}>{player.name}</TableCell>
                <TableCell sx={tableCellSx}>{player.currentTeam || 'N/A'}</TableCell>
                <TableCell sx={tableCellSx}>{calculateAge(player.birthDate)}</TableCell>
                <TableCell sx={{...tableCellSx, fontWeight: 'medium'}}>{player.avgRank != null ? player.avgRank.toFixed(1) : 'N/A'}</TableCell>
                {scoutSources.map(source => {
                    const rank = player.scoutRankings?.[source as keyof ScoutRanking];
                    return (
                        <TableCell key={`${player.playerId}-${source}`} sx={tableCellSx}>
                           <Box display="flex" alignItems="center">
                              {rank != null ? rank : 'N/A'}
                              {getRankDifferenceIndicator(typeof rank === 'number' ? rank : null, player.avgRank)}
                            </Box>
                        </TableCell>
                    );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BigBoard;
