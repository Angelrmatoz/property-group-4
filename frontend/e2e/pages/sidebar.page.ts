import { Page, Locator, expect } from "@playwright/test";

export class SidebarPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly toggleBtn: Locator;
  readonly navInicio: Locator;
  readonly navProperties: Locator;
  readonly navUsersToggle: Locator;
  readonly navUsersList: Locator;
  readonly navUsersCreate: Locator;
  readonly navWeb: Locator;
  readonly navLogout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.getByTestId("sidebar");
    this.toggleBtn = page.getByTestId("sidebar-toggle");
    this.navInicio = page.getByTestId("nav-inicio");
    this.navProperties = page.getByTestId("nav-properties");
    this.navUsersToggle = page.getByTestId("nav-users-toggle");
    this.navUsersList = page.getByTestId("nav-users-list");
    this.navUsersCreate = page.getByTestId("nav-users-create");
    this.navWeb = page.getByTestId("nav-web");
    this.navLogout = page.getByTestId("nav-logout");
  }

  async toggle() {
    await this.toggleBtn.click();
  }

  async expectCollapsed() {
    // Instead of matching exact classes, wait for the element's width to stabilize
    // or check for the specific utility class that dictates width.
    await expect(this.sidebar).toHaveClass(/w-16/, { timeout: 15000 });
  }

  async expectExpanded() {
    await expect(this.sidebar).toHaveClass(/w-64/, { timeout: 15000 });
  }

  async navigateToProperties() {
    await this.navProperties.click();
  }

  async toggleUsersSubmenu() {
    await this.navUsersToggle.click();
    // Wait for transition to complete
    await this.page.waitForTimeout(500); 
  }

  async logout() {
    await this.navLogout.click();
    await this.page.waitForURL("**/login");
  }
}
