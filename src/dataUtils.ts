// src/dataUtils.ts
import jsonData from '../data/intern_project_data.json';
import type { DraftData, PlayerBio, SeasonLog } from './types'; // Import defined types

export const draftData: DraftData = jsonData as DraftData;

// Helper function to get player's full name from bio (if needed elsewhere, currently not used in BigBoard/PlayerProfile)
export const getPlayerNameById = (playerId: number): string => {
  const playerBio = draftData.bio.find(p => p.playerId === playerId);
  return playerBio ? playerBio.name : "Unknown Player";
};

// Helper function to calculate age from birthDate
export const calculateAge = (birthDateString?: string | null): number | string => {
  if (!birthDateString) return 'N/A';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Function to calculate per-game stats from season totals
export const calculatePerGameStats = (log: SeasonLog): SeasonLog => {
    const gp = (log.GP && log.GP > 0) ? log.GP : 1; // Avoid division by zero or using non-positive GP
    return {
        ...log,
        MP: log.MP != null ? parseFloat((log.MP / gp).toFixed(1)) : undefined,
        FGM: log.FGM != null ? parseFloat((log.FGM / gp).toFixed(1)) : undefined,
        FGA: log.FGA != null ? parseFloat((log.FGA / gp).toFixed(1)) : undefined,
        "3PM": log["3PM"] != null ? parseFloat((log["3PM"] / gp).toFixed(1)) : undefined,
        "3PA": log["3PA"] != null ? parseFloat((log["3PA"] / gp).toFixed(1)) : undefined,
        FTM: log.FTM != null ? parseFloat((log.FTM / gp).toFixed(1)) : undefined, // Use FTM if available, or FT for season total
        FTA: log.FTA != null ? parseFloat((log.FTA / gp).toFixed(1)) : undefined,
        ORB: log.ORB != null ? parseFloat((log.ORB / gp).toFixed(1)) : undefined,
        DRB: log.DRB != null ? parseFloat((log.DRB / gp).toFixed(1)) : undefined,
        TRB: log.TRB != null ? parseFloat((log.TRB / gp).toFixed(1)) : undefined,
        AST: log.AST != null ? parseFloat((log.AST / gp).toFixed(1)) : undefined,
        STL: log.STL != null ? parseFloat((log.STL / gp).toFixed(1)) : undefined,
        BLK: log.BLK != null ? parseFloat((log.BLK / gp).toFixed(1)) : undefined,
        TOV: log.TOV != null ? parseFloat((log.TOV / gp).toFixed(1)) : undefined,
        PF: log.PF != null ? parseFloat((log.PF / gp).toFixed(1)) : undefined,
        PTS: log.PTS != null ? parseFloat((log.PTS / gp).toFixed(1)) : undefined,
    };
};