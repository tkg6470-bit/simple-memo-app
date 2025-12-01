import prisma from "../utils/prismaClient";

export const getMemos = async (userId: string) => {
  return await prisma.memo.findMany({
    where: { userId },
    orderBy: { created_at: "desc" },
  });
};

export const createMemo = async (
  userId: string,
  title: string,
  content: string
) => {
  return await prisma.memo.create({
    data: {
      userId,
      title,
      content,
    },
  });
};

export const updateMemo = async (
  userId: string,
  id: number,
  title: string,
  content: string
) => {
  return await prisma.memo.update({
    where: {
      id,
      userId, // 他人のメモを更新できないようにする
    },
    data: { title, content },
  });
};

export const deleteMemo = async (userId: string, id: number) => {
  return await prisma.memo.delete({
    where: {
      id,
      userId, // 他人のメモを削除できないようにする
    },
  });
};
