export interface PlayerBio {
  playerId: number;
  name: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  height?: number | null;
  weight?: number | null;
  highSchool?: string | null;
  highSchoolState?: string | null;
  homeTown?: string | null;
  homeState?: string | null;
  homeCountry?: string | null;
  nationality?: string | null;
  photoUrl?: string | null;
  currentTeam?: string | null;
  league?: string | null;
  leagueType?: string | null;
}

export interface ScoutRanking {
  playerId: number;
  "ESPN Rank"?: number | null;
  "Sam Vecenie Rank"?: number | null;
  "Kevin O'Connor Rank"?: number | null;
  "Kyle Boone Rank"?: number | null;
  "Gary Parrish Rank"?: number | null;
  [key: string]: number | null | undefined; // For dynamic access
}

export interface Measurement {
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
  agility?: number | null;
  sprint?: number | null;
  shuttleLeft?: number | null;
  shuttleRight?: number | null;
  shuttleBest?: number | null;
}

export interface GameLog {
  playerId: number;
  gameId: number;
  season: number;
  league: string;
  date: string;
  team: string;
  teamId: number;
  opponentId: number;
  isHome: number | null;
  opponent: string;
  homeTeamPts?: number | null;
  visitorTeamPts?: number | null;
  gp: number;
  gs?: number | null;
  timePlayed?: string | null;
  fgm?: number | null;
  fga?: number | null;
  "fg%"?: number | null;
  tpm?: number | null;
  tpa?: number | null;
  "tp%"?: number | null;
  ftm?: number | null;
  fta?: number | null;
  "ft%"?: number | null;
  oreb?: number | null;
  dreb?: number | null;
  reb?: number | null;
  ast?: number | null;
  stl?: number | null;
  blk?: number | null;
  tov?: number | null;
  pf?: number | null;
  pts?: number | null;
  plusMinus?: number | null;
  rn?: number | null;
}

export interface SeasonLog {
  playerId: number;
  age?: string | number | null; // This was 'Eric Dixon' in your data, so might need specific handling or be player name
  Season: number;
  League: string;
  Team: string;
  w?: number | null;
  l?: number | null;
  GP: number;
  GS?: number | null;
  MP?: number | null;
  FGM?: number | null;
  FGA?: number | null;
  "FG%"?: number | null;
  FG2M?: number | null;
  FG2A?: number | null;
  "FG2%"?: number | null;
  "eFG%"?: number | null;
  "3PM"?: number | null;
  "3PA"?: number | null;
  "3P%"?: number | null;
  FT?: number | null; // Used for Season Total FTM in your data
  FTM?: number | null; // This was missing, but used in PlayerProfile.tsx; FT above might be total
  FTA?: number | null;
  FTP?: number | null; // Or "FT%"
  ORB?: number | null;
  DRB?: number | null;
  TRB?: number | null;
  AST?: number | null;
  STL?: number | null;
  BLK?: number | null;
  TOV?: number | null;
  PF?: number | null;
  PTS?: number | null;
}

export interface ScoutingReport {
  reportId: string;
  scout: string;
  report: string;
  playerId: number;
  date?: string;
}

export interface DraftData {
  bio: PlayerBio[];
  scoutRankings: ScoutRanking[];
  measurements: Measurement[];
  game_logs: GameLog[];
  seasonLogs: SeasonLog[];
  scoutingReports: ScoutingReport[];
}

export interface CombinedPlayerData extends PlayerBio {
  scoutRankings?: ScoutRanking;
  avgRank?: number | null;
  mavsRank?: number | null; // Assuming one of the ranks is the "Mavericks" scout
}