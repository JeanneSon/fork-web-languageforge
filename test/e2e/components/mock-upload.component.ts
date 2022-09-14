import { Locator, Page } from "@playwright/test";

export class MockUploadElement {
  readonly page: Page;
  readonly enableButton: Locator;
  readonly fileNameInput: Locator;
  readonly fileSizeInput: Locator;
  readonly uploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.enableButton = page.locator('#showMockUploadButton');
    this.fileNameInput = page.locator('#mockFileName');
    this.fileSizeInput = page.locator('#mockFileSize');
    this.uploadButton = page.locator('#mockUploadButton');
  }
}
