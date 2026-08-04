export interface ApprovableModule {
  key: string;
  label: string;
}

export interface ApproverOption {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface ApprovalSetting {
  moduleName: string;
  approverIds: number[];
  approvers: ApproverOption[];
}