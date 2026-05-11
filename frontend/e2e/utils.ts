import { Page } from "@playwright/test";

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

export async function mockAuthApi(page: Page) {
  await page.route("**/api/login", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ADMIN_USER),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ADMIN_USER),
      });
    }
  });
}

export async function loginAsAdmin(page: Page) {
  await mockAuthApi(page);

  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60000 });

  await page.evaluate(() => {
    localStorage.setItem("authToken", "mock-jwt-token-123");
    localStorage.setItem("authTokenExpiry", String(Date.now() + 24 * 60 * 60 * 1000));
    localStorage.setItem("rememberMe", "true");
  });

  await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 60000 });
}