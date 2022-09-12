import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { LoginPage } from './pages/login.page';
import { ProjectsPage } from './pages/projects.page';
import { NewLexProjectPage } from './pages/new-lex-project.page';

import { Project } from './utils/types';

import { initTestProject } from './utils/testSetup';
import constants from './testConstants.json';

// import {browser, ExpectedConditions, Key} from 'protractor';

// import {BellowsLoginPage} from '../../bellows/shared/login.page';
// import {Utils} from '../../bellows/shared/utils';
// import {EditorPage} from './shared/editor.page';
// import {NewLexProjectPage} from './shared/new-lex-project.page';

// TODO: names of these tests are not yet well chosen
test.describe('Lexicon E2E New Project wizard app', () => {
  let newLexProjectPageAdmin: NewLexProjectPage;
  let newLexProjectPageManager: NewLexProjectPage;
  let newLexProjectPageMember: NewLexProjectPage;
  const existingProject: Project = {
    name: 'lexicon-new-project_spec_ts Existing Project',
    code: 'p00_lexicon-new-project_spec_ts',
    id: ''
  };
  const newProject01: Project = {
    name: 'lexicon-new-project_spec_ts New Project 1',
    code: 'lexicon-new-project_spec_ts_new_project_1', // code as it is generated based on the project name
    id: ''
  };

  test.beforeAll(async ({ adminTab, managerTab, memberTab, request, manager, member }) => {
    newLexProjectPageAdmin = new NewLexProjectPage(adminTab);
    newLexProjectPageManager = new NewLexProjectPage(managerTab);
    newLexProjectPageMember = new NewLexProjectPage(memberTab);

    existingProject.id = await initTestProject(request, existingProject.code, existingProject.name, manager.username, [member.username]);
  })

  test('Admin can get to wizard', async () => {
    await newLexProjectPageAdmin.goto();
    await expect(newLexProjectPageAdmin.newLexProjectForm).toBeVisible();
    await expect(newLexProjectPageAdmin.chooserPage.createButton).toBeVisible();
  });
  test('Manager can get to wizard', async () => {
    await newLexProjectPageManager.goto();
    await expect(newLexProjectPageManager.newLexProjectForm).toBeVisible();
    await expect(newLexProjectPageManager.chooserPage.createButton).toBeVisible();
  });

  test('Setup: user login and page contains a form', async () => {
    await newLexProjectPageMember.goto();
    await expect(newLexProjectPageMember.newLexProjectForm).toBeVisible();
    await expect(newLexProjectPageMember.chooserPage.createButton).toBeVisible();
  });


  test.describe('Chooser page', () => {

    test('Cannot see Back or Next buttons', async () => {
      await newLexProjectPageMember.goto();
      await expect(newLexProjectPageMember.backButton).not.toBeVisible();
      await expect(newLexProjectPageMember.nextButton).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
    });

    test('Can navigate to new project form and back', async () => {
      await newLexProjectPageMember.goto();
      await expect(newLexProjectPageMember.chooserPage.createButton).toBeEnabled();
      await newLexProjectPageMember.chooserPage.createButton.click();
      await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();

      // Can go back to Chooser page
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
    });

    test('Can navigate to Send and Receive form and back', async () => {
      await newLexProjectPageMember.goto();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeEnabled();
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();

      // Can go back to Chooser page
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
    });
  });

  test.describe('Send Receive Credentials page', () => {

    test.beforeEach(async () => {
      await newLexProjectPageMember.goto();
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
    })

    // TODO: find a better name for this test
    test('Can get back to Send and Receive Credentials page', async ({ member }) => {
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible(); // duplicate with line 4 of previous test
      expect(await newLexProjectPageMember.srCredentialsPage.loginInput.inputValue()).toEqual(member.username);
      await expect(newLexProjectPageMember.srCredentialsPage.passwordInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
    });

    test('Cannot move on if Password is empty', async () => {
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.nextButton.click();

      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Password cannot be empty.');
    });

    test('Cannot move on if username is incorrect and can go back to Chooser page, user and password preserved', async ({ member }) => {
      // passwordInvalid is, incredibly, an invalid password.
      // It's valid only in the sense that it follows the password rules
      await newLexProjectPageMember.srCredentialsPage.passwordInput.fill(constants.passwordValid);
      await expect(newLexProjectPageMember.srCredentialsPage.credentialsInvalid).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('The username or password isn\'t valid on LanguageDepot.org.');

      // can go back to Chooser page, user and password preserved
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      expect(await newLexProjectPageMember.srCredentialsPage.loginInput.inputValue()).toEqual(member.username);
      expect(await newLexProjectPageMember.srCredentialsPage.passwordInput.inputValue()).toEqual(constants.passwordValid);
    });

    test('Cannot move on if Login is empty', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill('');
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Login cannot be empty.');
    });

    test('Cannot move on if credentials are invalid', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill(constants.srUsername);
      await newLexProjectPageMember.srCredentialsPage.passwordInput.fill(constants.passwordValid);
      await expect(newLexProjectPageMember.srCredentialsPage.credentialsInvalid).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginOk).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
    });

    // TODO: when it is clear how SendReceive and Playwright will work together, test and activate this test
    test.skip('can move on when the credentials are valid', async () => {
      await newLexProjectPageMember.srCredentialsPage.passwordInput.fill(constants.srPassword);
      await expect(newLexProjectPageMember.srCredentialsPage.loginOk).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.passwordOk).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
    });

    // TODO: when it is clear how SendReceive and Playwright will work together, test and activate this test
    test.skip('Cannot move on if no project is selected', async () => {
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Please select a Project.');
    });

    /*
    test('cannot move on if not a manager of the project', async () => {
      await Utils.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name2');
      expect<any>(await page.srCredentialsPage.projectNoAccess.isDisplayed()).toBe(true);
      await page.formStatus.expectContainsError('select a Project that you are the Manager of');
    });

    test('can move on when a managed project is selected', async () => {
      await Utils.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name4');
      expect<any>(await page.srCredentialsPage.projectOk.isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
      await page.expectFormIsValid();
    });

  });
  */
    test.describe('Send Receive Verify page', () => {
      /*
      // TODO: when it is clear how SendReceive and Playwright will work together, test and activate this test; make sure to put navigation
      test('Can clone project', async () => {
        await newLexProjectPageMember.nextButton.click();
        await browser.wait(ExpectedConditions.visibilityOf(page.srClonePage.cloning), constants.conditionTimeout);
         expect<any>(await page.srClonePage.cloning.isDisplayed()).toBe(true);
       });

       test('cannot move on while cloning', async () => {
         expect<any>(await page.nextButton.isDisplayed()).toBe(false);
         expect<any>(await page.nextButton.isEnabled()).toBe(false);
         await page.expectFormIsNotValid();
       });
       */

    });

    test.describe('New Project Name page', () => {
      test.beforeEach(async () => {
        await newLexProjectPageMember.goto();
        await newLexProjectPageMember.chooserPage.createButton.click();
      });

      test('Can create a new project', async () => {
        await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
      });

      test('Cannot move on if name is invalid', async () => {
        await expect(newLexProjectPageMember.nextButton).toBeEnabled();
        await newLexProjectPageMember.nextButton.click();
        await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
        await newLexProjectPageMember.expectFormStatusHasError();
        await expect(newLexProjectPageMember.formStatus).toContainText('Project Name cannot be empty.');
      });

      test('Finds the test project already exists', async () => {
        await newLexProjectPageMember.namePage.projectNameInput.fill(existingProject.code);
        await newLexProjectPageMember.namePage.projectNameInput.press('Tab');
        await expect(newLexProjectPageMember.namePage.projectCodeExists).toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
        expect(await newLexProjectPageMember.namePage.projectCodeInput.inputValue()).toEqual(existingProject.code);
        await newLexProjectPageMember.expectFormStatusHasError();
        await expect(newLexProjectPageMember.formStatus).toContainText(
          'Another project with code \'' + existingProject.code +
          '\' already exists.');
        });

        test('With a cleared name does not show an error but is still invalid', async () => {
          await newLexProjectPageMember.namePage.projectNameInput.fill('');
          await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
          await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
          await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
          await newLexProjectPageMember.expectFormStatusHasNoError();
          await expect(newLexProjectPageMember.nextButton).toBeEnabled();
          await newLexProjectPageMember.nextButton.click();
          await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
          await newLexProjectPageMember.expectFormStatusHasError();
          await expect(newLexProjectPageMember.formStatus).toContainText('Project Name cannot be empty.');
      });

      test('Can verify that an unused project name is available', async () => {
        await newLexProjectPageMember.namePage.projectNameInput.fill(newProject01.name);
        await newLexProjectPageMember.namePage.projectNameInput.press('Tab');
        await expect(newLexProjectPageMember.namePage.projectCodeOk).toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
        expect(await newLexProjectPageMember.namePage.projectCodeInput.inputValue()).toEqual(newProject01.code);
        await newLexProjectPageMember.expectFormStatusHasNoError();
      });

      /*
      test('can not edit project code by default', async () => {
        expect<any>(await page.namePage.projectCodeInput.isDisplayed()).toBe(false);
      });

      test('can edit project code when enabled', async () => {
        expect<any>(await page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
        await util.setCheckbox(page.namePage.editProjectCodeCheckbox, true);
        expect<any>(await page.namePage.projectCodeInput.isDisplayed()).toBe(true);
        await page.namePage.projectCodeInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
        await page.namePage.projectCodeInput.sendKeys('changed_new_project');
        await page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
        expect<any>(await page.namePage.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
        await page.formStatus.expectHasNoError();
      });

      test('project code cannot be empty; does not show an error but is still invalid', async () => {
        await page.namePage.projectCodeInput.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.BACK_SPACE);
        await page.namePage.projectCodeInput.sendKeys(Key.TAB);     // trigger project code check
        await browser.wait(ExpectedConditions.stalenessOf(page.namePage.projectCodeExists), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeOk.isPresent()).toBe(false);
        await page.formStatus.expectHasNoError();
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.nextButton.click();
        expect<any>(await page.namePage.projectNameInput.isPresent()).toBe(true);
        await page.formStatus.expectContainsError('Project Code cannot be empty.');
      });

      test('project code can be one character', async () => {
        await page.namePage.projectCodeInput.clear();
        await page.namePage.projectCodeInput.sendKeys('a');
        await page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeOk.isDisplayed()).toBe(true);
        await page.formStatus.expectHasNoError();
      });

      test('project code cannot be uppercase', async () => {
        await page.namePage.projectCodeInput.clear();
        await page.namePage.projectCodeInput.sendKeys('A' + Key.TAB);
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
        expect<any>(await page.namePage.projectCodeOk.isPresent()).toBe(false);
        await page.formStatus.expectHasNoError();
        await page.nextButton.click();
        await page.formStatus.expectContainsError('Project Code must begin with a letter');
        await page.namePage.projectCodeInput.clear();
        await page.namePage.projectCodeInput.sendKeys('aB' + Key.TAB);
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
        expect<any>(await page.namePage.projectCodeOk.isPresent()).toBe(false);
        await page.formStatus.expectHasNoError();
        await page.nextButton.click();
        await page.formStatus.expectContainsError('Project Code must begin with a letter');
      });

      test('project code cannot start with a number', async () => {
        await page.namePage.projectCodeInput.clear();
        await page.namePage.projectCodeInput.sendKeys('1' + Key.TAB);
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
        expect<any>(await page.namePage.projectCodeOk.isPresent()).toBe(false);
        await page.formStatus.expectHasNoError();
        await page.nextButton.click();
        await page.formStatus.expectContainsError('Project Code must begin with a letter');
      });

      test('project code cannot use non-alphanumeric', async () => {
        await page.namePage.projectCodeInput.clear();
        await page.namePage.projectCodeInput.sendKeys('a?' + Key.TAB);
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
        expect<any>(await page.namePage.projectCodeOk.isPresent()).toBe(false);
        await page.formStatus.expectHasNoError();
        await page.nextButton.click();
        await page.formStatus.expectContainsError('Project Code must begin with a letter');
      });

      test('project code reverts to default when Edit-project-code is disabled', async () => {
        expect<any>(await page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
        await util.setCheckbox(page.namePage.editProjectCodeCheckbox, false);
        expect<any>(await page.namePage.projectCodeInput.isDisplayed()).toBe(false);
        expect(await page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
        await page.formStatus.expectHasNoError();
      });

      test('can create project', async () => {
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.expectFormIsValid();
        await page.nextButton.click();
        expect<any>(await page.namePage.projectNameInput.isPresent()).toBe(false);
        expect<any>(await page.initialDataPage.browseButton.isPresent()).toBe(true);
        await page.formStatus.expectHasNoError();
      });

    });

    test.describe('Initial Data page with upload', () => {

      test('cannot see back button and defaults to uploading data', async () => {
        expect<any>(await page.backButton.isDisplayed()).toBe(false);
        expect<any>(await page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect<any>(await page.progressIndicatorStep3Label.getText()).toEqual('Verify');
        await page.expectFormIsNotValid();
        await page.formStatus.expectHasNoError();
      });

      test.describe('Mock file upload', () => {

        test('cannot upload large file', async () => {
          await page.initialDataPage.mockUpload.enableButton.click();
          expect<any>(await page.initialDataPage.mockUpload.fileNameInput.isPresent()).toBe(true);
          expect<any>(await page.initialDataPage.mockUpload.fileNameInput.isDisplayed()).toBe(true);
          await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
          await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(134217728);
          expect<any>(await page.noticeList.count()).toBe(0);
          await page.initialDataPage.mockUpload.uploadButton.click();
          expect<any>(await page.initialDataPage.browseButton.isDisplayed()).toBe(true);
          expect<any>(await page.verifyDataPage.entriesImported.isPresent()).toBe(false);
          expect<any>(await page.noticeList.count()).toBe(1);
          expect<any>(await page.noticeList.get(0).getText()).toContain('is too large. It must be smaller than');
          await page.formStatus.expectHasNoError();
          await page.initialDataPage.mockUpload.fileNameInput.clear();
          await page.initialDataPage.mockUpload.fileSizeInput.clear();
          await page.firstNoticeCloseButton.click();
        });

        test('cannot upload jpg', async () => {
          await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockJpgImportFile.name);
          await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockJpgImportFile.size);
          expect<any>(await page.noticeList.count()).toBe(0);
          await page.initialDataPage.mockUpload.uploadButton.click();
          expect<any>(await page.initialDataPage.browseButton.isDisplayed()).toBe(true);
          expect<any>(await page.verifyDataPage.entriesImported.isPresent()).toBe(false);
          expect<any>(await page.noticeList.count()).toBe(1);
          expect(await page.noticeList.get(0).getText()).toContain(constants.testMockJpgImportFile.name +
            ' is not an allowed compressed file. Ensure the file is');
          await page.formStatus.expectHasNoError();
          await page.initialDataPage.mockUpload.fileNameInput.clear();
          await page.initialDataPage.mockUpload.fileSizeInput.clear();
          await page.firstNoticeCloseButton.click();
        });

        test('can upload zip file', async () => {
          await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
          await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockZipImportFile.size);
          expect<any>(await page.noticeList.count()).toBe(0);
          await page.initialDataPage.mockUpload.uploadButton.click();
          expect<any>(await page.verifyDataPage.entriesImported.isDisplayed()).toBe(true);
          expect<any>(await page.noticeList.count()).toBe(1);
          expect(await page.noticeList.get(0).getText()).toContain('Successfully imported ' +
            constants.testMockZipImportFile.name);
          await page.formStatus.expectHasNoError();
        });

      });

    });

    test.describe('Verify Data await page', () => {

      test('displays stats', async () => {
        expect<any>(await page.verifyDataPage.title.getText()).toEqual('Verify Data');
        expect<any>(await page.verifyDataPage.entriesImported.getText()).toEqual('2');
        await page.formStatus.expectHasNoError();
      });

      // regression avoidance test - should not redirect when button is clicked
      test('displays non-critical errors', async () => {
        expect<any>(await page.verifyDataPage.importErrors.isPresent()).toBe(true);
        expect<any>(await page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
        await page.verifyDataPage.nonCriticalErrorsButton.click();
        expect<any>(await page.verifyDataPage.title.getText()).toEqual('Verify Data');
        await page.formStatus.expectHasNoError();
        expect<any>(await page.verifyDataPage.importErrors.isDisplayed()).toBe(true);
        expect(await page.verifyDataPage.importErrors.getText())
          .toContain('range file \'TestProj.lift-ranges\' was not found');
        await page.verifyDataPage.nonCriticalErrorsButton.click();
        await browser.wait(ExpectedConditions.invisibilityOf(page.verifyDataPage.importErrors), constants.conditionTimeout);
        expect<any>(await page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
      });

      test('can go to lexicon', async () => {
        expect<any>(await page.nextButton.isDisplayed()).toBe(true);
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.expectFormIsValid();
        await page.nextButton.click();
        expect<any>(editorPage.browse.getEntryCount()).toBe(2);
      });

    });

    test.describe('New Empty Project Name page', () => {

      test('create: new empty project', async () => {
        await NewLexProjectPage.get();
        await page.chooserPage.createButton.click();
        await page.namePage.projectNameInput.sendKeys(constants.emptyProjectName + Key.TAB);
        await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), constants.conditionTimeout);
        expect<any>(await page.namePage.projectCodeExists.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
        expect<any>(await page.namePage.projectCodeOk.isDisplayed()).toBe(true);
        expect<any>(await page.nextButton.isEnabled()).toBe(true);

        // added sleep to ensure state is stable so the next test passes (expectFormIsNotValid)
        await browser.sleep(500);
        await page.nextButton.click();
        expect<any>(await page.namePage.projectNameInput.isPresent()).toBe(false);
        expect<any>(await page.initialDataPage.browseButton.isPresent()).toBe(true);
      });

    });

    test.describe('Initial Data page skipping upload', () => {

      test('can skip uploading data', async () => {
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.expectFormIsNotValid();
        await page.nextButton.click();
        expect<any>(await page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      });

    });

    test.describe('Primary Language page', () => {

      test('can go back to initial data page (then forward again)', async () => {
        expect<any>(await page.backButton.isDisplayed()).toBe(true);
        expect<any>(await page.backButton.isEnabled()).toBe(true);
        await page.backButton.click();
        expect<any>(await page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.expectFormIsNotValid();
        await page.nextButton.click();
        expect<any>(await page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
        expect<any>(await page.backButton.isDisplayed()).toBe(true);
      });

      test('cannot move on if language is not selected', async () => {
        expect<any>(await page.nextButton.isEnabled()).toBe(true);
        await page.expectFormIsNotValid();
        await page.nextButton.click();
        expect<any>(await page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
        await page.formStatus.expectContainsError('Please select a primary language for the project.');
      });

      test('can select language', async () => {
        expect<any>(await page.primaryLanguagePage.selectButton.isEnabled()).toBe(true);
        await page.primaryLanguagePage.selectButtonClick();
        expect<any>(await page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
      });

      test.describe('Select Language modal', () => {

        test('can search, select and add language', async () => {
          await page.modal.selectLanguage.searchLanguageInput.sendKeys(constants.searchLanguage + Key.ENTER);
          expect<any>(await page.modal.selectLanguage.languageRows.first().isPresent()).toBe(true);

          expect<any>(await page.modal.selectLanguage.addButton.isPresent()).toBe(true);
          expect<any>(await page.modal.selectLanguage.addButton.isEnabled()).toBe(false);
          await page.modal.selectLanguage.languageRows.first().click();
          expect<any>(await page.modal.selectLanguage.addButton.isEnabled()).toBe(true);
          expect<any>(await page.modal.selectLanguage.addButton.getText()).toEqual('Add ' + constants.foundLanguage);

          await page.modal.selectLanguage.addButton.click();
          await browser.wait(ExpectedConditions.stalenessOf(page.modal.selectLanguage.searchLanguageInput),
            constants.conditionTimeout);
          expect<any>(await page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
        });
        */
    });
  });
});
