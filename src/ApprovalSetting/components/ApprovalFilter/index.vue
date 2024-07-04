<script setup lang="ts">
import { LocationType } from '@lexikos/doraemon-business';
import type { SelectProps } from 'ant-design-vue';
import { inject, ref } from 'vue';
import { type Context, ContextKey } from '../../utils';

type ContextFilter = Pick<
  Context,
  | 'locationType'
  | 'searchParams'
  | 'sectionTypes'
  | 'searchGradeOptions'
  | 'subjectList'
  | 'userListForSearch'
  | 'handleSearchSectionChanged'
  | 'handleSearch'
  | 'handleBatchAdd'
>;

const fieldNames: SelectProps['fieldNames'] = {
  label: 'name',
  value: 'id',
};

const {
  locationType,
  searchParams,
  sectionTypes,
  searchGradeOptions,
  subjectList,
  userListForSearch,
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
        :model="searchParams"
        name="approve-search-form"
        autocomplete="off"
        centered
        layout="inline"
      >
        <a-form-item>
          <a-select
            v-model:value="searchParams.sectionCode"
            class="approver-settings-select-form-item"
            :options="sectionTypes"
            @change="handleSearchSectionChanged"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchParams.gradeCode"
            class="approver-settings-select-form-item"
            :options="searchGradeOptions"
            @select="handleSearch"
          />
        </a-form-item>
        <a-form-item v-show="locationType !== LocationType.PreprimaryEducation">
          <a-select
              v-model:value="searchParams.subjectId"
              class="approver-settings-select-form-item"
              :options="subjectList"
              @select="handleSearch"
              :fieldNames="fieldNames"
          />
        </a-form-item>
        <a-form-item>
          <a-select
              v-model:value="searchParams.approverId"
              class="approver-settings-select-form-item"
              :options="userListForSearch"
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
