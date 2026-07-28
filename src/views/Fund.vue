<template>
  <div class="fund-container">
    <div class="fund-header">
      <div class="header-left" @click="goBack">
        <span class="back-icon">←</span>
      </div>
      <div class="header-center">
        <h1 class="page-title">恋爱基金</h1>
      </div>
      <div class="header-right"></div>
    </div>

    <div class="fund-content">
      <div class="total-card">
        <div class="total-bg"></div>
        <div class="total-content">
          <div class="total-label">共同基金余额</div>
          <div class="total-amount">
            <span class="currency">¥</span>
            <span class="amount">{{ formatMoney(totalAmount) }}</span>
          </div>
          <div class="total-info">
            <div class="info-item">
              <span class="info-label">我的贡献</span>
              <span class="info-value">¥{{ formatMoney(myContribution) }}</span>
            </div>
            <div class="info-divider"></div>
            <div class="info-item">
              <span class="info-label">TA的贡献</span>
              <span class="info-value">¥{{ formatMoney(partnerContribution) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-card">
        <button @click="openAddModal" class="add-btn">
          <span class="add-icon">➕</span>
          <span class="add-text">添加资金</span>
        </button>
        <button @click="openWithdrawModal" class="withdraw-btn">
          <span class="withdraw-icon">➖</span>
          <span class="withdraw-text">提取资金</span>
        </button>
      </div>

      <div class="goal-card">
        <div class="goal-header">
          <h2 class="goal-title">💰 存钱目标</h2>
          <button @click="openGoalModal" class="goal-add-btn">+ 添加</button>
        </div>
        <div v-if="currentGoal" class="goal-progress">
          <div class="goal-info">
            <div class="goal-name">{{ currentGoal.name }}</div>
            <div class="goal-target">目标: ¥{{ formatMoney(currentGoal.target) }}</div>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <div class="progress-info">
            <span class="progress-current">¥{{ formatMoney(totalAmount) }}</span>
            <span class="progress-percent">{{ progressPercent }}%</span>
          </div>
        </div>
        <div v-else class="goal-empty">
          <span class="empty-icon">🎯</span>
          <span class="empty-text">还没有设置存钱目标</span>
        </div>
      </div>

      <div class="history-card">
        <div class="history-header">
          <h2 class="history-title">📋 交易记录</h2>
        </div>
        <div v-if="transactions.length > 0" class="transaction-list">
          <div 
            v-for="(transaction, index) in transactions" 
            :key="index"
            class="transaction-item"
          >
            <div class="transaction-icon" :class="transaction.type">
              <span>{{ transaction.type === 'add' ? '💵' : '💳' }}</span>
            </div>
            <div class="transaction-info">
              <div class="transaction-desc">{{ transaction.description }}</div>
              <div class="transaction-date">{{ transaction.date }}</div>
            </div>
            <div class="transaction-amount" :class="transaction.type">
              {{ transaction.type === 'add' ? '+' : '-' }}¥{{ formatMoney(transaction.amount) }}
            </div>
          </div>
        </div>
        <div v-else class="history-empty">
          <span class="empty-icon">📝</span>
          <span class="empty-text">还没有交易记录</span>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">添加资金</h3>
        <div class="amount-input-group">
          <span class="input-currency">¥</span>
          <input 
            v-model="addAmount" 
            type="number" 
            class="amount-input" 
            placeholder="输入金额"
          />
        </div>
        <div class="quick-amounts">
          <button 
            v-for="amount in quickAmounts" 
            :key="amount"
            @click="addAmount = amount"
            class="quick-btn"
          >
            ¥{{ amount }}
          </button>
        </div>
        <textarea 
          v-model="addNote" 
          class="note-input" 
          placeholder="添加备注（可选）"
        ></textarea>
        <button @click="submitAdd" class="submit-btn add-submit">确认添加</button>
      </div>
    </div>

    <div v-if="showWithdrawModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">提取资金</h3>
        <div class="amount-input-group">
          <span class="input-currency">¥</span>
          <input 
            v-model="withdrawAmount" 
            type="number" 
            class="amount-input" 
            placeholder="输入金额"
            :max="totalAmount"
          />
        </div>
        <textarea 
          v-model="withdrawNote" 
          class="note-input" 
          placeholder="提取原因（可选）"
        ></textarea>
        <button @click="submitWithdraw" class="submit-btn withdraw-submit">确认提取</button>
      </div>
    </div>

    <div v-if="showGoalModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">设置存钱目标</h3>
        <input 
          v-model="goalName" 
          type="text" 
          class="goal-name-input" 
          placeholder="目标名称"
        />
        <div class="amount-input-group">
          <span class="input-currency">¥</span>
          <input 
            v-model="goalTarget" 
            type="number" 
            class="amount-input" 
            placeholder="目标金额"
          />
        </div>
        <button @click="submitGoal" class="submit-btn goal-submit">确认设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const totalAmount = ref(13140)
const myContribution = ref(7000)
const partnerContribution = ref(6140)

const currentGoal = ref({
  name: '蜜月旅行',
  target: 50000
})

const transactions = ref([
  { id: 1, type: 'add', amount: 1000, description: '工资收入', date: '2024-01-20 10:30' },
  { id: 2, type: 'add', amount: 520, description: '红包', date: '2024-01-19 14:20' },
  { id: 3, type: 'withdraw', amount: 200, description: '买奶茶', date: '2024-01-18 18:00' },
  { id: 4, type: 'add', amount: 2000, description: '年终奖', date: '2024-01-15 09:00' },
  { id: 5, type: 'add', amount: 1314, description: '情人节礼物', date: '2024-01-14 20:00' },
])

const showAddModal = ref(false)
const showWithdrawModal = ref(false)
const showGoalModal = ref(false)

const addAmount = ref('')
const addNote = ref('')
const withdrawAmount = ref('')
const withdrawNote = ref('')
const goalName = ref('')
const goalTarget = ref('')

const quickAmounts = [520, 1314, 2000, 5000]

const progressPercent = computed(() => {
  if (!currentGoal.value) return 0
  return Math.min(Math.round((totalAmount.value / currentGoal.value.target) * 100), 100)
})

const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN')
}

const goBack = () => {
  router.push('/home')
}

const openAddModal = () => {
  showAddModal.value = true
}

const openWithdrawModal = () => {
  showWithdrawModal.value = true
}

const openGoalModal = () => {
  showGoalModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showWithdrawModal.value = false
  showGoalModal.value = false
  addAmount.value = ''
  addNote.value = ''
  withdrawAmount.value = ''
  withdrawNote.value = ''
  goalName.value = ''
  goalTarget.value = ''
}

const persistFund = () => {
  localStorage.setItem('loveDiary_fund', JSON.stringify({
    totalAmount: totalAmount.value,
    myContribution: myContribution.value,
    partnerContribution: partnerContribution.value,
    currentGoal: currentGoal.value,
    transactions: transactions.value
  }))
}

const submitAdd = () => {
  if (!addAmount.value || addAmount.value <= 0) return
  const amount = Number(addAmount.value)
  totalAmount.value += amount
  myContribution.value += amount
  transactions.value.unshift({
    id: Date.now(),
    type: 'add',
    amount: amount,
    description: addNote.value || '存入资金',
    date: new Date().toLocaleString('zh-CN')
  })
  persistFund()
  closeModal()
}

const submitWithdraw = () => {
  if (!withdrawAmount.value || withdrawAmount.value <= 0 || withdrawAmount.value > totalAmount.value) return
  const amount = Number(withdrawAmount.value)
  totalAmount.value -= amount
  transactions.value.unshift({
    id: Date.now(),
    type: 'withdraw',
    amount: amount,
    description: withdrawNote.value || '提取资金',
    date: new Date().toLocaleString('zh-CN')
  })
  persistFund()
  closeModal()
}

const submitGoal = () => {
  if (!goalName.value || !goalTarget.value || goalTarget.value <= 0) return
  currentGoal.value = {
    name: goalName.value,
    target: Number(goalTarget.value)
  }
  persistFund()
  closeModal()
}

onMounted(() => {
  const stored = localStorage.getItem('loveDiary_fund')
  if (!stored) return
  try {
    const data = JSON.parse(stored)
    totalAmount.value = Number(data.totalAmount) || 0
    myContribution.value = Number(data.myContribution) || 0
    partnerContribution.value = Number(data.partnerContribution) || 0
    currentGoal.value = data.currentGoal || null
    transactions.value = Array.isArray(data.transactions) ? data.transactions : []
  } catch {}
})
</script>

<style scoped>
.fund-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.fund-header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  padding-top: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 20px;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.fund-content {
  padding: 20px;
  padding-bottom: 30px;
}

.total-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 20px;
}

