import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly propertyCards: Locator;
  readonly statsCards: Locator;
  readonly newPropertyBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/Buscar propiedades/i);
    this.propertyCards = page.locator(".grid .group"); // Select property cards by class for now if no testid
    this.statsCards = page.locator(".grid .border-l-4");
    this.newPropertyBtn = page.getByRole("button", { name: /Nueva Propiedad/i });
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for filter logic if needed, usually instant in React
  }
}
