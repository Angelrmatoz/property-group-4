import { Page, expect } from "@playwright/test";

export const MOCK_ADMIN_USER = {
  ok: true,
  user: {
    id: "test-admin-id",
    firstName: "Admin",
    lastName: "Test",
    email: "admin@test.com",
    admin: true,
  },
  token: "mock-jwt-token-123",
};

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/login");
  }

  async mockAuthApi() {
    await this.page.route("**/api/login", async (route) => {
      // Mock both POST (login) and GET (me)
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ADMIN_USER),
      });
    });

    // Keep users mock for other tests
    await this.page.route("**/api/users/me", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_ADMIN_USER),
        });
    });
  }

  async loginAsAdmin() {
    await this.mockAuthApi();

    await this.page.addInitScript((token) => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authTokenExpiry");
      localStorage.removeItem("rememberMe");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("authTokenExpiry");
      const expiry = String(Date.now() + 24 * 60 * 60 * 1000);
      
      localStorage.setItem("authToken", token);
      localStorage.setItem("authTokenExpiry", expiry);
      localStorage.setItem("rememberMe", "true");
      
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("authTokenExpiry", expiry);
    }, MOCK_ADMIN_USER.token);

    // Navigate to dashboard
    await this.page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    // Ensure we are fully hydrated and seeing the welcome message
    await expect(
      this.page.getByRole("heading", { name: /Bienvenido al Dashboard/i })
    ).toBeVisible({ timeout: 30000 });
  }
}
