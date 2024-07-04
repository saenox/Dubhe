<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { LocationType, SelectorPerson } from '@lexikos/doraemon-business';
import { join, map } from 'lodash';
import { onMounted, provide, ref } from 'vue';
import BiDimensionalGrid from '../components/bi-dimensional-grid/index.vue';
import ApprovalMethod from './components/ApprovalMethod/index.vue';
import GlobalApprover from './components/GlobalApprover/index.vue';
import useApprovalSetting from './hooks';
import { type Context, ContextKey } from './utils';

const ctx: Context = useApprovalSetting();

provide<Context>(ContextKey, ctx);
</script>

<template>
  <BiDimensionalGrid :columns="ctx.columns" :data="ctx.data" >
    <template #scrollable-header>
      <ApprovalMethod />
      <GlobalApprover />
    </template>
    <template #sticky-header>
      <div style="padding-top: 10px">
        <span style="font-size: 14px; font-weight: bold">
          {{ LocationType.PreprimaryEducation !== ctx.locationType ? '学科' : '年级' }}审核人设置
        </span>

      </div>
    </template>
    <template #cell="{ cell }">
      <div v-if="cell.teachers">
        {{ join(map(cell.teachers || [], (t) => t.name)) }}
      </div>
      <div v-else>
        <a-button type="link" class="approval-setting__add-btn">
          <template #icon>
            <PlusOutlined />
          </template>
          添加
        </a-button>
      </div>
    </template>
  </BiDimensionalGrid>
</template>

<style scoped lang="scss">
.approval-setting__add-btn {
  width: 100%;
}
</style>
