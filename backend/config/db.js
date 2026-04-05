import mongoose from "mongoose";

const opts = {
  serverSelectionTimeoutMS: 15_000,
  maxPoolSize: 10,
};

function printAtlasHelp(err) {
  const msg = String(err?.message || err);
  console.error("\n--- MongoDB connection failed ---\n");
  if (msg.includes("whitelist") || msg.includes("IP") || err?.name === "MongooseServerSelectionError") {
    console.error("Atlas often blocks connections until your IP is allowed:");
    console.error("  1. Open https://cloud.mongodb.com → your Project → Network Access");
    console.error("  2. Add IP Address → Add Current IP Address (or 0.0.0.0/0 for dev only)");
    console.error("  3. Wait 1–2 minutes, then restart the server.\n");
  }
  console.error("Also check: MONGODB_URI in backend/.env matches Atlas → Connect → Drivers.");
  console.error("Use a database user with read/write on the cluster (Database Access).\n");
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, opts);
    console.log("MongoDB connected");
  } catch (err) {
    printAtlasHelp(err);
    throw err;
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
}
