import { expect, Locator, Page } from '@playwright/test';

export type UserRoles =
    'can manage' |
    'can edit' |
    'can comment' |
    'can view'
;
export class ProjectsPage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly projectsList: Locator;
  readonly projectNames: Locator;

  readonly createButton: Locator;
  readonly createNonSRProjectButton: Locator; // SR - send/receive
  readonly projectNameInput: Locator;
  readonly nextButton: Locator; // project creation: step after project name
  readonly skipInitialDataButton: Locator;
  readonly selectLanguageButton: Locator;
  readonly searchLanguageInput: Locator;
  readonly searchLanguageButton: Locator;
  readonly addLanguageButton: Locator;
  readonly finalCreateButton: Locator;

  readonly shareProjectButton: Locator;
  readonly shareProjectEmailInput: Locator;
  readonly shareProjectUserRoleDropdown: Locator;
  readonly shareProjectSendInvitationButton: Locator;

  static readonly url: string = '/app/projects';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=My Projects');
    this.projectsList = page.locator('[data-ng-repeat="project in visibleProjects"]');
    this.projectNames = this.projectsList.locator('a[href^="/app/lexicon"]');

    this.createButton = page.locator('button:has-text("Start or Join a New Project")');
    this.createNonSRProjectButton = page.locator('text=Create a non-send/receive project (not recommended)');
    this.projectNameInput = page.locator('[placeholder="eg\\:\\ My\\ Dictionary"]');
    this.nextButton = page.locator('text=Next');
    this.skipInitialDataButton = page.locator('text=Skip');
    this.selectLanguageButton = page.locator('a:has-text("Select")');
    this.searchLanguageInput = page.locator('[placeholder="Search"]');
    this.searchLanguageButton = page.locator('text=Search');
    this.addLanguageButton = page.locator('#select-language-add-btn');
    this.finalCreateButton = page.locator('button:has-text("Dictionary")');

    this.shareProjectButton = page.locator('span:has-text("Share")');
    this.shareProjectEmailInput = page.locator('[placeholder="Email"]');
    this.shareProjectUserRoleDropdown = page.locator('role-dropdown[target="\'email_invite\'"]');
    this.shareProjectSendInvitationButton = page.locator('button[ng-click="$ctrl.sendEmailInvite()"]')
  }

  async goto() {
    // if url not ProjectsPage.url
    if (! this.page.url().endsWith(ProjectsPage.url)) {
      await this.page.goto(ProjectsPage.url);
      //await this.page.waitForLoadState('domcontentloaded');
    }
    await expect(this.createButton).toBeVisible();
  }

  async createEmptyProject(projectName: string) {
    await this.goto();
    await this.createButton.click();
    expect(this.page.url()).toContain('app/lexicon/new-project');
    await this.createNonSRProjectButton.click();
    await this.projectNameInput.fill(projectName);
    await this.nextButton.click();
    await this.skipInitialDataButton.click();
    await this.selectLanguageButton.click();
    await this.searchLanguageInput.fill('swab');
    await this.searchLanguageButton.click();
    await this.page.locator('text=Swabian').click();
    await this.addLanguageButton.click();
    await this.finalCreateButton.click()
  }

  async addUserToProject(projectName: string, userEmail: string, userRole: UserRoles) {
    await this.goto();
    await this.clickOnProject(projectName);
    await this.shareProjectButton.click();
    await this.shareProjectEmailInput.fill(userEmail);
    await this.shareProjectUserRoleDropdown.click();
    await this.page.locator('div.modal-dropdown[style*="display: block"] >> a.dropdown-item >> text=' + userRole).click();
    await this.shareProjectSendInvitationButton.click();
  }

  async countProjects(): Promise<number> {
    await expect(this.createButton).toBeVisible();
    return await this.projectsList.count();
  }

  async findProject(projectName: string): Promise<string>  {
    await this.goto();
    if (await this.page.locator('text=' + projectName + ' >> nth=1').isVisible()) {
      return 'text=' + projectName + ' >> nth=1';
    }
    else {
      return '-1';
    }
  }

  async clickOnProject(projectName: string) {
    const projectLocatorString: string = await this.findProject(projectName);
    expect(projectLocatorString).not.toEqual('-1');
    this.page.locator(projectLocatorString).click();
  }
}
