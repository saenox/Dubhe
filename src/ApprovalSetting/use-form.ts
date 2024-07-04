import { Http } from '@lexikos/doraemon-network';
import { filter, map } from 'lodash';
import { computed, reactive, ref } from 'vue';

const DefaultSectionOption = {
  value: '',
  label: '所有学段',
};

const DefaultSectionOptions = [
  { label: '小学', value: '1' },
  { label: '初中', value: '2' },
  { label: '高中', value: '3' },
];

const DefaultGrade = {
  value: '',
  label: '所有年级',
  sectionType: undefined,
};

const DefaultGrades = [
  { label: '小班', value: '1', sectionType: '0' },
  { label: '中班', value: '2', sectionType: '0' },
  { label: '大班', value: '3', sectionType: '0' },
  { label: '一年级', value: '1', sectionType: '1' },
  { label: '二年级', value: '2', sectionType: '1' },
  { label: '三年级', value: '3', sectionType: '1' },
  { label: '四年级', value: '4', sectionType: '1' },
  { label: '五年级', value: '5', sectionType: '1' },
  { label: '六年级', value: '6', sectionType: '1' },
  { label: '一年级', value: '1', sectionType: '2' },
  { label: '二年级', value: '2', sectionType: '2' },
  { label: '三年级', value: '3', sectionType: '2' },
  { label: '一年级', value: '1', sectionType: '3' },
  { label: '二年级', value: '2', sectionType: '3' },
  { label: '三年级', value: '3', sectionType: '3' },
];

const DefaultSubject = { label: '所有学科', value: '' };

const DefaultApprover = { value: '', label: '所有审核人员' };

const useForm = (params: { needDefault: boolean }) => {
  const sectionOptions = ref<{ label: string; value: string }[]>([]);

  const grades = ref<{ label: string; value: string; sectionType: string }[]>([]);

  const subjectOptions = ref<{ label: string; value: string }[]>([]);

  const approverOptions = ref<{ label: string; value: string }[]>();

  const formState = reactive({
    sectionType: '',
  });

  const gradeOptions = computed(() => {
    if (formState.sectionType === DefaultSectionOption.value) {
      return [DefaultGrade];
    }

    const options = filter(grades.value, (item) => item.sectionType === formState.sectionType);

    if (options.length === 0) {
      return [DefaultGrade];
    }

    if (options.length === 1) {
      return options;
    }

    return [DefaultGrade, ...options];
  });

  async function getSectionTypeOptions() {
    return Http.getInstance()
      .get('/api/campusbase/v1/frontend/schoolsection/actions/getSectionTypeByLocationId')
      .then((res: { sectionType: string; sectionName: string }[]) => {
        const data = map(res || [], (item) => ({
          value: item.sectionType,
          label: item.sectionName,
        }));

        if (!params.needDefault) {
          sectionOptions.value = data;
          return;
        }

        if (data.length === 0) {
          sectionOptions.value = [DefaultSectionOption, ...DefaultSectionOptions];
          return;
        }

        sectionOptions.value = [DefaultSectionOption, ...data];
        return;
      });
  }

  async function getGrades() {
    return Http.getInstance()
      .get('/api/campusbase/v1/frontend/grades/actions/listByLocationId?locationId=')
      .then((res: { currentLevel: string; name: string; sectionType: string }[]) => {
        const data = map(res || [], (item) => ({
          value: item.currentLevel,
          label: item.name,
          sectionType: item.sectionType,
        }));

        if (!params.needDefault) {
          grades.value = data;
          return;
        }

        if (data.length === 0) {
          grades.value = [...DefaultGrades];
          return;
        }

        grades.value = [DefaultGrade as any, ...data];
      });
  }

  async function getSubjects() {
    return Http.getInstance()
      .get('/api/campusbase/subjects/actions/getSubjectListByCondition', {
        scopeType: 0,
        sectionType: formState.sectionType,
      })
      .then((res: { id: string; name: string }[]) => {
        const data = map(res || [], (item) => ({
          label: item.name,
          value: item.id,
        }));

        if (!params.needDefault) {
          subjectOptions.value = data;
          return;
        }

        subjectOptions.value = [DefaultSubject, ...data];
      });
  }

  async function getApprovers() {
    return Http.getInstance()
      .get('/api/auth/v1/userManagement/actions/listByCurrentLocationId')
      .then((res: { id: string; name: string }[]) => {
        const data = map(res || [], (item) => ({
          label: item.name,
          value: item.id,
        }));

        if (!params.needDefault) {
          subjectOptions.value = data;
          return;
        }

        subjectOptions.value = [DefaultApprover, ...data];
      });
  }

  function cleanFormData() {
    formState.sectionType = '';
  }

  return {
    sectionOptions,
    gradeOptions,
    subjectOptions,
    approverOptions,
    formState,
    getSectionTypeOptions,
    getGrades,
    getSubjects,
    getApprovers,
    cleanFormData,
  };
};

export default useForm;
