import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_gd_buddy";

const args = process.argv.slice(2);
const email = args[0] || process.env.ADMIN_EMAIL;
const password = args[1] || process.env.ADMIN_PASSWORD;
const fullName = args[2] || process.env.ADMIN_NAME || "Administrator";

if (!email || !password) {
  console.log("❌ Error: Missing credentials.");
  console.log("Usage: node scripts/create-admin.mjs <email> <password> [fullName]");
  console.log("Example: node scripts/create-admin.mjs vatsal@example.com StrongPass123! \"Vatsal Awasthi\"");
  process.exit(1);
}

async function run() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "ai_gd_buddy" });

    const UserSchema = new mongoose.Schema({
      fullName: String,
      email: { type: String, unique: true },
      passwordHash: String,
      role: { type: String, default: "student" },
      onboardingCompleted: { type: Boolean, default: true },
      college: String,
      graduationYear: Number,
      educationLevel: String,
      careerGoal: String,
      confidenceLevel: String,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    if (user) {
      user.role = "admin";
      user.passwordHash = hash;
      user.fullName = fullName;
      await user.save();
      console.log(`✅ Updated existing user "${normalizedEmail}" to role: "admin". Password updated.`);
    } else {
      user = await User.create({
        fullName,
        email: normalizedEmail,
        passwordHash: hash,
        role: "admin",
        onboardingCompleted: true,
      });
      console.log(`🎉 Admin user created successfully: ${normalizedEmail}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
    process.exit(1);
  }
}

run();
