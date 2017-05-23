import { RgraphqlDemoPage } from './app.po';

describe('rgraphql-demo App', () => {
  let page: RgraphqlDemoPage;

  beforeEach(() => {
    page = new RgraphqlDemoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
