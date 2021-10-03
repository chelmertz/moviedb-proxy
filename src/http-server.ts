import * as express from 'express';
import {BadInput, TmdbService} from './moviedb-service';

const handleError = (e: Error): [number, string] =>
  e instanceof BadInput
    ? [400, e.message]
    : [502, 'Bad Gateway'];

export const appWithService = (tmdbService: TmdbService) =>
  express()
    .get('/', (req, res) => {
      res.send('Try <a href="/search/dune?limit=4">/search/dune?limit=4</a> or <a href="/top">/top</a>')
    })
    .get('/search/:term', async (req, res) => {
      try {
        const result = await tmdbService.search({
          term: req.params['term'],
          /*
           * Some basic input validation, we want the error handling inside tmdbService, but tmdbService should not
           * know about Express' ReqQuery.
           */
          limit: typeof req.query.limit === 'string' ? req.query.limit : undefined
        });
        res.send(result);
      } catch (e) {
        const [code, message] = handleError(e);
        res.status(code).send(message);
      }
    })
    .get('/top', async (req, res) => {
      try {
        const result = await tmdbService.topRatedPopular();
        res.send(result);
      } catch (e) {
        const [code, message] = handleError(e);
        res.status(code).send(message);
      }
    });
