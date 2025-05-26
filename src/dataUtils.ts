import jsonData from '../data/intern_project_data.json';
import type { DraftData, PlayerBio, SeasonLog } from './types';

export const draftData: DraftData = jsonData as DraftData;

export const getPlayerNameById = (playerId: number): string => {
  const playerBio: PlayerBio | undefined = draftData.bio.find(p => p.playerId === playerId);
  return playerBio ? playerBio.name : "Unknown Player";
};

export const calculateAge = (birthDateString?: string | null): number | string => {
  if (!birthDateString) return 'N/A';
  try {
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return 'N/A';
  }
};

export const calculatePerGameStats = (log: SeasonLog): SeasonLog => {
    const gp = (log.GP && log.GP > 0) ? log.GP : 1;
    const perGame = (total?: number | null) => (total != null ? parseFloat((total / gp).toFixed(1)) : undefined);

    return {
        ...log,
        MP: perGame(log.MP),
        FGM: perGame(log.FGM),
        FGA: perGame(log.FGA),
        FG2M: perGame(log.FG2M),
        FG2A: perGame(log.FG2A),
        "3PM": perGame(log["3PM"]),
        "3PA": perGame(log["3PA"]),
        FTM: perGame(log.FTM ?? log.FT), 
        FTA: perGame(log.FTA),
        ORB: perGame(log.ORB),
        DRB: perGame(log.DRB),
        TRB: perGame(log.TRB),
        AST: perGame(log.AST),
        STL: perGame(log.STL),
        BLK: perGame(log.BLK),
        TOV: perGame(log.TOV),
        PF: perGame(log.PF),
        PTS: perGame(log.PTS),
    };
};

export const formatGameLogTime = (timePlayed?: string | null): string => {
    if (!timePlayed) return 'N/A';
    return String(timePlayed); 
};