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
};

type VerifyDataPage = {
  title: Locator,
  nonCriticalErrorsButton: Locator,
  entriesImported: Locator,
  importErrors: Locator,
};

type SelectLanguageModal = {
  searchLanguageInput: Locator,
  languageRows: Locator,
  addButton: Locator,
};

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

  // step 3: verify data
  readonly verifyDataPage: VerifyDataPage;

  // step 3 alternate: primary language
  readonly primaryLanguagePageSelectButton: Locator;
  // select language modal
  readonly selectLanguage: SelectLanguageModal;
  // primaryLanguagePage = {
  //   selectButton: element(by.id('select-language-button')),
  //   // tslint:disable-next-line:max-line-length
  //   // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
  //   async selectButtonClick() {
  //     await element(by.id('select-language-button')).click();
  //     return browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
  //   }
  // };
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
    this.verifyDataPage = {
      title: page.locator('#new-project-verify'),
      nonCriticalErrorsButton: page.locator('#non-critical-errors-button'),
      entriesImported: page.locator('#entries-imported'),
      importErrors: page.locator('#import-errors'),
    };
    this.primaryLanguagePageSelectButton = page.locator('#select-language-button');
    this.selectLanguage = {
      searchLanguageInput: page.locator('.modal-body >> #search-text-input'),
      languageRows: page.locator('.modal-body >> [data-ng-repeat*="language in $ctrl.languages"]'),
      addButton: page.locator('.modal-footer >> #select-language-add-btn'),
    };
  };


  async goto() {
    await this.page.goto(NewLexProjectPage.url);
    // await expect(this.passwordInput).toBeVisible();
  }

  async expectFormStatusHasNoError() {
    // this expect was flaky; suspicion: await and retry do not work properly with the "not" negation
    // await expect(this.formStatus).not.toHaveClass(/alert-danger/);
    // this regular expression finds everything not containing "alert-danger"
    await expect(this.formStatus).toHaveClass(/^((?!alert-danger).)*$/);
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

}
