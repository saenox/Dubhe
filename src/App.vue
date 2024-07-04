<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Input } from 'ant-design-vue';
import { ref } from 'vue';
import BiDimensionalGrid from './components/bi-dimensional-grid/index.vue';

const columns = ref(Array.from({ length: 10 }, (_, i) => ({ id: `${i}`, name: `c-${i}` })));
const data = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: `d-${i}`,
    name: `d-${i}`,
    cells: Array.from({ length: columns.value.length }, (_, j) => ({
      id: `${i},${j}`,
      name: `${(Math.random() * 1000).toString().slice(0, 5)}`,
    })),
  })),
);
</script>

<template>
  <div style="display: flex; height: 100%; flex-direction: column;">
    <div>返回</div>
    <BiDimensionalGrid
      :columns="columns"
      :data="data"
      :is-cell-silent="(i, j) => i < 1 || j < 1"
      :is-cell-draggable="() => true"
      @drop="({ from, to }) => to.cell.name = from.cell.name"
      @cross="({ from, to }) => to.cell.name = from.cell.name"
    >
      <template #scrollable-header>
        <div>scrollable-header</div>
        <div>scrollable-header</div>
      </template>
      <template #sticky-header>
        <div>stickyHeader2</div>
        <div>stickyHeader3</div>
      </template>
      <template #body-cell="{ cell }">
        <div class="approval-setting__add-btn">
          <Button type="link">
            <template #icon>
              <PlusOutlined />
              {{ `${cell.name}` }}
            </template>
          </Button>
        </div>
      </template>
      <template #overlay="{ activeItem, clearActiveState }">
        <div>{{ activeItem?.type }}</div>
        <div>
          <Button @click="() => clearActiveState()">清除</Button>
        </div>
      </template>
      <template #footer>
        8888
      </template>
    </BiDimensionalGrid>
  </div>
</template>

<style scoped lang="scss">
.approval-setting__way {
  width: fit-content;
  position: sticky;
  left: 0;
}

.approval-setting__add-btn {
  padding: 0;
  pointer-events: none;
}
</style>
