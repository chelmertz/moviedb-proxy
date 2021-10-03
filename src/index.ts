import {appWithService} from './http-server';
import {TmdbService} from './moviedb-service';
import {TmdbApiClientAxios} from './tmdb-api-client-axios';

const port = 8080;

const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  throw new Error('Please provide the environment variable TMDB_API_KEY');
}

const debug = process.env.DEBUG !== '0';

const tmdbService = new TmdbService(new TmdbApiClientAxios(apiKey, 8_000));

appWithService(tmdbService, debug)
  .listen(port, () => {
    console.log(`Started app on http://localhost:${port}`);
  });
