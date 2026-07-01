import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Cart from "./models/Cart.js";
import User from "./models/User.js";
import { seedSampleProducts } from "./utils/seedProducts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sneaker_rabbit";
        await mongoose.connect(mongoUri);

        await Cart.deleteMany();
        await User.deleteMany();

        const result = await seedSampleProducts({ reset: true });
        console.log(`Data seeded successfully. Created ${result.count} products.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();