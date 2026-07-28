import { DataStore } from '../../data/store';
import { today, calcDaysBetween } from '../../utils/date';

class DashboardModule {
  constructor() {}

  init(config) {
    this.config = config;
    this.render();
    this.bindEvents();
  }

  render() {
    const page = document.getElementById('page-dashboard');
    if (!page) return;

    const stats = this.calculateStats();

    page.innerHTML = `
      <div class="page-header">
        <button class="btn-back" onclick="App.switchTab('home')">←</button>
        <h1>📊 数据统计</h1>
      </div>
      <div class="page-content">
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">💕</div>
            <div class="stat-value">${stats.daysTogether}</div>
            <div class="stat-label">在一起天数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-value">${stats.diaryCount}</div>
            <div class="stat-label">日记篇数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📸</div>
            <div class="stat-value">${stats.photoCount}</div>
            <div class="stat-label">照片数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">${stats.checkinStreak}</div>
            <div class="stat-label">连续打卡</div>
          </div>
        </div>
        <div class="section-card">
          <h3>心情分布</h3>
          <div class="mood-chart">
            ${stats.moodDistribution.map(m => `
              <div class="mood-bar-item">
                <span class="mood-bar-icon">${m.icon}</span>
                <div class="mood-bar">
                  <div class="mood-bar-fill" style="width: ${m.percentage}%"></div>
                </div>
                <span class="mood-bar-label">${m.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="section-card">
          <h3>本月打卡情况</h3>
          <div class="checkin-calendar">
            ${this.renderMiniCalendar()}
          </div>
        </div>
        <div class="section-card">
          <h3>成就进度</h3>
          <div class="achievements-progress">
            ${stats.achievements.map(a => `
              <div class="achievement-progress-item">
                <span class="achievement-icon">${a.icon}</span>
                <div class="achievement-info">
                  <span>${a.name}</span>
                  <div class="achievement-bar">
                    <div class="achievement-fill" style="width: ${a.progress}%"></div>
                  </div>
                </div>
                <span class="achievement-percent">${a.progress}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  calculateStats() {
    const couple = this.config.couple;
    const daysTogether = calcDaysBetween(couple.startDate);
    
    const diaries = DataStore.diary.get();
    const photos = DataStore.get('PHOTO') || [];
    const checkin = DataStore.checkin.get();
    const streak = DataStore.checkin.getStreak();
    const moods = DataStore.mood.get();

    const moodCounts = { happy: 0, love: 0, calm: 0, sad: 0, angry: 0 };
    moods.forEach(m => {
      if (moodCounts[m.mood] !== undefined) {
        moodCounts[m.mood]++;
      }
    });

    const moodDistribution = [
      { icon: '😊', count: moodCounts.happy, percentage: moods.length ? Math.round((moodCounts.happy / moods.length) * 100) : 0 },
      { icon: '🥰', count: moodCounts.love, percentage: moods.length ? Math.round((moodCounts.love / moods.length) * 100) : 0 },
      { icon: '😌', count: moodCounts.calm, percentage: moods.length ? Math.round((moodCounts.calm / moods.length) * 100) : 0 },
      { icon: '😢', count: moodCounts.sad, percentage: moods.length ? Math.round((moodCounts.sad / moods.length) * 100) : 0 },
      { icon: '😤', count: moodCounts.angry, percentage: moods.length ? Math.round((moodCounts.angry / moods.length) * 100) : 0 }
    ];

    const achievements = [
      { name: '连续打卡7天', icon: '🏆', progress: Math.min(100, (streak / 7) * 100) },
      { name: '连续打卡30天', icon: '👑', progress: Math.min(100, (streak / 30) * 100) },
      { name: '写满10篇日记', icon: '📝', progress: Math.min(100, (diaries.length / 10) * 100) },
      { name: '上传50张照片', icon: '📸', progress: Math.min(100, (photos.length / 50) * 100) }
    ];

    return {
      daysTogether,
      diaryCount: diaries.length,
      photoCount: photos.length,
      checkinStreak: streak,
      moodDistribution,
      achievements
    };
  }

  renderMiniCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let html = '<div class="calendar-header">日 一 二 三 四 五 六</div>';
    html += '<div class="calendar-days">';

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

    html += '</div>';
    return html;
  }

  bindEvents() {}
}

export default DashboardModule;