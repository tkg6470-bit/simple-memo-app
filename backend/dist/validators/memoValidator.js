"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemoSchema = exports.createMemoSchema = void 0;
const zod_1 = require("zod");
exports.createMemoSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "タイトルは必須です")
        .max(100, "タイトルは100文字以内で入力してください"),
    content: zod_1.z.string().min(1, "内容は必須です"),
});
exports.updateMemoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    content: zod_1.z.string().min(1).optional(),
});
