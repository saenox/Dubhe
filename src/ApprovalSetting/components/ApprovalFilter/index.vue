<script setup lang="ts">
import { LocationType } from '@lexikos/doraemon-business';
import type { SelectProps } from 'ant-design-vue';
import { inject, ref } from 'vue';
import { type Context, ContextKey } from '../../utils';

type ContextFilter = Pick<
  Context,
  'locationType' | 'sectionOptions' | 'gradeOptions' | 'subjectOptions' | 'approverOptions' | 'formState'
>;

const {
  locationType,
  sectionOptions,
  gradeOptions,
  subjectOptions,
  approverOptions,
  handleSearchSectionChanged,
  handleSearch,
  handleBatchAdd,
} = inject<ContextFilter>(ContextKey, {
  locationType: ref(''),
  searchParams: ref({} as any),
  sectionTypes: ref([] as any[]),
  searchGradeOptions: ref([] as any[]),
  subjectList: ref([] as any[]),
  userListForSearch: ref([] as any[]),
  handleSearchSectionChanged: () => Promise.resolve(),
  handleSearch: () => Promise.resolve(),
  handleBatchAdd: () => Promise.resolve(),
});
</script>

<template>
  <div style="padding-top: 10px">
    <div style="font-size: 14px; font-weight: bold">
      {{ LocationType.PreprimaryEducation !== locationType ? '学科' : '年级' }}审核人设置
    </div>
    <div class="approver-settings-header-left">
      <a-form
        ref="searchFormRef"
        :model="formState"
        name="approve-search-form"
        autocomplete="off"
        centered
        layout="inline"
      >
        <a-form-item>
          <a-select
            v-model:value="formState.sectionType"
            class="approver-settings-select-form-item"
            :options="sectionOptions"
            @change="handleSearchSectionChanged"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="formState.gradeId"
            class="approver-settings-select-form-item"
            :options="gradeOptions"
            @select="handleSearch"
          />
        </a-form-item>
        <a-form-item v-show="locationType !== LocationType.PreprimaryEducation">
          <a-select
            v-model:value="formState.subjectId"
            class="approver-settings-select-form-item"
            :options="subjectOptions"
            @select="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="formState.approverId"
            class="approver-settings-select-form-item"
            :options="approverOptions"
            @select="handleSearch"
          />
        </a-form-item>
      </a-form>
    </div>
    <div class="usergroup-list-header-right">
      <a-button type="primary" @click="handleBatchAdd()"
      ><PlusOutlined />新增{{
          locationType !== LocationType.PreprimaryEducation ? '学科' : '年级'
        }}审核人</a-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
