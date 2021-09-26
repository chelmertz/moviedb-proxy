import * as express from 'express';
import {TmdbService} from './moviedb-service';

export const appWithService = (tmdbService: TmdbService) =>
  express()
    .get('/', (req, res) => {
      res.send('Try <a href="/search/dune?limit=4">/search/dune?limit=4</a> or <a href="/top">/top</a>')
    })
    .get('/search/:term', async (req, res) => {
      if (typeof req.params['term'] !== 'string' || req.params['term'].length < 1 || req.params['term'].length > 100) {
        res.status(400).send({error: 'Missing or invalid search term. Try /search/dune'});
        return;
      }
      const term: string = req.params['term'];

      let limit: number | undefined;
      if (typeof req.query.limit === 'string') {
        limit = parseInt(req.query.limit);
        if (isNaN(limit)) {
          res.status(400).send({error: 'Bad format of the limit query parameter'});
          return;
        }
      }

      try {
        const result = await tmdbService.search({term, limit});
        res.send(result);
      } catch (e) {
        console.error(`search: Error searching for '${term}'`, e);
        res.status(502).send('Bad Gateway');
      }
    })
    .get('/top', async (req, res) => {
      try {
        const result = await tmdbService.topRatedPopular();
        res.send(result);
      } catch (e) {
        console.error('top-rated: Error', e);
        res.status(502).send('Bad Gateway');
      }
    });
