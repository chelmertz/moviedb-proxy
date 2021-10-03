import axios, {AxiosResponse} from 'axios';
import {TmdbApiClient, TmdbMovie, TmdbResponse} from './moviedb-service';

export class TmdbApiClientAxios implements TmdbApiClient {

  constructor(private readonly apiKey: string, private readonly timeoutMs: number) {
  }

  /**
   * The API has a fixed page size of 20.
   */
  private apiPageSize = 20;

  private static basicValidationOfResponse(response: AxiosResponse<TmdbResponse>) {
    if (response.status !== 200) {
      throw new Error(`Got bad response from ${response.config.url}: [${response.status}]: ${response.data}`);
    }

    // just a quick sanity check
    if (typeof response.data.results !== 'object'
        || (response.data.results.length > 0 && typeof response.data.results[0].id === undefined)
    ) {
      throw new Error(`Got bad response from ${response.config.url}: [${response.status}]: ${response.data}`);
    }
  }

  async search({term, limit}: {term: string; limit: number}): Promise<TmdbMovie[]> {
    const maxPage = Math.ceil(limit / this.apiPageSize);

    let result: TmdbMovie[] = [];
    for (let page = 1; page <= maxPage; page++) {
      const response: AxiosResponse<TmdbResponse> = await axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(term)}`
        + `&api_key=${encodeURIComponent(this.apiKey)}&page=${page}`,
        {timeout: this.timeoutMs}
      );

      TmdbApiClientAxios.basicValidationOfResponse(response);

      result = result.concat(response.data.results);
    }

    // Yes, we're throwing away fetched data, but that's the best we can do with tmdb not having
    // a way to configure page size.
    return result.slice(0, limit);
  }

  async popular(): Promise<TmdbMovie[]> {
    const response: AxiosResponse<TmdbResponse> = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${encodeURIComponent(this.apiKey)}`
      + `&include_adult=false&page=1`,
      {timeout: this.timeoutMs}
    );

    TmdbApiClientAxios.basicValidationOfResponse(response);

    return response.data.results;
  }

  async topRated(): Promise<TmdbMovie[]> {
    const response: AxiosResponse<TmdbResponse> = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${encodeURIComponent(this.apiKey)}`
      + `&include_adult=false&page=1`,
      {timeout: this.timeoutMs}
    );

    TmdbApiClientAxios.basicValidationOfResponse(response);

    return response.data.results;
  }

}
