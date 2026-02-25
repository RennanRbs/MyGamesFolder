import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  GameCard,
  RawgGame,
  PERSONAL_COLUMNS,
  ALL_GAMES_COLUMN_ID,
  rawgGameToGameCard
} from '../models/game.model';
import { BoardStorageService } from './board-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly storage = new BoardStorageService();

  allGames$ = new BehaviorSubject<RawgGame[]>([]);
  personalColumns$ = new BehaviorSubject<Record<string, GameCard[]>>(this.getEmptyColumns());

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    const state = this.storage.loadBoard();
    const columns: Record<string, GameCard[]> = {};
    const cache = state.gamesCache as Record<number | string, GameCard>;
    for (const col of PERSONAL_COLUMNS) {
      const ids = state.columns[col.id] ?? [];
      columns[col.id] = ids
        .map(id => cache[id] ?? cache[String(id)])
        .filter((g): g is GameCard => g != null);
    }
    this.personalColumns$.next(columns);
  }

  setAllGames(games: RawgGame[]): void {
    this.allGames$.next(games);
  }

  getPersonalColumnIds(): string[] {
    return PERSONAL_COLUMNS.map(c => c.id);
  }

  getColumnIdListForDrop(): string[] {
    return [ALL_GAMES_COLUMN_ID, ...this.getPersonalColumnIds()];
  }

  addGameToPersonalColumn(columnId: string, game: RawgGame | GameCard): void {
    const card = 'background_image' in game && game.genres ? rawgGameToGameCard(game as RawgGame) : (game as GameCard);
    const current = this.personalColumns$.value;
    const columnGames = [...(current[columnId] ?? [])];
    if (columnGames.some(g => g.id === card.id)) return;
    columnGames.push(card);
    const next = { ...current, [columnId]: columnGames };
    this.personalColumns$.next(next);
    this.persistColumn(columnId, columnGames);
    this.storage.saveGameToCache(card);
  }

  setPersonalColumn(columnId: string, games: GameCard[]): void {
    const current = this.personalColumns$.value;
    const next = { ...current, [columnId]: games };
    this.personalColumns$.next(next);
    this.persistColumn(columnId, games);
  }

  removeGameFromPersonalColumn(columnId: string, gameId: number): void {
    const current = this.personalColumns$.value;
    const columnGames = (current[columnId] ?? []).filter(g => g.id !== gameId);
    const next = { ...current, [columnId]: columnGames };
    this.personalColumns$.next(next);
    this.persistColumn(columnId, columnGames);
    this.pruneCacheIfNeeded(next);
  }

  moveGameBetweenPersonalColumns(fromColumnId: string, toColumnId: string, gameId: number): void {
    const current = this.personalColumns$.value;
    const fromCol = current[fromColumnId] ?? [];
    const game = fromCol.find(g => g.id === gameId);
    if (!game) return;
    const newFrom = fromCol.filter(g => g.id !== gameId);
    const toCol = [...(current[toColumnId] ?? []), game];
    const next = {
      ...current,
      [fromColumnId]: newFrom,
      [toColumnId]: toCol
    };
    this.personalColumns$.next(next);
    this.persistColumn(fromColumnId, newFrom);
    this.persistColumn(toColumnId, toCol);
  }

  persistAllPersonalColumns(): void {
    const current = this.personalColumns$.value;
    for (const col of PERSONAL_COLUMNS) {
      this.persistColumn(col.id, current[col.id] ?? []);
    }
  }

  removeFromPersonalColumnToAll(columnId: string, gameId: number): void {
    this.removeGameFromPersonalColumn(columnId, gameId);
  }

  private persistColumn(columnId: string, games: GameCard[]): void {
    this.storage.saveColumn(columnId, games.map(g => g.id));
  }

  private pruneCacheIfNeeded(columns: Record<string, GameCard[]>): void {
    const allIds = new Set<number>();
    for (const col of PERSONAL_COLUMNS) {
      (columns[col.id] ?? []).forEach(g => allIds.add(g.id));
    }
    const state = this.storage.loadBoard();
    const newCache: Record<number, GameCard> = {};
    for (const id of allIds) {
      if (state.gamesCache[id]) newCache[id] = state.gamesCache[id];
    }
    state.gamesCache = newCache;
    this.storage.saveBoard(state);
  }

  private getEmptyColumns(): Record<string, GameCard[]> {
    const r: Record<string, GameCard[]> = {};
    for (const col of PERSONAL_COLUMNS) r[col.id] = [];
    return r;
  }
}
