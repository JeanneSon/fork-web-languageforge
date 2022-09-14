import { expect, Locator, Page } from '@playwright/test';

type ChooserPage = {
  sendReceiveButton: Locator;
  createButton: Locator;
};

type NamePage = {
  projectNameInput: Locator,
  projectCodeInput: Locator,
  projectCodeUneditableInput: Locator,
  projectCodeLoading: Locator,
  projectCodeExists: Locator,
  projectCodeAlphanumeric: Locator,
  projectCodeOk: Locator,
  editProjectCodeCheckbox: Locator
};

type SrCredentialsPage = {
  loginOk: Locator,
  loginInput: Locator,
  passwordInput: Locator,
  credentialsInvalid: Locator,
  passwordOk: Locator,
  projectNoAccess: Locator,
  projectOk: Locator
  projectSelect: Locator
}

export class NewLexProjectPage {
  readonly page: Page;

  readonly newLexProjectForm: Locator;
  // form controls
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly formStatus: Locator;
  readonly progressIndicatorStep3Label: Locator;

  // step 0: chooser
  readonly chooserPage: ChooserPage;

  // step 1: project name
  readonly namePage: NamePage;

  // step 1: send receive credentials
  readonly srCredentialsPage: SrCredentialsPage;

  // step 2: initial data
  readonly initialDataPageBrowseButton: Locator;

  static readonly url: string = '/app/lexicon/new-project';

  constructor(page: Page) {
    this.page = page;
    this.newLexProjectForm = page.locator('#new-lex-project-form');
    this.backButton = page.locator('#back-button');
    this.nextButton = page.locator('#next-button');
    this.formStatus = page.locator('#form-status');
    this.progressIndicatorStep3Label = page.locator('#progress-indicator-step3-label');

    this.chooserPage = {
      sendReceiveButton: page.locator('#send-receive-button'),
      createButton: page.locator('#create-button')
    };
    this.namePage = {
      projectNameInput: page.locator('#project-name'),
      projectCodeInput: page.locator('#project-code'),
      projectCodeUneditableInput: page.locator('#project-code-uneditable'),
      projectCodeLoading: page.locator('#project-code-loading'),
      projectCodeExists: page.locator('#project-code-exists'),
      projectCodeAlphanumeric: page.locator('#project-code-alphanumeric'),
      projectCodeOk: page.locator('#project-code-ok'),
      editProjectCodeCheckbox: page.locator('#edit-project-code')
    };
    this.srCredentialsPage = {
      loginInput: page.locator('#sr-username'),
      loginOk: page.locator('#username-ok'),
      passwordInput: page.locator('#sr-password'),
      credentialsInvalid: page.locator('#credentials-invalid'),
      passwordOk: page.locator('#password-ok'),
      projectNoAccess: page.locator('#project-no-access'),
      projectOk: page.locator('#project-ok'),
      projectSelect: page.locator('#sr-project-select')
    };

    this.initialDataPageBrowseButton = page.locator('#browse-button');
  };


  async goto() {
    await this.page.goto(NewLexProjectPage.url);
    // await expect(this.passwordInput).toBeVisible();
  }

  async expectFormStatusHasNoError() {
    await expect(this.formStatus).not.toHaveClass(/alert-danger/);
  }

  async expectFormStatusHasError() {
    await expect(this.formStatus).toHaveClass(/alert-danger/);
  }

  async expectFormIsValid() {
    await expect(this.nextButton).toHaveClass(/btn-primary(?:\s|$)/);
  }

  async expectFormIsNotValid() {
    await expect(this.nextButton).not.toHaveClass(/btn-primary(?:\s|$)/);
  }

  // formStatus = {
  //   async expectHasNoError() {
  //     expect(await element(by.id('form-status')).getAttribute('class')).not.toContain('alert-danger');
  //   },
  //   async expectContainsError(partialMsg: string) {
  //     if (!partialMsg) partialMsg = '';
  //     expect(await element(by.id('form-status')).getAttribute('class')).toContain('alert-danger');
  //     expect(await element(by.id('form-status')).getText()).toContain(partialMsg);
  //   }
  // };
}
