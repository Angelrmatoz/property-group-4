import { test, expect } from "@playwright/test";
import { SidebarPage } from "./pages/sidebar.page";
import { LoginPage } from "./pages/login.page";

test.describe("Sidebar Responsive Behavior", () => {
  let sidebarPage: SidebarPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    sidebarPage = new SidebarPage(page);
    loginPage = new LoginPage(page);
  });

  test("sidebar starts closed on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.loginAsAdmin();
    await sidebarPage.expectCollapsed();
  });

  test("sidebar starts open on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginPage.loginAsAdmin();
    await sidebarPage.expectExpanded();
  });

  test("manual toggle works reliably", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginPage.loginAsAdmin();
    await sidebarPage.expectExpanded();
    
    await sidebarPage.toggle();
    await sidebarPage.expectCollapsed();

    await sidebarPage.toggle();
    await sidebarPage.expectExpanded();
  });

  test("sidebar closes automatically when navigating on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.loginAsAdmin();
    
    await sidebarPage.toggle();
    await sidebarPage.expectExpanded();

    await sidebarPage.navigateToProperties();
    await sidebarPage.expectCollapsed();
    await expect(page).toHaveURL(/.*properties/, { timeout: 10000 });
  });

  test("users submenu can be toggled when expanded", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginPage.loginAsAdmin();
    await sidebarPage.expectExpanded();

    const listLink = sidebarPage.navUsersList;
    
    // Evaluate actual DOM state to decide action, overcoming any hydration flakiness
    const isCurrentlyVisible = await listLink.isVisible();
    
    if (isCurrentlyVisible) {
      await sidebarPage.toggleUsersSubmenu();
      await expect(listLink).not.toBeVisible();
      
      await sidebarPage.toggleUsersSubmenu();
      await expect(listLink).toBeVisible({ timeout: 10000 });
    } else {
      await expect(listLink).not.toBeVisible();
      
      await sidebarPage.toggleUsersSubmenu();
      await expect(listLink).toBeVisible({ timeout: 10000 });
      
      await sidebarPage.toggleUsersSubmenu();
      await expect(listLink).not.toBeVisible();
    }
    
    // Final check to ensure it works
    if (!(await listLink.isVisible())) {
       await sidebarPage.toggleUsersSubmenu();
    }
    await expect(listLink).toHaveText(/Lista/i);
  });
});

test.describe("Sidebar Persistence", () => {
  test("state persists in localStorage after reload on desktop", async ({ page }) => {
    const sidebarPage = new SidebarPage(page);
    const loginPage = new LoginPage(page);
    
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginPage.loginAsAdmin();
    
    await sidebarPage.expectExpanded();

    await sidebarPage.toggle();
    await sidebarPage.expectCollapsed();

    await page.reload({ waitUntil: "domcontentloaded" });
    await sidebarPage.expectCollapsed();
  });
});
