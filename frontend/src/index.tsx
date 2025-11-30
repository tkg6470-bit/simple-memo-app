import express from 'express';
import cors from 'cors';
import memoRoutes from './src/routes/memoRoutes';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ルーティングの設定
// "/memos" で始まるURLへのアクセスは、すべて memoRoutes に任せる
app.use('/memos', memoRoutes);

// 動作確認用ルート
app.get('/', (req, res) => {
  res.send('Memo App Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});