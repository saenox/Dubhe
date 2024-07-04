import type { Ref } from 'vue';

export const ContextKey = Symbol('ApprovalSetting') as unknown as string;

export interface Context {
  modalOpen: Ref<boolean>;
  locationType: Ref<string>;

  searchParams: Ref<any>;
  sectionTypes: Ref<any[]>;
  searchGradeOptions: Ref<any[]>;
  subjectList: Ref<any[]>;
  userListForSearch: Ref<any[]>;
  formState: Ref<any>;
  formSectionTypes: Ref<any[]>;
  formGradeOptions: Ref<any[]>;
  formSubjectList: Ref<any[]>;
  userListForForm: Ref<any[]>;

  columns: Ref<any[]>;
  data: Ref<any[]>;

  fetchApproverConfigList: () => Promise<void>;
  cleanFormData: () => Promise<void>;

  handleSearchSectionChanged: () => Promise<void>;
  handleFormSectionChanged: () => Promise<void>;
  handleSearch: () => Promise<void>;
  handleBatchAdd: () => Promise<void>;
}
