import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c91a11f5-f9da-4b4d-ac7f-72369d62fa30";
const PUBLIC_SCREENSHOT_DIR = path.join(process.cwd(), "public", "screenshots");

const TARGETS = [
  {
    name: "landing",
    url: "http://localhost:3000/",
    role: null,
  },
  {
    name: "directory",
    url: "http://localhost:3000/directory",
    role: null,
  },
  {
    name: "signup",
    url: "http://localhost:3000/signup",
    role: null,
  },
  {
    name: "patient_dashboard",
    url: "http://localhost:3000/patient",
    role: "patient",
  },
  {
    name: "doctor_portal",
    url: "http://localhost:3000/doctor",
    role: "doctor",
  },
  {
    name: "doctor_consultation",
    url: "http://localhost:3000/doctor/consultation/c-101",
    role: "doctor",
  },
  {
    name: "doctor_profile",
    url: "http://localhost:3000/doctor/profile/doc-meera",
    role: null,
  },
];

async function capture() {
  if (!fs.existsSync(PUBLIC_SCREENSHOT_DIR)) {
    fs.mkdirSync(PUBLIC_SCREENSHOT_DIR, { recursive: true });
  }
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  console.log("=== CAPTURING SCREENSHOTS FOR INDUSTRA MEDICOSE ===");

  for (const target of TARGETS) {
    // 1. Desktop capture
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    if (target.role) {
      await desktopContext.addCookies([
        {
          name: "im_demo_role",
          value: target.role,
          domain: "localhost",
          path: "/",
        },
        {
          name: "im_user_email",
          value: target.role === "doctor" ? "dr.meera@hospital.in" : "vikram@patient.in",
          domain: "localhost",
          path: "/",
        },
        {
          name: "im_user_name",
          value: target.role === "doctor" ? "Dr. Meera Rathore" : "Vikramaditya Rathore",
          domain: "localhost",
          path: "/",
        },
      ]);
    }

    const desktopPage = await desktopContext.newPage();
    try {
      await desktopPage.goto(target.url, { waitUntil: "networkidle", timeout: 20000 });
      await desktopPage.waitForTimeout(1500); // Allow animations & fonts to settle

      const desktopFileName = `desktop_${target.name}.png`;
      const desktopLocalPath = path.join(PUBLIC_SCREENSHOT_DIR, desktopFileName);
      const desktopArtifactPath = path.join(ARTIFACT_DIR, desktopFileName);

      await desktopPage.screenshot({ path: desktopLocalPath, fullPage: false });
      fs.copyFileSync(desktopLocalPath, desktopArtifactPath);
      console.log(`[PASS] Desktop: ${desktopFileName}`);
    } catch (err) {
      console.error(`[FAIL] Desktop ${target.name}:`, err);
    } finally {
      await desktopContext.close();
    }

    // 2. Mobile capture
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });

    if (target.role) {
      await mobileContext.addCookies([
        {
          name: "im_demo_role",
          value: target.role,
          domain: "localhost",
          path: "/",
        },
        {
          name: "im_user_email",
          value: target.role === "doctor" ? "dr.meera@hospital.in" : "vikram@patient.in",
          domain: "localhost",
          path: "/",
        },
        {
          name: "im_user_name",
          value: target.role === "doctor" ? "Dr. Meera Rathore" : "Vikramaditya Rathore",
          domain: "localhost",
          path: "/",
        },
      ]);
    }

    const mobilePage = await mobileContext.newPage();
    try {
      await mobilePage.goto(target.url, { waitUntil: "networkidle", timeout: 20000 });
      await mobilePage.waitForTimeout(1200);

      const mobileFileName = `mobile_${target.name}.png`;
      const mobileLocalPath = path.join(PUBLIC_SCREENSHOT_DIR, mobileFileName);
      const mobileArtifactPath = path.join(ARTIFACT_DIR, mobileFileName);

      await mobilePage.screenshot({ path: mobileLocalPath, fullPage: false });
      fs.copyFileSync(mobileLocalPath, mobileArtifactPath);
      console.log(`[PASS] Mobile: ${mobileFileName}`);
    } catch (err) {
      console.error(`[FAIL] Mobile ${target.name}:`, err);
    } finally {
      await mobileContext.close();
    }
  }

  await browser.close();
  console.log("=== SCREENSHOT CAPTURE COMPLETE ===");
}

capture().catch((err) => {
  console.error("Capture execution error:", err);
  process.exit(1);
});
