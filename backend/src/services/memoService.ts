import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// メモ一覧取得
export const getMemos = async (userId: string) => {
  return await prisma.memo.findMany({
    where: { userId },
    // 修正: created_at ではなく createdAt を使用します
    orderBy: { createdAt: "desc" },
  });
};

// メモ作成
export const createMemo = async (
  userId: string,
  title: string,
  content: string,
  imageUrl?: string
) => {
  return await prisma.memo.create({
    data: {
      userId,
      title,
      content,
      imageUrl,
    },
  });
};

// メモ更新
export const updateMemo = async (
  userId: string,
  id: number,
  title?: string,
  content?: string,
  imageUrl?: string
) => {
  return await prisma.memo.update({
    where: { id, userId },
    data: {
      title,
      content,
      imageUrl,
    },
  });
};

// メモ削除
export const deleteMemo = async (userId: string, id: number) => {
  return await prisma.memo.delete({
    where: { id, userId },
  });
};
