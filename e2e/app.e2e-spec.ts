import { BmanPage } from './app.po';

describe('bman App', () => {
  let page: BmanPage;

  beforeEach(() => {
    page = new BmanPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
