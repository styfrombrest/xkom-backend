import express, {Request, Response} from "express";
import validator from 'validator';
import xss from "xss";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

interface IRequest {
  page?: string;
  pageSize?: string;
  search?: string;
}

const router = express.Router();

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 10;
const MAX_SEARCH_LINE = 63;

const COLLECTION = 'xkom-items';

const url = process.env.MONGO_URL || '';

router.get('/', async (req: Request<{}, {}, {}, IRequest>, res: Response) => {
  const {page: pageRaw = '', pageSize: pageSizeRaw = '', search: searchRaw = ''} = req.query;
  const page = parseInt(pageRaw, 10) || DEFAULT_PAGE;
  const pageSize = parseInt(pageSizeRaw, 10) || DEFAULT_PAGE_SIZE;
  const search = validator.escape(xss(searchRaw)).slice(0, MAX_SEARCH_LINE);

  res.setHeader('Content-Type', 'application/json');

  try {
    const client = new MongoClient(url);

    await client.connect();
    const collection = client.db().collection(COLLECTION);

    const pipeline = [
      { $sort: { _id: -1 } },
      {
        $facet: {
          metadata: [{ $group: { _id: null, count: { $sum: 1 } } }],
          data: [{ $skip: page * pageSize }, { $limit: pageSize }],
        },
      },
      { $unwind: '$metadata' },
      {
        $project: {
          count: '$metadata.count',
          data: '$data',
        },
      },
    ];

    if (search) {
      // @ts-ignore
      pipeline.unshift({ $match: { $text: { $search: search } } });
    }

    const result = await collection.aggregate(pipeline).toArray();
    return res.status(200).send(result);
  } catch(err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
});

export default router;
