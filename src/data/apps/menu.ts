import { markRaw } from 'vue'

// Import dashboard components
import RawMaterialReport from '/@src/components/pages/report/RawMaterialReport.vue'
import WIPPositionReport from '/@src/components/pages/report/WIPPositionReport.vue'
import EntryProductReport from '/@src/components/pages/report/EntryProductReport.vue'
import ExpendituresReport from '/@src/components/pages/report/ExpendituresReport.vue'
import FinishedProductReport from '/@src/components/pages/report/FinishedProductReport.vue'
import MachineAndToolReport from '/@src/components/pages/report/MachineAndToolReport.vue'
import RejectScrapProductReport from '/@src/components/pages/report/RejectScrapProductReport.vue'
import MaterialBox from '/@src/components/pages/AuxiliaryMaterial/MaterialBox.vue'
import MaterialInk from '/@src/components/pages/AuxiliaryMaterial/MaterialInk.vue'
import MaterialGaiso from '/@src/components/pages/AuxiliaryMaterial/MaterialGaiso.vue'
import MasterDataProduct from '/@src/components/pages/MasterData/MasterDataProduct.vue'
import MasterDataUser from '/@src/components/pages/MasterData/MasterDataUser.vue'
import TransactionLogReport from '/@src/components/pages/report/TransactionLogReport.vue'
import SyncDatabase from '/@src/components/pages/SyncDatabase.vue'

export interface MenuItem {
  label: string
  icon: string
  path: string
  component?: any
  description?: string
  bgColor: string
  groupMenu?: string
}

export const availableMenus: MenuItem[] = [

  /** Data Master */
  // user
  {
    label: 'Data User',
    icon: 'lnil lnil-users',
    path: '/data-master/user',
    component: markRaw(MasterDataUser),
    description: 'Manage user accounts and permissions',
    bgColor: 'bg-blue-500',
    groupMenu: 'Data Master'
  },
  // Data Product
  {
    label: 'Data Barang',
    icon: 'lnil lnil-package',
    path: '/data-master/product',
    component: markRaw(MasterDataProduct),
    description: 'Manage product information and inventory',
    bgColor: 'bg-green-500',
    groupMenu: 'Data Master'
  },

  /** Report */
  {
    label: 'Pemasukan Barang',
    icon: 'lnil lnil-user',
    path: '/report/pemasukan-barang',
    component: markRaw(EntryProductReport),
    description: 'Monitor entry of goods and inventory',
    bgColor: 'bg-blue-500',
    groupMenu: 'Report'
  },
  {
    label: 'Pengeluaran Barang',
    icon: 'lnil lnil-suitcase',
    path: '/report/expenditures',
    component: markRaw(ExpendituresReport),
    description: 'Monitoring Expenditures of goods and inventory',
    bgColor: 'bg-green-500',
    groupMenu: 'Report'
  },
  {
    label: 'Posisi WIP',
    icon: 'lnil lnil-dropbox',
    path: '/report/posisi-wip',
    component: markRaw(WIPPositionReport),
    description: 'Monitoring Work In Progress (WIP)',
    bgColor: 'bg-purple-500',
    groupMenu: 'Report'
  },
  {
    label: 'Bahan Baku',
    icon: 'lnil lnil-medicine',
    path: '/report/bahan-baku',
    component: markRaw(RawMaterialReport),
    description: 'Monitor raw material usage and inventory',
    bgColor: 'bg-orange-500',
    groupMenu: 'Report'
  },
  {
    label: 'Barang jadi',
    icon: 'lnil lnil-hospital-location',
    path: '/report/barang-jadi',
    component: markRaw(FinishedProductReport),
    description: 'Monitor finished goods inventory',
    bgColor: 'bg-red-500',
    groupMenu: 'Report'
  },
  {
    label: 'Mesin dan Peralatan',
    icon: 'lnil lnil-hospital-location',
    path: '/report/machine-tool',
    component: markRaw(MachineAndToolReport),
    description: 'Monitor machine and tool inventory',
    bgColor: 'bg-red-500',
    groupMenu: 'Report'
  },
  {
    label: 'Barang Reject dan Scrap',
    icon: 'lnil lnil-hospital-location',
    path: '/report/reject-scrap-product',
    component: markRaw(RejectScrapProductReport),
    description: 'Monitor reject and scrap product inventory',
    bgColor: 'bg-red-500',
    groupMenu: 'Report'
  },

  /** Auxiliary Materials */
  // box
  {
    label: 'Box',
    icon: 'lnil lnil-dropbox',
    path: '/auxiliary-materials/box',
    component: markRaw(MaterialBox),
    description: 'Manage box information and inventory',
    bgColor: 'bg-yellow-500',
    groupMenu: 'Auxiliary Materials'
  },
  // ink
  {
    label: 'Ink',
    icon: 'lnil lnil-paint-roller-alt',
    path: '/auxiliary-materials/ink',
    component: markRaw(MaterialInk),
    description: 'Manage ink information and inventory',
    bgColor: 'bg-blue-500',
    groupMenu: 'Auxiliary Materials'
  },
  // gaiso
  {
    label: 'Gaiso',
    icon: 'lnil lnil-ticket-alt',
    path: '/auxiliary-materials/gaiso',
    component: markRaw(MaterialGaiso),
    description: 'Manage gaiso information and inventory',
    bgColor: 'bg-purple-500',
    groupMenu: 'Auxiliary Materials'
  },
  // gaiso
  {
    label: 'User Log Transaction',
    icon: 'lnil lnil-ticket-alt',
    path: '/user-log-transaction',
    component: markRaw(TransactionLogReport),
    description: 'Manage user log transaction information and inventory',
    bgColor: 'bg-purple-500',
    groupMenu: 'User Log'
  },
  {
    label: 'Sync Database',
    icon: 'lnil lnil-ticket-alt',
    path: '/sync-database',
    component: markRaw(SyncDatabase),
    description: 'Manage sync database information and inventory',
    bgColor: 'bg-purple-500',
    groupMenu: 'User Log'
  }
]