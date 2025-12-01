import prisma from "../utils/prismaClient";

// userId を引数に追加し、検索条件 (where) に加える

export const getMemos = async (userId: string) => {
  return await prisma.memo.findMany({
    where: { userId }, // 自分のIDと一致するものだけ取得
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
      userId, // 作成者のIDを記録
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
      userId, // IDだけでなく、持ち主も一致するか確認（他人のメモ書き換え防止）
    },
    data: { title, content },
  });
};

export const deleteMemo = async (userId: string, id: number) => {
  return await prisma.memo.delete({
    where: {
      id,
      userId, // 他人のメモを消せないようにする
    },
  });
};
