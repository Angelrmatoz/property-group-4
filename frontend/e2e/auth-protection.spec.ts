import { test, expect } from "@playwright/test";
import { LoginPage, MOCK_ADMIN_USER } from "./pages/login.page";

test.describe("Auth Protection", () => {
  test("unauthenticated user is redirected from dashboard to login", async ({ page }) => {
    // Ensure no token in localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    
    // Try to access dashboard
    await page.goto("/dashboard");
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test("authenticated user can see dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsAdmin();
    
    await expect(page.getByText(/Bienvenido al Dashboard/i)).toBeVisible({ timeout: 15000 });
  });
});
