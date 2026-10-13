import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\b3e3fe0a-44cf-4616-8b9d-6dddadc1175b";
const PUBLIC_SCREENSHOT_DIR = path.join(process.cwd(), "public", "screenshots");

const TARGETS = [
  {
    name: "landing",
    url: "http://localhost:3000/",
    role: null,
  },
  {
    name: "login",
    url: "http://localhost:3000/login",
    role: null,
  },
  {
    name: "doctor_queue",
    url: "http://localhost:3000/doctor",
    role: "doctor",
  },
  {
    name: "doctor_consultation",
    url: "http://localhost:3000/doctor/consultation/c-101",
    role: "doctor",
  },
  {
    name: "doctor_guide",
    url: "http://localhost:3000/doctor/guide",
    role: "doctor",
  },
  {
    name: "patient_intake",
    url: "http://localhost:3000/patient/intake",
    role: "patient",
  },
  {
    name: "patient_dashboard",
    url: "http://localhost:3000/patient",
    role: "patient",
  },
  {
    name: "admin_console",
    url: "http://localhost:3000/admin",
    role: "admin",
  },
];

async function capture() {
  if (!fs.existsSync(PUBLIC_SCREENSHOT_DIR)) {
    fs.mkdirSync(PUBLIC_SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  console.log("=== CAPTURING SCREENSHOTS (DESKTOP & MOBILE) ===");

  for (const target of TARGETS) {
    // 1. Desktop capture
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
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
      ]);
    }

    const desktopPage = await desktopContext.newPage();
    try {
      await desktopPage.goto(target.url, { waitUntil: "networkidle", timeout: 15000 });
      await desktopPage.waitForTimeout(1000); // Allow animations to settle

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
      ]);
    }

    const mobilePage = await mobileContext.newPage();
    try {
      await mobilePage.goto(target.url, { waitUntil: "networkidle", timeout: 15000 });
      await mobilePage.waitForTimeout(1000); // Allow animations to settle

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
