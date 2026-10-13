/**
 * Seed Demo Users Script
 * Creates pre-configured accounts for Patient, Doctor, and Admin
 * using the Supabase Admin Service-Role key.
 *
 * Run with: npx tsx scripts/seed-demo-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...values] = trimmed.split("=");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = values.join("=").trim();
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const DEMO_ACCOUNTS = [
  {
    role: "patient" as const,
    email: "demo.patient@industramedicose.in",
    password: "DemoPatient2026!",
    fullName: "Vikramaditya Rathore",
    phone: "+91-94140-52101",
    language: "hi" as const,
  },
  {
    role: "doctor" as const,
    email: "demo.doctor@industramedicose.in",
    password: "DemoDoctor2026!",
    fullName: "Dr. Meera Rathore",
    phone: "+91-98290-11101",
    language: "en" as const,
    specialization: "General Medicine & Diabetology",
    hospital: "AIIMS Jodhpur Demo Hospital",
    registrationNo: "RJ-MED-2016-8921",
  },
  {
    role: "admin" as const,
    email: "demo.admin@industramedicose.in",
    password: "DemoAdmin2026!",
    fullName: "Chief Clinical Administrator",
    phone: "+91-98290-99999",
    language: "en" as const,
  },
];

async function seedDemoUsers() {
  console.log("===============================================================");
  console.log("🚀 SEEDING DEMO ACCOUNTS VIA SUPABASE ADMIN API");
  console.log("===============================================================\n");

  for (const account of DEMO_ACCOUNTS) {
    console.log(`Checking account: ${account.email} (${account.role})...`);

    // 1. Check if user already exists
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error(`❌ Error listing users:`, listError.message);
      continue;
    }

    const existingUser = userList.users.find((u) => u.email === account.email);
    let userId: string;

    if (existingUser) {
      console.log(`ℹ️ User already exists with ID: ${existingUser.id}. Updating password & metadata...`);
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
          role: account.role,
          preferred_language: account.language,
        },
      });
      if (updateError) {
        console.warn(`⚠️ Warning updating user:`, updateError.message);
      }
    } else {
      console.log(`Creating new user for ${account.email}...`);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
          role: account.role,
          preferred_language: account.language,
        },
      });

      if (createError || !newUser.user) {
        console.error(`❌ Error creating user ${account.email}:`, createError?.message);
        continue;
      }
      userId = newUser.user.id;
      console.log(`✅ User created with ID: ${userId}`);
    }

    // 2. Ensure profile exists in public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: account.fullName,
          role: account.role,
          preferred_language: account.language,
          phone: account.phone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.warn(`⚠️ Profile upsert warning (may need migration first):`, profileError.message);
    } else {
      console.log(`✅ Profile upserted for ${account.fullName}`);
    }

    // 3. Role specific table setup
    if (account.role === "patient") {
      const { error: patError } = await supabaseAdmin
        .from("patients")
        .upsert(
          {
            profile_id: userId,
            age: 54,
            sex: "male",
            blood_group: "B+",
            known_allergies: ["Penicillin"],
            chronic_conditions: ["Hypertension"],
            consent_given: true,
            consent_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );
      if (patError) console.warn("⚠️ Patient row warning:", patError.message);
      else console.log(`✅ Patient record synchronized.`);
    } else if (account.role === "doctor") {
      const { error: docError } = await supabaseAdmin
        .from("doctors")
        .upsert(
          {
            profile_id: userId,
            specialization: account.specialization,
            hospital: account.hospital,
            registration_no_demo: account.registrationNo,
          },
          { onConflict: "profile_id" }
        );
      if (docError) console.warn("⚠️ Doctor row warning:", docError.message);
      else console.log(`✅ Doctor record synchronized.`);
    }

    console.log(`---------------------------------------------------------------`);
  }

  console.log("\n🎉 ALL DEMO ACCOUNTS SEEDED SUCCESSFULLY!");
  console.log("Credentials:");
  DEMO_ACCOUNTS.forEach((a) => {
    console.log(`- [${a.role.toUpperCase()}] ${a.email} / Password: ${a.password}`);
  });
  console.log("===============================================================\n");
}

seedDemoUsers().catch(console.error);