.total-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
}

.total-content {
  position: relative;
  padding: 30px 25px;
}

.total-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.total-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 25px;
}

.currency {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-right: 5px;
}

.amount {
  font-size: 48px;
  font-weight: bold;
  color: white;
}

.total-info {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 15px;
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 5px;
}

.info-value {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.info-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.action-card {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.add-btn, .withdraw-btn {
  flex: 1;
  border: none;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.add-btn {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.withdraw-btn {
  background: linear-gradient(135deg, #f5a623 0%, #f7b731 100%);
}

.add-btn:active, .withdraw-btn:active {
  transform: scale(0.98);
}

.add-icon, .withdraw-icon {
  font-size: 28px;
}

.add-text, .withdraw-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.goal-card, .history-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.goal-header, .history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.goal-title, .history-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.goal-add-btn {
  font-size: 13px;
  color: #ff6b9d;
  border: none;
  background: none;
}

.goal-progress {
  padding: 15px;
  background: #fff5f7;
  border-radius: 12px;
}

.goal-info {
  margin-bottom: 15px;
}

.goal-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.goal-target {
  font-size: 13px;
  color: #999;
}

.progress-bar {
  height: 8px;
  background: #ffeef2;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d 0%, #c44569 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
}

.progress-current {
  font-size: 14px;
  font-weight: 600;
  color: #ff6b9d;
}

.progress-percent {
  font-size: 14px;
  color: #999;
}

.goal-empty, .history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  gap: 10px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 45px;
  height: 45px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.transaction-icon.add {
  background: #f0fff4;
}

.transaction-icon.withdraw {
  background: #fff7e6;
}

.transaction-info {
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.transaction-date {
  font-size: 11px;
  color: #999;
}

.transaction-amount {
  font-size: 15px;
  font-weight: 600;
}

.transaction-amount.add {
  color: #67c23a;
}

.transaction-amount.withdraw {
  color: #f5a623;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 25px;
  width: 320px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.amount-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.input-currency {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b9d;
  margin-right: 10px;
}

.amount-input {
  flex: 1;
  height: 50px;
  font-size: 24px;
  font-weight: bold;
  border: none;
  border-bottom: 2px solid #eee;
  outline: none;
}

.quick-amounts {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.quick-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.quick-btn:active {
  background: #f5f5f5;
}

.note-input {
  width: 100%;
  height: 70px;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.goal-name-input {
  width: 100%;
  height: 45px;
  border: none;
  border-bottom: 2px solid #eee;
  font-size: 16px;
  outline: none;
  margin-bottom: 15px;
}

.submit-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
}

.add-submit {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.withdraw-submit {
  background: linear-gradient(135deg, #f5a623 0%, #f7b731 100%);
  color: white;
}

.goal-submit {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
}
</style>
