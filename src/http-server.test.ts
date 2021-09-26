import * as request from 'supertest';
import {appWithService} from './http-server';
import {TmdbApiClient, TmdbMovie, TmdbService} from './moviedb-service';

class FailingApiClient implements TmdbApiClient {
  async search({term, limit}: {term: string; limit: number}): Promise<TmdbMovie[]> {
    throw new Error('Bad token, or such');
  }

  async popular(): Promise<TmdbMovie[]> {
    throw new Error('Bad token, or such');
  }

  async topRated(): Promise<TmdbMovie[]> {
    // only one of popular/topRated needs to fail for us to fail our side of things
    return Promise.resolve([]);
  }
}

describe('appWithService', () => {

  it('returns 502 if the real TMDB fails', () => {
    const mockTmdb = new TmdbService(new FailingApiClient());

    const backend = request(appWithService(mockTmdb));

    backend
      .get('/search/kidman')
      .expect(502);

    backend
      .get('/top')
      .expect(502);
  });

})
