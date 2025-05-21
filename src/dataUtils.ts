// src/dataUtils.ts
import jsonData from './data/intern_project_data.json'; // Adjusted path

// Define an interface for the structure of your JSON data for better type safety
// This should match the top-level structure of your intern_project_data.json
interface DraftData {
  bio: Array<any>; // Replace 'any' with more specific PlayerBio type
  scoutRankings: Array<any>; // Replace 'any' with ScoutRanking type
  measurements: Array<any>; // Replace 'any' with Measurement type
  game_logs: Array<any>; // Replace 'any' with GameLog type
  seasonLogs: Array<any>; // Replace 'any' with SeasonLog type
  scoutingReports: Array<any>; // Replace 'any' with ScoutingReport type
  // Add other top-level keys if present
}

export const draftData: DraftData = jsonData as DraftData;

// Helper function to get player's full name from bio
export const getPlayerNameById = (playerId: number): string => {
  const playerBio = draftData.bio.find(p => p.playerId === playerId);
  return playerBio ? playerBio.name : "Unknown Player";
};

// Helper function to calculate age from birthDate
export const calculateAge = (birthDateString?: string): number | string => {
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

// You can define more specific types here if you haven't already
// For example:
/*
export interface PlayerBio {
  playerId: number;
  name: string;
  // ... other fields
}
// etc. for ScoutRanking, Measurement, GameLog, SeasonLog, ScoutingReport
*/