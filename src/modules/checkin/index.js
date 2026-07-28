import { DataStore } from '../../data/store';
import { today } from '../../utils/date';

class CheckinModule {
  constructor() {
    this.achievements = [
      { id: 'first', name: '初次打卡', icon: '🌟', required: 1 },
      { id: 'week', name: '连续7天', icon: '💪', required: 7 },
      { id: 'month', name: '连续30天', icon: '🏆', required: 30 },
      { id: 'season', name: '连续90天', icon: '👑', required: 90 }
    ];
  }

  init(config) {
    this.config = config;
    this.render();
    this.bindEvents();
  }

  render() {
    const page = document.getElementById('page-checkin');
    if (!page) return;

    const checkin = DataStore.checkin.get();
    const streak = DataStore.checkin.getStreak();
    const checkedToday = checkin.history.includes(today());

    page.innerHTML = `
      <div class="page-header">
        <button class="btn-back" onclick="App.switchTab('home')">←</button>
        <h1>✅ 每日打卡</h1>
      </div>
      <div class="page-content">
        <div class="checkin-main">
          <div class="streak-display">
            <div class="streak-number">${streak}</div>
            <div class="streak-label">连续打卡天数</div>
          </div>
          <button class="btn btn-primary btn-large ${checkedToday ? 'disabled' : ''}" id="btnCheckin">
            ${checkedToday ? '✓ 今日已打卡' : '📝 立即打卡'}
          </button>
        </div>
        <div class="section-card">
          <h3>打卡成就</h3>
          <div class="achievements-grid">
            ${this.achievements.map(a => {
              const unlocked = streak >= a.required;
              return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                  <div class="achievement-icon">${unlocked ? a.icon : '🔒'}</div>
                  <div class="achievement-name">${a.name}</div>
                  <div class="achievement-progress">
                    ${Math.min(streak, a.required)}/${a.required}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="section-card">
          <h3>本月打卡日历</h3>
          <div class="calendar-grid">
            ${this.renderCalendar()}
          </div>
        </div>
        <div class="section-card">
          <h3>打卡记录</h3>
          <div class="checkin-stats">
            <div class="stat-row">
              <span>总打卡次数</span>
              <span>${checkin.history.length}</span>
            </div>
            <div class="stat-row">
              <span>最长连续天数</span>
              <span>${this.getLongestStreak()}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-empty"></div>';
    }

    const checkin = DataStore.checkin.get();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const checked = checkin.history.includes(date);
      const isToday = date === today();
      html += `
        <div class="calendar-day ${checked ? 'checked' : ''} ${isToday ? 'today' : ''}">
          ${day}
        </div>
      `;
    }

    return html;
  }

  getLongestStreak() {
    const history = DataStore.checkin.get().history;
    if (history.length === 0) return 0;

    const sorted = [...history].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }

  bindEvents() {
    const self = this;

    document.getElementById('btnCheckin')?.addEventListener('click', function() {
      if (this.classList.contains('disabled')) return;
      
      DataStore.checkin.addToday();
      self.render();
      self.bindEvents();
    });
  }
}

export default CheckinModule;