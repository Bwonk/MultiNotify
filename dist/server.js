import "./config/env.js";
import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/db.js";
async function main() {
    await prisma.$connect();
    console.log("✅ Veritabanı bağlantısı kuruldu");
    app.listen(env.PORT, () => {
        console.log(`🚀 MultiNotify → http://localhost:${env.PORT}`);
        console.log(`📋 Health     → http://localhost:${env.PORT}/health`);
    });
}
main().catch((err) => {
    console.error("❌ Başlatılamadı:", err);
    process.exit(1);
});
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log("\n👋 Kapatıldı");
    process.exit(0);
});
