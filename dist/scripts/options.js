document.addEventListener('DOMContentLoaded', restoreBudget);

// Firefox has no sync yet.
// Cue: https://bugzilla.mozilla.org/show_bug.cgi?id=1220494
var chromeStorage = chrome.storage.sync || chrome.storage.local;

var defaultBudget = {
  "timer_kill"  : 15, // 15 minutes - timer for kill tab
};

function restoreBudget() {
  var form = document.querySelector('form');
  var reset = document.querySelector('#reset');

  form.addEventListener('submit', saveBudget);
  reset.addEventListener('click', resetBudget);

  chromeStorage.get(defaultBudget, function(data) {
    form.timer_kill.value  = data.timer_kill;
  });
}

function saveBudget(e) {
  e.preventDefault();

  var budget = {
    timer_kill  : parseInt(e.target.timer_kill.value, 10),
  };

  budget.total = budget.timer_kill;

  chromeStorage.set(budget, function() {
    var status = document.querySelector('.status');
    status.style.display = 'inline-block';

    setTimeout(function() {
      status.style.display = 'none';
    }, 750);
  });
}

function resetBudget() {
  var form = document.querySelector('form');

  form.timer_kill.value  = defaultBudget.timer_kill;
}
