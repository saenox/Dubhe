import { useLocationType } from '@lexikos/doraemon-business';
import { Http } from '@lexikos/doraemon-network';
import { message } from 'ant-design-vue';
import { ref } from 'vue';
import type {
  IApprovalConfig,
  IApprovalMethodSettings,
  IApproverConfigItem,
  ISubject,
  ITableParams,
  IUser,
} from './constants';

interface FormState {
  id: string | undefined;
  sectionCode: string;
  gradeCodes: string[];
  subjectIds: string[] | undefined;
  approverIds: string[] | undefined;
}

const useApprovalSetting = () => {
  const locationType = useLocationType();

  const loading = ref<boolean>(false);

  const modalOpen = ref<boolean>(false);

  const approvalConfig = ref<IApprovalConfig>({ configKey: '', configValue: '', id: '' });

  const approvalMethodSettings = ref<IApprovalMethodSettings>();

  const approvalMethod = ref<string>('1');

  const searchGradeOptions = ref([{ label: '所有年级', value: '' }]);

  const searchParams = ref<ITableParams>({
    sectionCode: '',
    gradeCode: '',
    subjectId: '',
    approverId: '',
    pageNum: 1,
    pageSize: 15,
  });

  const sectionTypes = ref<{ value: any; label: string }[]>([]);

  const schoolGrades = ref<{ value: any; label: string; sectionType: any }[]>([]);

  const subjectList = ref<ISubject[]>([]);

  const userListForSearch = ref<IUser[]>([]);

  const userListForForm = ref<IUser[]>([]);

  const formSectionTypes = ref<{ value: any; label: string }[]>([]);

  const formSubjectList = ref<ISubject[]>([]);

  const formState = ref<FormState>({
    id: undefined,
    sectionCode: '',
    gradeCodes: [],
    subjectIds: [],
    approverIds: [],
  });

  const formGradeOptions = ref<any>([]);

  const approverConfigList = ref<IApproverConfigItem[]>([]);

  const approverConfigListTotal = ref(0);

  const columns = ref([]);

  const data = ref([]);

  async function fetchSubject() {
    try {
      loading.value = true;
      const params = { scopeType: 0, sectionType: searchParams.value?.sectionCode };
      // let locationLevel = useLocationLevel();
      // if (locationLevel === 0) {
      //   params.scopeType = 0;
      // } else {
      //   params.scopeType = 1;
      // }
      const res = await Http.getInstance().get('/api/campusbase/subjects/actions/getSubjectListByCondition', params);
      console.log('fetchSubject res: ', res);
      subjectList.value = res || [];
      console.log('fetchSubject subjectList: ', subjectList.value);
      subjectList.value.unshift({ name: '所有学科', id: '' });
      const flag = subjectList.value.some((element) => element.id === searchParams.value.subjectId);
      if (!flag) {
        searchParams.value.subjectId = '';
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }

  async function fetchApproverConfigList() {
    try {
      loading.value = true;
      const res = await Http.getInstance().post('/api/eduRes/approverConfigs/actions/pageDetail', {
        ...searchParams.value,
      });
      console.log('fetchList res: ', res);
      const { result, total } = res || {};
      approverConfigList.value = result || [];
      approverConfigListTotal.value = total;
      console.log('fetchList approvers: ', approverConfigList.value);
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }

  async function fetchUserList() {
    try {
      loading.value = true;
      const res = await Http.getInstance().get('/api/auth/v1/userManagement/actions/listByCurrentLocationId');
      console.log('fetchUserList res: ', res);
      const data = res || [];
      userListForSearch.value = data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      userListForSearch.value.unshift({ value: '', label: '所有审核人员' });

      userListForForm.value = data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));

      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }

  async function fetchSubjectForForm() {
    try {
      loading.value = true;
      const params = { scopeType: 0, sectionType: formState.value?.sectionCode };
      // let locationLevel = useLocationLevel();
      // if (locationLevel === 0) {
      //   params.scopeType = 0;
      // } else {
      //   params.scopeType = 1;
      // }
      const res = await Http.getInstance().get('/api/campusbase/subjects/actions/getSubjectListByCondition', params);
      formSubjectList.value = res || [];
      formState.value.subjectIds = [];
      loading.value = false;
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }

  async function handleSearchSectionChanged() {
    console.log('handleSearchSectionChange...');
    searchGradeOptions.value = schoolGrades.value.filter(
      (section) => section.sectionType == searchParams.value.sectionCode,
    );
    searchGradeOptions.value.unshift({ value: '', label: '所有年级' });
    console.log('selectedSection changed, searchGradeOptions:', searchGradeOptions.value);
    const gradeValue = Number.parseInt(searchParams.value.gradeCode, 0) || 0;
    if (searchGradeOptions.value.length - 1 < gradeValue) {
      searchParams.value.gradeCode = '';
    }
    await fetchSubject();
    fetchApproverConfigList();
  }

  async function handleSearch() {
    searchParams.value.pageNum = 1;
    console.log('handleSearch changed: ', searchParams.value);
    fetchApproverConfigList();
  }

  async function handleFormSectionChanged() {
    console.log('handleFormSectionChanged...');
    formGradeOptions.value = schoolGrades.value.filter((section) => section.sectionType == formState.value.sectionCode);
    formState.value.gradeCodes = [];
    console.log('formSection changed', formGradeOptions.value.length);
    fetchSubjectForForm();
  }

  async function handleBatchAdd() {
    modalOpen.value = true;
    fetchUserList();
    if (formSectionTypes.value.length == 1) {
      formState.value.sectionCode = formSectionTypes.value[0].value;
      handleFormSectionChanged();
    }
  }

  async function cleanFormData() {
    formGradeOptions.value = [];
    formState.value = {
      id: undefined,
      sectionCode: '',
      gradeCodes: [],
      subjectIds: [],
      approverIds: [],
    };
  }

  return {
    modalOpen,
    locationType,
    approvalMethod,
    searchGradeOptions,
    searchParams,
    sectionTypes,
    schoolGrades,
    subjectList,
    userListForSearch,
    formState,
    formSectionTypes,
    formGradeOptions,
    formSubjectList,
    userListForForm,
    columns,
    data,
    fetchApproverConfigList,
    cleanFormData,
    handleSearchSectionChanged,
    handleFormSectionChanged,
    handleSearch,
    handleBatchAdd,
  };
};

export default useApprovalSetting;
