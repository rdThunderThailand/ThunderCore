import {
  AssetOverviewStats,
  AuditProgress,
  CategoryBreakdown,
  PendingAction,
  RecentAsset,
  AssetRegistryStats,
  AssetRegistryItem
} from "@/features/tenant-assets/officer.procurement.service";

export interface ProcurementDocument {
  id: string;
  docNo: string;
  date: string;
  title: string;
  vendor: string;
  itemCount: number;
  totalValue: number;
  status: 'draft' | 'pending' | 'approved';
}

export interface ProcurementAsset {
  purchase_date?: string | null;
  created_at?: string;
  vendor_name?: string | null;
  status?: string;
  registry_status?: string;
  lifecycle_status?: string;
  metadata?: {
    purchase_date?: string;
    vendor?: string;
    vendor_name?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}


export interface TransferDocument {
  id: string;
  docNo: string;
  date: string;
  title: string;
  department: string;
  itemCount: number;
  totalValue: number;
  status: "draft" | "pending" | "approved";
  type: "transfer" | "dispose";
}

export interface TransferSummaryPanelProps {
  operationType: 'transfer' | 'dispose';
  items?: TransferItem[];
}

export interface TransferStepperProps {
  activeStep: number;
}

export interface TransferReviewSummaryProps {
  operationType: 'transfer' | 'dispose';
  items: TransferItem[];
}

export interface TransferReviewContentProps {
  items: TransferItem[];
  operationType: 'transfer' | 'dispose';
  onBack: () => void;
}

export interface TransferItem {
  id: string;
  assetNo: string;
  name: string;
  imageUrl?: string;
  description?: string;
  unit: string;
  qty: number;
  unitPrice: number;
  remainingValue: number;
  condition: 'ดี' | 'ชำรุด / ใช้งานไม่ได้' | 'เสื่อมสภาพ' | 'ชำรุด';
  selected: boolean;
}

export interface TransferItemTableProps {
  items: TransferItem[];
  setItems: React.Dispatch<React.SetStateAction<TransferItem[]>>;
  operationType: 'transfer' | 'dispose';
}

export interface TransferItemRowProps {
  item: TransferItem;
  index: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onUpdateCondition: (id: string, condition: TransferItem['condition']) => void;
  onUpdateUnit: (id: string, unit: string) => void;
  onDelete: (id: string) => void;
}

export interface TransferFormInfoProps {
  operationType: 'transfer' | 'dispose';
  setOperationType: (type: 'transfer' | 'dispose') => void;
  hasItems: boolean;
}

export interface DocumentSlotConfig {
  id: string;
  type: string;
  required: boolean;
}

export interface UploadedFile {
  slotId: string;
  name: string;
  mimeType: string;
  size: number;
  date: string;
  uploadedBy: string;
}

export interface TransferDocumentUploadProps {
  operationType: 'transfer' | 'dispose';
}

export interface RegistryClientProps {
  initialStats: AssetRegistryStats;
  initialList: AssetRegistryItem[];
  totalItems?: number;
  initialPage?: number;
  initialPageSize?: number;
}

export interface RegistryViewDrawerProps {
  asset: AssetRegistryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface RegistryDataTableProps {
  data: AssetRegistryItem[];
  totalItems?: number;
  initialPage?: number;
  initialPageSize?: number;
  onView: (asset: AssetRegistryItem) => void;
}

export interface OfficerDashboardClientProps {
  overviewStats: AssetOverviewStats;
  pendingActions: PendingAction[];
  categoryBreakdown: CategoryBreakdown[];
  auditProgress: AuditProgress;
  recentAssets: RecentAsset[];
}

export interface ProcurementItem {
  id: string;
  no: number;
  tempId: string;
  name: string;
  description: string;
  specs?: string;
  unit: string;
  qty: number;
  unitPrice: number;
  imageUrl?: string;
  category?: string;
  subCategory?: string;
  procurementMethod?: string;
  poNo?: string;
  poDate?: string;
  vendor?: string;
  fiscalYear?: string;
  plan?: string;
  task?: string;
  expenseCategory?: string;
  department?: string;
  location?: string;
  primaryUser?: string;
}

export interface ProcurementSummaryPanelProps {
  items: ProcurementItem[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  includeVat: boolean;
  setIncludeVat: (val: boolean) => void;
  isStep3?: boolean;
}

export interface ProcurementStepperProps {
  activeStep: number;
}

export interface ProcurementReviewSummaryProps {
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
}

export interface ProcurementReviewContentProps {
  items: ProcurementItem[];
  subtotal: number;
  onBack: () => void;
}

export interface ProcurementPlanItem {
  id: string;
  tempId: string;
  name: string;
  description: string;
  planName: string;
  plannedQty: number;
  receivedQty: number;
  unit: string;
  unitPrice: number;
  category?: string;
  imageUrl?: string;
}

export interface ProcurementPlanSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: ProcurementItem[]) => void;
}

export interface ProcurementItemTableProps {
  items: ProcurementItem[];
  onUpdateItem: (id: string, field: keyof ProcurementItem, value: any) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onOpenImportModal: () => void;
  onOpenPlanModal: () => void;
  subtotal: number;
}

export interface ProcurementItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ProcurementItem) => void;
  initialItem?: ProcurementItem;
  // Global defaults passed from Step 1
  defaultBudgetYear?: string;
  defaultPlan?: string;
  defaultTask?: string;
  defaultExpenseCat?: string;
  defaultDepartment?: string;
  defaultLocation?: string;
  defaultProcurementMethod?: string;
  defaultPoNo?: string;
  defaultPoDate?: string;
  defaultVendor?: string;
}

export interface ProcurementFormInfoProps {
  grandTotal: number;
}

export interface MappedImportItem {
  id: string;
  assetId?: string;
  name: string;
  brandModel?: string;
  unit: string;
  qty: number;
  unitPrice?: number;
  totalValue?: number;
  remark?: string;
  location?: string;
  status: 'success' | 'error' | 'warning';
  errorMessage?: string;
}

export interface ProcurementExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (items: MappedImportItem[]) => void;
}

export interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  docType: string;
  uploadedBy: string;
}