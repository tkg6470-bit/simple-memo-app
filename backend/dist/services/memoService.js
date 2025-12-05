"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMemo = exports.updateMemo = exports.createMemo = exports.getMemos = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// メモ一覧取得
const getMemos = async (userId) => {
    return await prisma.memo.findMany({
        where: { userId },
        // 修正: created_at ではなく createdAt を使用します
        orderBy: { createdAt: "desc" },
    });
};
exports.getMemos = getMemos;
// メモ作成
const createMemo = async (userId, title, content, imageUrl) => {
    return await prisma.memo.create({
        data: {
            userId,
            title,
            content,
            imageUrl,
        },
    });
};
exports.createMemo = createMemo;
// メモ更新
const updateMemo = async (userId, id, title, content, imageUrl) => {
    return await prisma.memo.update({
        where: { id, userId },
        data: {
            title,
            content,
            imageUrl,
        },
    });
};
exports.updateMemo = updateMemo;
// メモ削除
const deleteMemo = async (userId, id) => {
    return await prisma.memo.delete({
        where: { id, userId },
    });
};
exports.deleteMemo = deleteMemo;
