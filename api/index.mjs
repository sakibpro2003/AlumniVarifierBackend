import serverless from "serverless-http";
import { createApp, connectToDatabase } from "../app.mjs";

await connectToDatabase();

const app = createApp();

const handler = serverless(app);

export default handler;
