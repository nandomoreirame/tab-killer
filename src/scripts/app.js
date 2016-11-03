import JSXComponent from 'metal-jsx';
// import Loader from './loader';
// import Result from './result';
// import Failure from './failure';
// import defaultBudget from '../data/budget';

class App extends JSXComponent {
  attached() {
    this.getTabCount();
    this.getTablist();
  }

  getTabCount() {
    chrome.tabs.query({}, (tabs) => {
      this.setState({ tabCount: tabs.length });
    });
  }

  getTablist() {
    chrome.tabs.query({}, (tabs) => {
      this.setState({
        tabList: tabs
      });
    });
  }

  openTab(tabID, windowID) {
    chrome.windows.update(windowID, { focused: true });
    chrome.tabs.update(tabID, { active: true });
  }

  closeTab(tabID) {
    chrome.tabs.remove(tabID);
    window.location.reload();
  }

  render() {
    const tabs = this.tabList;

    if (tabs) {
      return(
        <div class="tab-killer">
          <h4 class="tab-killer__title">
            <img src="../images/icon-48.png" alt="" />
            Number of tabs on this window: <strong>{this.tabCount}</strong>
          </h4>
          <ul class="tab-killer__list">
            {tabs.map((tab, i) => (
              <li key={i} class="tab-killer__list-item">
                <a class="tab-killer__link" href="#" onClick={() => this.openTab(tab.id, tab.windowId)}>
                  {tab.favIconUrl && <img src={tab.favIconUrl} alt="" class="tab-killer__favicon" />}
                  <span>{tab.title}</span>
                </a>
                <button class="tab-killer__close" onClick={() => this.closeTab(tab.id)}>&times;</button>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
}

App.STATE = {
  tabCount: null,
  tabList: []
};

export default App;
