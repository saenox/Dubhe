<script setup lang="ts">
import { LocationType } from '@lexikos/doraemon-business';
import { Http } from '@lexikos/doraemon-network';
import { message } from 'ant-design-vue';
import type { SelectProps } from 'ant-design-vue';
import { computed, inject, ref } from 'vue';
import useForm from '../../use-form';
import { type Context, ContextKey } from '../../utils';

const modalFormRef = ref();

const submitting = ref<boolean>(false);

type ContextModal = Pick<Context, 'locationType' | 'fetchApproverConfigList'>;

const { locationType, fetchApproverConfigList } = inject<ContextModal>(ContextKey, {
  locationType: ref(''),
  fetchApproverConfigList: () => Promise.resolve(),
});

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
  cleanFormData,
} = useForm({ needDefault: false });

const modalOpen = ref(false);

const modelTitle = computed(() => {
  return `新增${locationType.value !== LocationType.PreprimaryEducation ? '学科' : '年级'}审核人`;
});

function filterSubject(inputValue: string, option: any) {
  return !!option.label.includes(inputValue);
}

function filterUser(inputValue: string, option: any) {
  return !!option.label.includes(inputValue);
}

function handleFormOk() {
  if (modalFormRef.value) {
    modalFormRef.value
      .validateFields()
      .then(async (values: any) => {
        submitting.value = true;
        // TODO: 字段转换
        try {
          await Http.getInstance().post('/api/eduRes/approverConfigs/actions/setting', {
            ...values,
          });
          message.success('设置成功！');
          modalOpen.value = false;
          await fetchApproverConfigList();
          cleanFormData();
        } catch (e) {
          console.log('approverConfigs setting error: ', e?.desc);
          message.error(e?.desc || '设置失败！');
        }
      })
      .catch((error: any) => {
        console.log('Failed:', error);
      })
      .finally(() => {
        submitting.value = false;
      });
  }
}

function handleFormCancel() {
  modalOpen.value = false;
  cleanFormData();
}
</script>

<template>
  <a-modal
    destroyOnClose
    v-model:open="modalOpen"
    :title="modelTitle"
    @ok="handleFormOk"
    @cancel="handleFormCancel"
    :confirmLoading="submitting"
    cancelText="取消"
    okText="确定"
    centered
  >
    <a-form
      ref="modalFormRef"
      :model="formState"
      name="group-form"
      autocomplete="off"
      centered
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
    >
      <div :style="{ height: '30px' }"></div>
      <a-form-item
        label="学段"
        name="sectionCode"
        :rules="[{ required: true, message: '学段必填' }]"
      >
        <a-select
          v-model:value="formState.sectionType"
          style="width: 300px"
          :options="sectionOptions"
          @change="handleFormSectionChanged"
        />
      </a-form-item>
      <a-form-item
        label="年级"
        name="gradeCodes"
        :rules="[{ required: true, message: '年级必填' }]"
      >
        <a-select
          v-model:value="formState.gradeCodes"
          style="width: 300px"
          :options="gradeOptions"
          mode="multiple"
        />
      </a-form-item>
      <a-form-item
        v-show="locationType !== LocationType.PreprimaryEducation"
        label="学科"
        name="subjectIds"
        :rules="[
          { required: locationType !== LocationType.PreprimaryEducation, message: '学科必填' },
        ]"
      >
        <a-select
          v-model:value="formState.subjectIds"
          style="width: 300px"
          :options="subjectOptions"
          :filterOption="filterSubject"
          mode="multiple"
        />
      </a-form-item>
      <a-form-item
        label="审批人"
        name="approverIds"
        :rules="[{ required: true, message: '审批人必填' }]"
      >
        <a-select
          v-model:value="formState.approverIds"
          style="width: 300px"
          :options="approverOptions"
          :filterOption="filterUser"
          mode="multiple"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped lang="scss">

</style>
