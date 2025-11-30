import prisma from "../utils/prismaClient";

export const getMemos = async () => {
  return await prisma.memo.findMany({
    orderBy: { created_at: "desc" },
  });
};

export const createMemo = async (title: string, content: string) => {
  return await prisma.memo.create({
    data: { title, content },
  });
};

export const updateMemo = async (
  id: number,
  title: string,
  content: string
) => {
  return await prisma.memo.update({
    where: { id },
    data: { title, content },
  });
};

export const deleteMemo = async (id: number) => {
  return await prisma.memo.delete({
    where: { id },
  });
};
