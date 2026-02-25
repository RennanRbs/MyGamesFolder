import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { RawgService } from './services/rawg.service';
import { BoardService } from './services/board.service';
import {
  RawgGame,
  GameCard,
  RawgGenre,
  RawgTag,
  PERSONAL_COLUMNS,
  ALL_GAMES_COLUMN_ID,
  rawgGameToGameCard
} from './models/game.model';
import { BoardStorageService } from './services/board-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MyGamesFolder';

  selectedGenreId: number | '' = '';
  selectedYear: number | '' = '';
  selectedTagId: number | '' = '';

  genres: RawgGenre[] = [];
  tags: RawgTag[] = [];
  years: number[] = [];

  allGamesList: RawgGame[] = [];
  personalColumns = PERSONAL_COLUMNS;
  columnIds: string[] = [ALL_GAMES_COLUMN_ID, ...PERSONAL_COLUMNS.map(c => c.id)];

  personalColumnsData: Record<string, GameCard[]> = {};
  loading = false;
  loadingFilters = false;
  loadingMore = false;
  currentPage = 1;
  hasMoreGames = false;
  private lastSearchParams: Record<string, number | string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private rawg: RawgService,
    public boardService: BoardService,
    private boardStorage: BoardStorageService
  ) {}

  ngOnInit(): void {
    this.buildYears();
    this.loadFilters();
    this.boardService.personalColumns$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cols => (this.personalColumnsData = cols));
    this.search();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let y = currentYear; y >= 1980; y--) this.years.push(y);
  }

  loadFilters(): void {
    this.loadingFilters = true;
    this.rawg.getGenres().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.genres = res.results ?? [];
        this.loadingFilters = false;
      },
      error: () => (this.loadingFilters = false)
    });
    this.rawg.getTags().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.tags = res.results ?? [];
      }
    });
  }

  search(): void {
    this.loading = true;
    this.currentPage = 1;
    const params: Record<string, number | string> = {
      page: 1,
      page_size: 10
    };
    if (this.selectedGenreId !== '') params['genres'] = this.selectedGenreId as number;
    if (this.selectedTagId !== '') params['tags'] = this.selectedTagId as number;
    if (this.selectedYear !== '') {
      const y = this.selectedYear as number;
      params['dates'] = `${y}-01-01,${y}-12-31`;
    }
    this.lastSearchParams = { ...params };
    this.rawg.getGames(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        const games = res.results ?? [];
        this.hasMoreGames = !!res.next;
        this.boardService.setAllGames(games);
        this.allGamesList = [...games];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMoreGames) return;
    this.loadingMore = true;
    const params = { ...this.lastSearchParams, page: this.currentPage + 1, page_size: 10 };
    this.rawg.getGames(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        const games = res.results ?? [];
        this.hasMoreGames = !!res.next;
        this.currentPage = params.page as number;
        this.allGamesList = [...this.allGamesList, ...games];
        this.boardService.setAllGames(this.allGamesList);
        this.loadingMore = false;
      },
      error: () => (this.loadingMore = false)
    });
  }

  drop(event: CdkDragDrop<RawgGame[] | GameCard[], RawgGame[] | GameCard[]>): void {
    const prevId = event.previousContainer.id;
    const currId = event.container.id;
    const game = event.item.data as RawgGame | GameCard;
    const gameId = game.id;

    if (prevId === currId) return;

    if (prevId === ALL_GAMES_COLUMN_ID && currId !== ALL_GAMES_COLUMN_ID) {
      const card = rawgGameToGameCard(game as RawgGame);
      this.boardStorage.saveGameToCache(card);
      const cur = this.boardService.personalColumns$.value;
      const existing = cur[currId] ?? [];
      const without = existing.filter(g => g.id !== card.id);
      this.boardService.setPersonalColumn(currId, [...without, card]);
      this.allGamesList = [...this.boardService.allGames$.value];
      return;
    }

    if (prevId !== ALL_GAMES_COLUMN_ID && currId === ALL_GAMES_COLUMN_ID) {
      this.boardService.removeFromPersonalColumnToAll(prevId, gameId);
      this.allGamesList = [...this.boardService.allGames$.value];
      return;
    }

    if (prevId !== ALL_GAMES_COLUMN_ID && currId !== ALL_GAMES_COLUMN_ID) {
      this.boardService.moveGameBetweenPersonalColumns(prevId, currId, gameId);
    }
  }

  getPersonalColumnGames(columnId: string): GameCard[] {
    return this.personalColumnsData[columnId] ?? [];
  }

  gameYear(released: string | null): string {
    if (!released) return '—';
    return released.slice(0, 4);
  }

  gameGenres(game: RawgGame | GameCard, max = 3): string {
    const g = game.genres ?? [];
    return g.slice(0, max).map(x => x.name).join(', ') || '—';
  }
}
