import { Hono } from 'hono';
import * as memoController from '../controllers/memoController';

const app = new Hono();

app.get('/', memoController.getAllMemos);
app.post('/', memoController.createMemo);
app.put('/:id', memoController.updateMemo);
app.delete('/:id', memoController.deleteMemo);

export default app;