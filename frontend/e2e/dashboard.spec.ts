import { test, expect } from "@playwright/test";
import { DashboardPage } from "./pages/dashboard.page";
import { LoginPage } from "./pages/login.page";

test.describe("Dashboard Functionality", () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);

    // Mock properties API
    await page.route("**/api/properties*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "1", title: "Casa de Playa", province: "Samaná", city: "Las Terrenas", type: "Venta", price: 150000 },
          { id: "2", title: "Apartamento Centro", province: "Santo Domingo", city: "Naco", type: "Alquiler", price: 1200 },
        ]),
      });
    });

    await loginPage.loginAsAdmin();
  });

  test("shows property statistics", async ({ page }) => {
    await expect(dashboardPage.statsCards).toHaveCount(4);
    await expect(page.getByText(/Total Propiedades/i)).toBeVisible();
  });

  test("can filter properties by search", async ({ page }) => {
    await expect(dashboardPage.propertyCards).toHaveCount(2);

    await dashboardPage.search("Playa");
    await expect(dashboardPage.propertyCards).toHaveCount(1);
    await expect(page.getByText(/Casa de Playa/i)).toBeVisible();
    await expect(page.getByText(/Apartamento Centro/i)).not.toBeVisible();
  });

  test("navigation to create property works", async ({ page }) => {
    await dashboardPage.newPropertyBtn.click();
    await expect(page).toHaveURL(/.*properties\/create/);
  });
});
