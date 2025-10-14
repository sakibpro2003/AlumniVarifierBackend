import { createApp, connectToDatabase } from "./app.mjs";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectToDatabase();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[server] listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("[server] failed to start:", error);
    process.exit(1);
  }
}

bootstrap();
