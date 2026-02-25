import { Injectable } from '@angular/core';
import { GameCard } from '../models/game.model';

const STORAGE_KEY = 'mygamesfolder_board';

export interface BoardState {
  columns: Record<string, number[]>;
  gamesCache: Record<number, GameCard>;
}

@Injectable({
  providedIn: 'root'
})
export class BoardStorageService {
  loadBoard(): BoardState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getEmptyState();
      const parsed = JSON.parse(raw) as BoardState;
      return {
        columns: parsed.columns ?? {},
        gamesCache: parsed.gamesCache ?? {}
      };
    } catch {
      return this.getEmptyState();
    }
  }

  saveBoard(state: BoardState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save board to localStorage', e);
    }
  }

  saveColumn(columnId: string, gameIds: number[]): void {
    const state = this.loadBoard();
    state.columns[columnId] = gameIds;
    this.saveBoard(state);
  }

  saveGameToCache(game: GameCard): void {
    const state = this.loadBoard();
    state.gamesCache[game.id] = game;
    this.saveBoard(state);
  }

  private getEmptyState(): BoardState {
    return { columns: {}, gamesCache: {} };
  }
}
