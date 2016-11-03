import JSXComponent from 'metal-jsx';
import Loader from './loader';
import Result from './result';
import Failure from './failure';
import defaultBudget from '../data/budget';

class App extends JSXComponent {
  attached() {
  }

  updateBadgeText() {
    var displayOption = localStorage["badgeDisplayOption"];

    if ( typeof displayOption == "undefined" || displayOption == "allWindows") {
      chrome.browserAction.setBadgeText({text: String(allWindowsTabCount)});
      this.updateBadgeTitle(allWindowsTabCount);
    } else {
      count = getCurrentWindowTabs(updateCurrentWindowBadge);
    }
  }

  updateBadgeTitle(count) {
    iconTitle = `You have ${count} open tab(s).`;
    chrome.browserAction.setTitle({ title: iconTitle });
  }

  render() {
    return(
      <Result url={this.url} success={this.success} budget={this.budget} />
    );
  }
}

App.STATE = {
  url: {},
  budget: {},
  error: {},
  success: {}
};

export default App;
