// src/components/BigBoard.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TableSortLabel, Avatar, Typography, Box, Tooltip, Chip
} from '@mui/material';
import { draftData, getPlayerNameById, calculateAge } from '../dataUtils'; 


// Define types for better type checking (optional but good practice)
interface PlayerBio {
  playerId: number;
  name: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  currentTeam?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  // Add other relevant bio fields
}

interface ScoutRanking {
  playerId: number;
  "ESPN Rank"?: number | null;
  "Sam Vecenie Rank"?: number | null;
  "Kevin O'Connor Rank"?: number | null;
  "Kyle Boone Rank"?: number | null;
  "Gary Parrish Rank"?: number | null;
  // Add other scout sources if they appear in your data
}

interface CombinedPlayerData extends PlayerBio {
  scoutRankings?: ScoutRanking;
  avgRank?: number | null;
  mavsRank?: number | null; // Assuming one of the ranks is the "Mavericks" scout
}

const BigBoard = ({ playerData }) => {
  const navigate = useNavigate();
  const [orderBy, setOrderBy] = useState<string>('avgRank'); // Default sort
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const scoutSources = ["ESPN Rank", "Sam Vecenie Rank", "Kevin O'Connor Rank", "Kyle Boone Rank", "Gary Parrish Rank"];

  const combinedData = useMemo(() => {
    return playerData.bio.map((bio: PlayerBio) => {
      const rankings = playerData.scoutRankings.find(r => r.playerId === bio.playerId) as ScoutRanking | undefined;
      let sumRanks = 0;
      let countRanks = 0;
      let rankValues: number[] = [];

      if (rankings) {
        scoutSources.forEach(source => {
          if (rankings[source] != null) {
            sumRanks += rankings[source];
            countRanks++;
            rankValues.push(rankings[source]);
          }
        });
      }
      const avgRank = countRanks > 0 ? sumRanks / countRanks : null;
      // Requirement: Treat the publicly sourced player rankings in the scoutRankings array as if they are the Mavericks scouts.
      // Assuming "ESPN Rank" is one of the main "Mavericks Scout" ranks for display emphasis or specific sorting.
      // You can change this logic based on which scout(s) are considered primary by the Mavericks.
      const mavsRank = rankings ? rankings["ESPN Rank"] : null;


      return {
        ...bio,
        scoutRankings: rankings,
        avgRank: avgRank,
        mavsRank: mavsRank, // Example for primary Mavs scout rank
      };
    });
  }, [playerData]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    let sortableData = [...combinedData];
    sortableData.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      // Handle nulls: nulls go to the end for asc, beginning for desc
      if (valA == null && valB == null) return 0;
      if (valA == null) return order === 'asc' ? 1 : -1;
      if (valB == null) return order === 'asc' ? -1 : 1;
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
    return sortableData;
  }, [combinedData, order, orderBy]);

  const getRankDifferenceIndicator = (rank: number | null | undefined, avgRank: number | null) => {
    if (rank == null || avgRank == null) return null;
    const difference = rank - avgRank;
    if (difference < -5) return <Chip label="High" color="success" size="small" />; // Scout is significantly higher (lower rank number)
    if (difference > 5) return <Chip label="Low" color="error" size="small" />;   // Scout is significantly lower (higher rank number)
    return null;
  };


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: 'var(--mavs-navy-blue)' }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ p: 2, color: 'var(--mavs-white)' }}>
        2025 NBA Draft Big Board
      </Typography>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' /* Adjust based on header/footer */ }}>
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
              {/* Display individual scout rankings as per requirement */}
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
            {sortedData.map((player: CombinedPlayerData) => (
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
                <TableCell sx={{color: 'var(--mavs-white)'}}>{player.birthDate ? calculateAge(player.birthDate) : 'N/A'}</TableCell>
                <TableCell sx={{color: 'var(--mavs-white)'}}>{player.avgRank != null ? player.avgRank.toFixed(1) : 'N/A'}</TableCell>
                {scoutSources.map(source => {
                    const rank = player.scoutRankings ? player.scoutRankings[source] : null;
                    return (
                        <TableCell key={`${player.playerId}-${source}`} sx={{color: 'var(--mavs-white)'}}>
                            {rank != null ? rank : 'N/A'}
                            {getRankDifferenceIndicator(rank, player.avgRank)}
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