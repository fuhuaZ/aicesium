import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface AlertItem {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  time: string
  device: string
}

export const useAppStore = defineStore('app', () => {
  // --- Sidebar ---
  const sidebarCollapsed = ref(false)
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // --- Right Panel ---
  const rightPanelVisible = ref(false)
  const rightPanelType = ref<'info' | 'stats' | 'settings' | null>(null)

  function openRightPanel(type: 'info' | 'stats' | 'settings') {
    rightPanelType.value = type
    rightPanelVisible.value = true
  }
  function closeRightPanel() {
    rightPanelVisible.value = false
    rightPanelType.value = null
  }

  // --- Alerts ---
  const alerts = ref<AlertItem[]>([
    {
      id: '1',
      type: 'error',
      message: 'A栋3层烟雾传感器触发',
      time: '10:23:45',
      device: 'SMOKE-A3-001',
    },
    {
      id: '2',
      type: 'warning',
      message: 'B栋中央空调能耗超标',
      time: '10:20:12',
      device: 'HVAC-B-003',
    },
    {
      id: '3',
      type: 'info',
      message: '南门停车场车位已满',
      time: '10:15:00',
      device: 'PARK-S-001',
    },
  ])

  function addAlert(alert: AlertItem) {
    alerts.value.unshift(alert)
    if (alerts.value.length > 50) {
      alerts.value.pop()
    }
  }
  function clearAlert(id: string) {
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  const unreadAlertCount = computed(() => alerts.value.length)

  // --- Active Module ---
  const activeModule = ref('dashboard')
  function setActiveModule(module: string) {
    activeModule.value = module
  }

  return {
    sidebarCollapsed,
    toggleSidebar,
    rightPanelVisible,
    rightPanelType,
    openRightPanel,
    closeRightPanel,
    alerts,
    addAlert,
    clearAlert,
    unreadAlertCount,
    activeModule,
    setActiveModule,
  }
})
