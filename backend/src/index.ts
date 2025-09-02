import express, { Request, Response } from 'express';
import pool from './pool';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  // return SELECT NOW() from PostgreSQL
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error querying database');
    } else {
      res.send(`Database time: ${result.rows[0].now}}`);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
