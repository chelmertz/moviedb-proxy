import * as request from 'supertest';
import {appWithService} from './http-server';
import {TmdbApiClient, TmdbCallback, TmdbMovie, TmdbSearch, TmdbService} from './moviedb-service';

class ApiClientFixture implements TmdbApiClient {
  constructor(
    private readonly searchCallback: TmdbSearch,
    private readonly popularCallback: TmdbCallback,
    private readonly topRatedCallback: TmdbCallback,
  ) {
  }

  async search(args: {term: string; limit: number}): Promise<TmdbMovie[]> {
    return this.searchCallback(args);
  }

  async popular(): Promise<TmdbMovie[]> {
    return this.popularCallback();
  }

  async topRated(): Promise<TmdbMovie[]> {
    return this.topRatedCallback();
  }
}

describe('appWithService', () => {

  describe('returns 502 if the real TMDB fails', () => {
    const mockTmdb = new TmdbService(new ApiClientFixture(
      () => {
        throw new Error('Bad token or such');
      },
      () => {
        throw new Error('Bad token or such');
      },
      // only one of popular/topRated needs to fail for us to fail our side of things
      () => Promise.resolve([])
    ));

    const backend = request(appWithService(mockTmdb));

    it('/search', (done) => {
      backend
        .get('/search/kidman')
        .then((response) => {
          expect(response.statusCode).toBe(502);
          done();
        });
    });

    it('/top', (done) => {
      backend
        .get('/top')
        .then((response) => {
          expect(response.statusCode).toBe(502);
          done();
        });
    });
  });

  describe('/search input is validated', () => {
    const mockTmdb = new TmdbService(new ApiClientFixture(
      () => Promise.resolve([]),
      () => Promise.resolve([]),
      () => Promise.resolve([])
    ));

    const backend = request(appWithService(mockTmdb));

    it('needs a positive limit', (done) => {
      backend
        .get('/search/kidman?limit=-1')
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it(`caps the limit at ${TmdbService.maxSearchResults}`, (done) => {
      backend
        .get(`/search/kidman?limit=${TmdbService.maxSearchResults + 1}`)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });

    it('needs a search term', (done) => {
      backend
        .get('/search')
        .then((response) => {
          expect(response.statusCode).toBe(404);
          done();
        });
    });
  });
})
