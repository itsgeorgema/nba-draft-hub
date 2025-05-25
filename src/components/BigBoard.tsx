import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, Avatar, Typography, Box, Chip
} from '@mui/material';
import { calculateAge } from '../dataUtils';
import type { DraftData, PlayerBio, ScoutRanking, CombinedPlayerData } from '../types';

interface BigBoardProps {
  playerData: DraftData;
}

const BigBoard = ({ playerData }: BigBoardProps) => {
  const navigate = useNavigate();
  const [orderBy, setOrderBy] = useState<keyof CombinedPlayerData | string>('avgRank'); // Default sort, string for scout keys
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const scoutSources: string[] = ["ESPN Rank", "Sam Vecenie Rank", "Kevin O'Connor Rank", "Kyle Boone Rank", "Gary Parrish Rank"];

  const combinedData: CombinedPlayerData[] = useMemo(() => {
    return playerData.bio.map((bio: PlayerBio) => {
      const rankings: ScoutRanking | undefined = playerData.scoutRankings.find(
        (r: ScoutRanking) => r.playerId === bio.playerId
      );
      let sumRanks = 0;
      let countRanks = 0;

      if (rankings) {
        scoutSources.forEach(source => {
          const rankValue = rankings[source as keyof ScoutRanking];
          if (rankValue != null) {
            sumRanks += rankValue;
            countRanks++;
          }
        });
      }
      const avgRank = countRanks > 0 ? sumRanks / countRanks : null;
      const mavsRank = rankings ? rankings["ESPN Rank"] : null;

      return {
        ...bio,
        scoutRankings: rankings,
        avgRank: avgRank,
        mavsRank: mavsRank,
      };
    });
  }, [playerData]);

  const handleRequestSort = (property: keyof CombinedPlayerData | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    let sortableData = [...combinedData];
    sortableData.sort((a, b) => {
      let valA, valB;

      if (scoutSources.includes(orderBy as string)) {
        valA = a.scoutRankings?.[orderBy as string];
        valB = b.scoutRankings?.[orderBy as string];
      } else {
        valA = a[orderBy as keyof CombinedPlayerData];
        valB = b[orderBy as keyof CombinedPlayerData];
      }

      if (valA == null && valB == null) return 0;
      if (valA == null) return order === 'asc' ? 1 : -1;
      if (valB == null) return order === 'asc' ? -1 : 1;
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? (Number(valA)) - (Number(valB)) : (Number(valB)) - (Number(valA));
    });
    return sortableData;
  }, [combinedData, order, orderBy]);

  const getRankDifferenceIndicator = (rank: number | null | undefined, avgRank: number | null | undefined) => {
    if (!rank || !avgRank) return null;
    const difference = rank - avgRank;
    if (difference < -5) return <Chip label="High" color="success" size="small" />;
    if (difference > 5) return <Chip label="Low" color="error" size="small" />;
    return null;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: 'var(--mavs-navy-blue)' }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ p: 2, color: 'var(--mavs-white)' }}>
        2025 NBA Draft Big Board
      </Typography>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>Photo</TableCell>
              <TableCell sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>Team</TableCell>
              <TableCell sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>Age</TableCell>
              <TableCell sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>
                <TableSortLabel
                  active={orderBy === 'avgRank'}
                  direction={orderBy === 'avgRank' ? order : 'asc'}
                  onClick={() => handleRequestSort('avgRank')}
                >
                  Avg. Scout Rank
                </TableSortLabel>
              </TableCell>
              {scoutSources.map(source => (
                <TableCell key={source} sx={{color: 'var(--mavs-white)', backgroundColor: 'var(--mavs-royal-blue)'}}>
                  <TableSortLabel
                     active={orderBy === source}
                     direction={orderBy === source ? order : 'asc'}
                     onClick={() => handleRequestSort(source)}
                  >
                    {source.replace(' Rank','')}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((player) => (
              <TableRow
                hover
                key={player.playerId}
                onClick={() => navigate(`/player/${player.playerId}`)}
                sx={{ cursor: 'pointer', '&:nth-of-type(odd)': { backgroundColor: 'rgba(184, 196, 202, 0.05)'}, '&:hover': {backgroundColor: 'rgba(0, 83, 188, 0.3)'} }}
              >
                <TableCell>
                  <Avatar src={player.photoUrl || undefined} alt={player.name}>
                    {player.firstName?.charAt(0)}{player.lastName?.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell sx={{color: 'var(--mavs-white)'}}>{player.name}</TableCell>
                <TableCell sx={{color: 'var(--mavs-white)'}}>{player.currentTeam || 'N/A'}</TableCell>
                <TableCell sx={{color: 'var(--mavs-white)'}}>{calculateAge(player.birthDate)}</TableCell>
                <TableCell sx={{color: 'var(--mavs-white)'}}>{player.avgRank != null ? player.avgRank.toFixed(1) : 'N/A'}</TableCell>
                {scoutSources.map(source => {
                    const rank = player.scoutRankings?.[source];
                    return (
                        <TableCell key={`${player.playerId}-${source}`} sx={{color: 'var(--mavs-white)'}}>
                           <Box display="flex" alignItems="center">
                              {rank != null ? rank : 'N/A'}
                              {getRankDifferenceIndicator(rank ?? null, player.avgRank)}
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