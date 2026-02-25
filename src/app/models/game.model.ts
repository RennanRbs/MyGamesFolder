export interface RawgGenre {
  id: number;
  name: string;
}

export interface RawgGame {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  genres: RawgGenre[];
  short_screenshots?: { id: number; image: string }[];
}

export interface GameCard {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  genres: RawgGenre[];
}

export interface RawgGamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

export interface RawgGenreResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGenre[];
}

export interface RawgTag {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface RawgTagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgTag[];
}

export interface PersonalColumn {
  id: string;
  label: string;
}

export const PERSONAL_COLUMNS: PersonalColumn[] = [
  { id: 'preciso_jogar_urgente', label: 'Preciso jogar urgente' },
  { id: 'vale_a_pena_nao_hoje', label: 'Vale a pena jogar mas não hoje' },
  { id: 'jogar_algum_dia', label: 'Jogar algum dia' },
  { id: 'ja_joguei', label: 'Já joguei' }
];

export const ALL_GAMES_COLUMN_ID = 'all';

export function rawgGameToGameCard(game: RawgGame): GameCard {
  return {
    id: game.id,
    name: game.name,
    released: game.released ?? null,
    background_image: game.background_image ?? null,
    genres: game.genres ?? []
  };
}
