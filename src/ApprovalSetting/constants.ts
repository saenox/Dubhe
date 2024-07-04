export interface IApproverConfigItem {
  id: string;
  sectionId: string;
  sectionName: string;
  gradeId: string;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  approvers: string;
}

export interface ISectionType {
  id: string;
  locationId: string;
  sectionName: string;
  sectionType: number | string;
}

export interface ISubject {
  id: string;
  name: string;
}

export interface IUser {
  id: string;
  name: string;
}

export interface IApprover {
  id: string;
  name: string;
}

export interface IApprovalConfig {
  id: string;
  configKey: string;
  configValue: string;
}

export interface IApprovalMethodSettings {
  id: string;
  ApprovalMethod: string;
}

export interface IVisitorAccessRightsSettings {
  id: string;
  VisitorAccessRights: IVisitorAccessRights;
}

export interface IVisitorAccessRights {
  viewEnable: boolean;
  downloadEnable: boolean;
}

export interface IFriendlyUnitForBureauItem {
  locationId: string;
  locationName: string;
  pairedUnitCount: number;
  pairedUnitNames: string;
}

export interface IFriendlyUnitItem {
  id: string;
  friendLocationId: string;
  friendLocationName: string;
  unitProperties: string;
  permissions: string;
  permissionLabels: string;
  createTime: number;
}

export interface IAccessibleUnitItem {
  id: string;
  resLocationId: string;
  resLocationName: string;
  unitProperties: string;
  permissions: string;
  permissionLabels: string;
  createTime: number;
}

export interface ILocationItem {
  id: string;
  name: string;
}

interface ISearchParams {
  sectionCode: string | '';
  gradeCode: string | '';
  subjectId: string | '';
  approverId: string | '';
}

export type ITableParams = ISearchParams & { pageNum: number; pageSize: number };

export const pageSizeOptions = ['10', '15', '20', '50', '100'];
