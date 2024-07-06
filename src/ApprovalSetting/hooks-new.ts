import { useLocationType } from '@lexikos/doraemon-business';
import { ref } from 'vue';
import useForm from './use-form';

const useApprovalSetting = () => {
  const locationType = useLocationType();

  const loading = ref<boolean>(false);

  const {
    sectionOptions,
    gradeOptions,
    subjectOptions,
    approverOptions,
    formState,
    getSectionTypeOptions,
    getGrades,
    getSubjects,
    getApprovers,
  } = useForm({ needDefault: true });

  return {
    locationType,
    sectionOptions,
    gradeOptions,
    subjectOptions,
    approverOptions,
    formState,
    getSectionTypeOptions,
    getGrades,
    getSubjects,
    getApprovers,
  };
};

export default useApprovalSetting;
