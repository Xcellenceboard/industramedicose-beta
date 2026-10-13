import { test, expect } from "@playwright/test";

test.describe("Industra Medicose E2E Flows", () => {
  // Core Flow 1: Patient Intake via Chat Input
  test("Core Flow 1: Patient Intake conversation and symptom input", async ({ page, context }) => {
    await context.addCookies([
      { name: "im_demo_role", value: "patient", domain: "localhost", path: "/" },
    ]);

    await page.goto("/patient/intake");

    // Verify Medi avatar/header is visible
    await expect(page.locator("text=Medi").first()).toBeVisible({ timeout: 10000 });

    // Locate the intake message input by id
    const input = page.locator("#intake-message-input");
    await expect(input).toBeVisible({ timeout: 10000 });

    await input.fill("Mujhe 3 din se halka bukhar aur gala kharab hai");
    await input.press("Enter");
    
    // Click send button as fallback
    const sendBtn = page.locator("#intake-send-button");
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
    }

    // Verify patient's chat bubble appears in transcript
    await expect(page.locator("text=Mujhe 3 din se halka bukhar aur gala kharab hai")).toBeVisible({ timeout: 10000 });
  });

  // Core Flow 2: Urgent Red Flag Symptom Interruption (< 2ms Deterministic Safety Net)
  test("Core Flow 2: Deterministic emergency gate interrupts patient immediately for urgent symptoms", async ({ page, context }) => {
    await context.addCookies([
      { name: "im_demo_role", value: "patient", domain: "localhost", path: "/" },
    ]);

    await page.goto("/patient/intake");

    const input = page.locator("#intake-message-input");
    await expect(input).toBeVisible({ timeout: 10000 });

    // Type urgent symptom: crushing chest pain + breathlessness and press Enter
    await input.fill("mere seene mein bahut tej dard hai aur saans nahi aa rahi");
    await input.press("Enter");

    // Deterministic safety gate triggers immediately (< 2ms) and renders the Urgent Alert Modal
    const emergencyDialog = page.locator("[role='alertdialog']");
    await expect(emergencyDialog).toBeVisible({ timeout: 5000 });

    // Verify 112 emergency phone action is rendered
    await expect(emergencyDialog.locator("a[href='tel:112']").first()).toBeVisible();
    await expect(emergencyDialog.locator("text=112").first()).toBeVisible();
  });

  // Core Flow 3: Doctor OPD Review & Record Sign-Off
  test("Core Flow 3: Doctor reviews consultation and signs off clinical record", async ({ page, context }) => {
    await context.addCookies([
      { name: "im_demo_role", value: "doctor", domain: "localhost", path: "/" },
    ]);

    // 1. Visit doctor queue
    await page.goto("/doctor");
    await expect(page.locator("text=Live OPD Triage Queue")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Vikramaditya Rathore").first()).toBeVisible({ timeout: 10000 });

    // 2. Click "Review Record (2-Min)" on Vikramaditya Rathore card
    const reviewBtn = page.locator("a[href*='/doctor/consultation/c-101']").or(page.locator("button:has-text('Review Record')")).first();
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    // Wait for patient record to appear on consultation page
    await expect(page.locator("text=Vikramaditya Rathore").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=The 8 Critical Facts").or(page.locator("text=Chief Complaint")).first()).toBeVisible();

    // 3. Find Approve Record button
    const approveBtn = page.locator("button:has-text('Approve Record')").or(page.locator("button:has-text('Approved & Verified')")).first();
    await expect(approveBtn).toBeVisible({ timeout: 10000 });

    const btnText = await approveBtn.textContent();
    if (btnText && btnText.includes("Approve Record")) {
      await approveBtn.click();

      // Attestation modal should appear
      await expect(page.locator("text=Physician Attestation")).toBeVisible();

      // Click Confirm & Publish Record
      const confirmBtn = page.locator("button:has-text('Confirm & Publish Record')");
      await confirmBtn.click();

      // Verify approved state
      await expect(page.locator("text=APPROVED & SIGNED").or(page.locator("text=Approved & Verified")).first()).toBeVisible({ timeout: 10000 });
    } else {
      // Already approved in state
      await expect(page.locator("text=Approved & Verified").or(page.locator("text=APPROVED & SIGNED")).first()).toBeVisible();
    }
  });
});
