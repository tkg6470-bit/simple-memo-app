import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import memoRoutes from "./src/routes/memoRoutes";

const app = new Hono();
const PORT = Number(process.env.PORT) || 8080;

app.use("/*", cors());
app.route("/memos", memoRoutes);

app.get("/", (c) => c.text("Memo App Backend with Hono is running!"));

console.log(`Server is running on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
