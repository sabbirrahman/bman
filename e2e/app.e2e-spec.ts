import { Bman2Page } from './app.po';

describe('bman2 App', function() {
  let page: Bman2Page;

  beforeEach(() => {
    page = new Bman2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
