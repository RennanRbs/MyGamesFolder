import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RawgGamesResponse,
  RawgGenreResponse,
  RawgTagsResponse
} from '../models/game.model';

export interface GamesFilterParams {
  page?: number;
  page_size?: number;
  genres?: number;
  tags?: number;
  dates?: string; // YYYY-MM-DD,YYYY-MM-DD
  ordering?: string;
}

const BASE_URL = 'https://api.rawg.io/api';

@Injectable({
  providedIn: 'root'
})
export class RawgService {
  private readonly apiKey = environment.rawgApiKey;

  constructor(private http: HttpClient) {}

  getGames(params: GamesFilterParams = {}): Observable<RawgGamesResponse> {
    let httpParams = new HttpParams().set('key', this.apiKey);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size != null) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.genres != null) httpParams = httpParams.set('genres', params.genres.toString());
    if (params.tags != null) httpParams = httpParams.set('tags', params.tags.toString());
    if (params.dates != null) httpParams = httpParams.set('dates', params.dates);
    if (params.ordering != null) httpParams = httpParams.set('ordering', params.ordering);
    return this.http.get<RawgGamesResponse>(`${BASE_URL}/games`, { params: httpParams });
  }

  getGenres(): Observable<RawgGenreResponse> {
    const params = new HttpParams().set('key', this.apiKey);
    return this.http.get<RawgGenreResponse>(`${BASE_URL}/genres`, { params });
  }

  getTags(): Observable<RawgTagsResponse> {
    const params = new HttpParams().set('key', this.apiKey).set('page_size', '50');
    return this.http.get<RawgTagsResponse>(`${BASE_URL}/tags`, { params });
  }
}
