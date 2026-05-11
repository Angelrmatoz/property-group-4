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
    // During transition, it might have both or neither temporarily
    // We check for w-16 which defines collapsed state
    await expect(this.sidebar).toHaveClass(/w-16/, { timeout: 10000 });
  }

  async expectExpanded() {
    await expect(this.sidebar).toHaveClass(/w-64/, { timeout: 10000 });
  }

  async navigateToProperties() {
    await this.navProperties.click();
  }

  async navigateToDashboard() {
    await this.navInicio.click();
  }

  async logout() {
    await this.navLogout.click();
    await this.page.waitForURL("**/login");
  }
}
