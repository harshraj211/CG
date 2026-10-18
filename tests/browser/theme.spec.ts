import { test, expect } from "@playwright/test";

test("pure black theme persists across pages and includes the code editor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to pure black theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  for (const selector of ["body", ".sidebar", ".topbar", ".panel", ".hero", ".readiness-ring > div"]) {
    await expect(page.locator(selector).first()).toHaveCSS("background-color", "rgb(0, 0, 0)");
  }
  await page.goto("/settings");
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveValue("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/coding/code-001");
  await expect(page.locator(".monaco-editor").first()).toBeVisible();
  await expect(page.locator(".monaco-editor .monaco-editor-background").first()).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 247, 245)");
});

test("theme switch remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Switch to pure black theme" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
