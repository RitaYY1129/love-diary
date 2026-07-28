import { DataStore } from '../../data/store';
import { today } from '../../utils/date';

class MoodModule {
  constructor() {
    this.moods = [
      { key: 'happy', icon: '😊', label: '超开心' },
      { key: 'love', icon: '🥰', label: '恋爱中' },
      { key: 'calm', icon: '😌', label: '平静' },
      { key: 'sad', icon: '😢', label: '难过' },
      { key: 'angry', icon: '😤', label: '生气' }
    ];
  }

  init(config) {
    this.config = config;
    this.render();
    this.bindEvents();
  }

  render() {
    const page = document.getElementById('page-mood');
    if (!page) return;

    const todayMood = DataStore.mood.getToday();
    const recentMoods = DataStore.mood.get().slice(-14).reverse();

    page.innerHTML = `
      <div class="page-header">
        <button class="btn-back" onclick="App.switchTab('home')">←</button>
        <h1>😊 心情记录</h1>
      </div>
      <div class="page-content">
        <div class="section-card">
          <h3>今天的心情</h3>
          <div class="mood-grid">
            ${this.moods.map(m => `
              <button class="mood-card ${todayMood?.mood === m.key ? 'active' : ''}" data-mood="${m.key}">
                <div class="mood-emoji">${m.icon}</div>
                <span>${m.label}</span>
              </button>
            `).join('')}
          </div>
          ${todayMood ? `
            <div class="mood-note">
              <input type="text" class="form-input" id="moodNote" placeholder="记录心情..." value="${todayMood.note || ''}">
              <button class="btn btn-primary btn-sm" id="saveMoodNote">保存</button>
            </div>
          ` : ''}
        </div>
        <div class="section-card">
          <h3>最近两周心情</h3>
          <div class="mood-calendar">
            ${recentMoods.map((m, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (13 - i));
              return `
                <div class="mood-day">
                  <div class="day-label">${date.getMonth() + 1}/${date.getDate()}</div>
                  <div class="day-mood">${m?.icon || '📭'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="section-card">
          <h3>心情统计</h3>
          <div class="mood-stats">
            ${this.getStats().map(s => `
              <div class="stat-item">
                <span class="stat-icon">${s.icon}</span>
                <span class="stat-label">${s.label}</span>
                <span class="stat-value">${s.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getStats() {
    const moods = DataStore.mood.get();
    const stats = {};
    this.moods.forEach(m => stats[m.key] = 0);
    
    moods.forEach(m => {
      if (stats[m.mood] !== undefined) {
        stats[m.mood]++;
      }
    });

    return this.moods.map(m => ({
      icon: m.icon,
      label: m.label,
      value: stats[m.key] || 0
    }));
  }

  bindEvents() {
    const self = this;

    document.querySelectorAll('.mood-card').forEach(card => {
      card.addEventListener('click', function() {
        const mood = this.getAttribute('data-mood');
        const todayMood = DataStore.mood.getToday();
        
        if (todayMood) {
          const moods = DataStore.mood.get();
          const index = moods.findIndex(m => m.date === today());
          if (index !== -1) {
            moods[index].mood = mood;
            DataStore.mood.set(moods);
          }
        } else {
          DataStore.mood.add({ date: today(), mood });
        }
        
        self.render();
        self.bindEvents();
      });
    });

    document.getElementById('saveMoodNote')?.addEventListener('click', function() {
      const note = document.getElementById('moodNote').value;
      const moods = DataStore.mood.get();
      const index = moods.findIndex(m => m.date === today());
      if (index !== -1) {
        moods[index].note = note;
        DataStore.mood.set(moods);
        alert('保存成功');
      }
    });
  }
}

export default MoodModule;