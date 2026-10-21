import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "users_data.py");

// Helper to read users from users_data.py
function readUsersFromPythonDb(): Record<string, any> {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return {};
    }
    const content = fs.readFileSync(DB_PATH, "utf8");
    const startIndex = content.indexOf("USERS = ");
    if (startIndex === -1) return {};

    const rawPython = content.substring(startIndex + 8).trim();
    // Convert Python literals to JSON
    const jsonStr = rawPython
      .replace(/:\s*True/g, ": true")
      .replace(/:\s*False/g, ": false")
      .replace(/:\s*None/g, ": null");

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Error reading users_data.py:", err);
    return {};
  }
}

// Helper to write users into users_data.py
function writeUsersToPythonDb(users: Record<string, any>): boolean {
  try {
    const jsonStr = JSON.stringify(users, null, 4);
    const pythonContent = jsonStr
      .replace(/:\s*true/g, ": True")
      .replace(/:\s*false/g, ": False")
      .replace(/:\s*null/g, ": None");

    const fileContent = `# HealthThread Unified User Database\n# Automatically updated when users sign up, log in, or update clinical records\n\nUSERS = ${pythonContent}\n`;
    fs.writeFileSync(DB_PATH, fileContent, "utf8");
    return true;
  } catch (err) {
    console.error("Error writing to users_data.py:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, fullName, displayName, updates } = body;
    const resolvedName = fullName || displayName;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const users = readUsersFromPythonDb();

    // 1. SIGN UP ACTION
    if (action === "signup") {
      if (!normalizedEmail || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      if (users[normalizedEmail]) {
        return NextResponse.json({ 
          error: "An account with this email already exists. Please sign in instead." 
        }, { status: 409 });
      }

      const cleanName = (resolvedName || "").trim() || "Health Member";
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const userId = "usr_" + cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 16) + "_" + randomSuffix;

      const newUser = {
        id: userId,
        displayName: cleanName,
        email: normalizedEmail,
        password: password, // Simple custom authentication
        healthId: `HT-GLOBAL-${randomSuffix}`,
        bloodGroup: "Not specified",
        role: "patient",
        isVerified: true,
        createdAt: new Date().toISOString(),
        emergencyProfile: {
          bloodGroup: "Not specified",
          knownAllergies: "None reported",
          currentMedications: "None",
          chronicConditions: "None",
          previousSurgeries: "None",
          emergencyContact: "Primary ICE Contact",
          emergencyPhone: "+1 (555) 019-2831",
          organDonor: "Yes"
        },
        timeline: [
          {
            id: `tl-welcome-${Date.now()}`,
            year: new Date().getFullYear().toString(),
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            category: "Prescriptions",
            title: "HealthThread Vault Activated",
            provider: "System Initializer",
            status: "Verified",
            iconType: "pill",
            clinicalSummary: `Universal personal vault initialized for ${cleanName}. Records and timeline synced.`
          }
        ],
        diagnoses: []
      };

      users[normalizedEmail] = newUser;
      writeUsersToPythonDb(users);

      // Return user without password
      const { password: _, ...safeUser } = newUser;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // 2. SIGN IN / LOGIN ACTION
    if (action === "login") {
      if (!normalizedEmail || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const user = users[normalizedEmail];
      if (!user) {
        return NextResponse.json({ 
          error: "No account found with this email. Please click 'Create Account' to sign up." 
        }, { status: 404 });
      }

      if (user.password !== password) {
        return NextResponse.json({ 
          error: "Incorrect password. Please verify and try again." 
        }, { status: 401 });
      }

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // 3. SYNC DATA (Timeline, Diagnoses, Profile)
    if (action === "sync") {
      if (!normalizedEmail) {
        return NextResponse.json({ error: "Email is required to sync data" }, { status: 400 });
      }

      const user = users[normalizedEmail];
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (updates) {
        if (updates.timeline) user.timeline = updates.timeline;
        if (updates.diagnoses) user.diagnoses = updates.diagnoses;
        if (updates.emergencyProfile) user.emergencyProfile = updates.emergencyProfile;
        if (updates.displayName) user.displayName = updates.displayName;
        if (updates.bloodGroup) user.bloodGroup = updates.bloodGroup;
        user.lastSyncedAt = new Date().toISOString();
        writeUsersToPythonDb(users);
      }

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // 4. GET USER
    if (action === "get") {
      if (!normalizedEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
      const user = users[normalizedEmail];
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 });
  }
}
