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
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ADMIN_USER),
      });
    });

    // Also mock 'me' call used by Sidebar
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
    
    // Set token BEFORE visiting the site to ensure hydration sees it
    await this.page.goto("/"); 
    await this.page.evaluate((token) => {
      const expiry = String(Date.now() + 24 * 60 * 60 * 1000);
      
      // Set in BOTH to be bulletproof
      localStorage.setItem("authToken", token);
      localStorage.setItem("authTokenExpiry", expiry);
      localStorage.setItem("rememberMe", "true");
      
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("authTokenExpiry", expiry);
    }, MOCK_ADMIN_USER.token);

    // Navigate to dashboard and wait for it
    await this.page.goto("/dashboard");
    await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  }
}
