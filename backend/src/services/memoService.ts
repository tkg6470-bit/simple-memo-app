import prisma from "../utils/prismaClient";

export const getMemos = async (userId: string) => {
  return await prisma.memo.findMany({
    where: { userId },
    orderBy: { created_at: "desc" },
  });
};

// imageUrl (オプショナル) を追加
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
      imageUrl, // DBに保存 (undefinedならnull扱いになる)
    },
  });
};

// imageUrl (オプショナル) を追加
export const updateMemo = async (
  userId: string,
  id: number,
  title: string,
  content: string,
  imageUrl?: string
) => {
  return await prisma.memo.update({
    where: {
      id,
      userId,
    },
    data: {
      title,
      content,
      // 画像URLがある場合のみ更新する（undefinedなら更新しない）
      ...(imageUrl && { imageUrl }),
    },
  });
};

export const deleteMemo = async (userId: string, id: number) => {
  return await prisma.memo.delete({
    where: {
      id,
      userId,
    },
  });
};
