import { Router } from 'express';
import * as memoController from '../controllers/memoController';

const router = Router();

router.get('/', memoController.getAllMemos);
router.post('/', memoController.createMemo);
router.put('/:id', memoController.updateMemo); // ついでに更新用のルートも定義
router.delete('/:id', memoController.deleteMemo);

export default router;