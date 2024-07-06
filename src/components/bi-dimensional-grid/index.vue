<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import { isNil } from 'lodash';
import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue';
import useBiDimensionalGrid from './hooks';
import type { DataItem, Item, PayloadForBodyEvent, PayloadForHeadEvent } from './types';
// biome-ignore lint/style/useImportType: <explanation>
import { CellTypes } from './utils';

interface Props {
  columns: Item[];
  data: DataItem[];
  isAllowCrossing?: boolean;
  isShowOverlay?: (i: number, j: number, c: CellTypes) => boolean;
  isCellSilent?: (i: number, j: number, c: CellTypes) => boolean;
  isCellSticky?: (i: number, j: number, c: CellTypes) => boolean;
  isCellDraggable?: (i: number, j: number, c: CellTypes) => boolean;
  isCellDroppable?: (i: number, j: number, c: CellTypes) => boolean;
}

interface Emits {
  (e: 'activateHeadCell', payload: PayloadForHeadEvent): void;
  (e: 'deactivateHeadCell', payload: PayloadForHeadEvent): void;

  (e: 'activateBodyCell', payload: PayloadForBodyEvent): void;
  (e: 'deactivateBodyCell', payload: PayloadForBodyEvent): void;

  (e: 'dragStart', payload: PayloadForBodyEvent): void;
  (e: 'drop', payload: { from: PayloadForBodyEvent; to: PayloadForBodyEvent }): void;

  (e: 'cross', payload: { from: PayloadForBodyEvent; to: PayloadForBodyEvent }): void;
  (e: 'crossEnd'): void;
}

const props = defineProps<Props>();

const emits = defineEmits<Emits>();

const {
  containerRef,
  containerWidth,
  avgCellWidth,
  firstCellWidth,
  overlayRef,
  overlayArrowRef,
  columns,
  data,
  isAllowCrossing,
  activeCell,
  activeItem,
  isCellSticky,
  isCellDraggable,
  computeCellWidth,
  clearActiveState,
  onResize,
  onClickHeader,
  onClickBody,
  onClickOutside,
  onScroll,
  onKeyDown,
  onDragStart,
  onDragOver,
  onDrop,
  onMousedown,
  onMouseMove,
  onMouseup,
} = useBiDimensionalGrid(props, emits);

onBeforeMount(() => {
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onClickOutside);
});

onMounted(() => {
  containerWidth.value = containerRef.value?.getBoundingClientRect()?.width;

  containerRef.value?.addEventListener('scroll', onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('click', onClickOutside);

  containerRef.value?.removeEventListener('scroll', onScroll);
});

watch(
  () => columns.value.length,
  () => nextTick(() => computeCellWidth()),
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="bi-dimensional-grid">
    <div
      ref="containerRef"
      :style="{
        '--bi-dimension--container-width': `${containerWidth}px`,
        '--bi-dimension-column': columns.length - 1,
        '--bi-dimension-first-cell-width': `${firstCellWidth}px`,
        '--bi-dimension-avg-cell-width': `${avgCellWidth}px`,
      }"
      class="bi-dimensional-grid__container"
    >
      <div v-if="$slots['scrollable-header']" class="bi-dimensional-grid__scrollable-header">
        <slot name="scrollable-header"></slot>
      </div>
      <div class="bi-dimensional-grid__main">
        <template v-if="columns.length">
          <div class="bi-dimensional-grid__header">
            <div v-if="$slots['sticky-header']" class="bi-dimensional-grid__sticky-header">
              <slot name="sticky-header"></slot>
            </div>
            <div class="bi-dimensional-grid__thead" @click="onClickHeader">
              <div
                v-for="(col, j) in columns"
                :key="col.id"
                :data-i="-1"
                :data-j="j"
                :data-c="CellTypes.H"
                class="bi-dimensional-grid__header-cell"
                :class="{
                  'bi-dimensional-grid__cell--sticky': isCellSticky(-1, j, CellTypes.H),
                }"
              >
                <slot slot="head-cell" v-bind="{ i: -1, j, col, activeItem, clearActiveState }">
                  {{ col.name }}
                </slot>
              </div>
            </div>
          </div>
          <div
            v-if="data.length"
            class="bi-dimensional-grid__body"
            @click="onClickBody"
            @dragstart="onDragStart"
            @dragover="onDragOver"
            @drop="onDrop"
            @mousemove="onMouseMove"
            @mouseup="onMouseup"
          >
            <template v-for="(row, i) in data" :key="row.id">
              <div
                v-for="(col, j) in columns"
                :key="`${row.id}-${col.id}`"
                :data-i="i"
                :data-j="j"
                :data-c="CellTypes.B"
                class="bi-dimensional-grid__body-cell"
                :class="{
                  'bi-dimensional-grid__cell--sticky': isCellSticky(i, j, CellTypes.B),
                  'bi-dimensional-grid__body-cell--active': activeCell.c === CellTypes.B && activeCell.i === i && activeCell.j === j,
                  'bi-dimensional-grid__crossing': isAllowCrossing && activeCell.j === j && !isNil(activeCell.k) && (activeCell.i as number) < i && i <= activeCell.k
                }"
                :draggable="isCellDraggable(i, j, CellTypes.B)"
              >
                <slot name="body-cell" v-bind="{ i, j, row, col, cell: row?.cells?.[j], activeItem, clearActiveState }">
                  {{ `${ i * columns.length + j }` }}
                </slot>
                <div
                  v-if="isAllowCrossing && activeCell.j === j && (isNil(activeCell.k) ? (activeCell.i === i) : (activeCell.k === i))"
                  :data-i="i"
                  :data-j="j"
                  class="bi-dimensional-grid__cross-indicator"
                  @mousedown="onMousedown"
                  @click="evt => evt.stopPropagation()"
                >
                </div>
              </div>
            </template>
          </div>
          <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" class="bi-dimensional-grid--empty"></Empty>
        </template>
        <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" class="bi-dimensional-grid--empty"></Empty>
      </div>
    </div>
    <div v-if="$slots.footer" class="bi-dimensional-grid__footer">
      <slot name="footer"></slot>/
    </div>
  </div>
  <div v-if="$slots.overlay" ref="overlayRef" class="bi-dimensional-grid__overlay">
    <div ref="overlayArrowRef" class="bi-dimensional-grid__overlay-arrow"></div>
    <div class="bi-dimensional-grid__overlay-body" >
      <slot
        name="overlay"
        v-bind="{ activeItem, clearActiveState }"
      ></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
$cellSpace: 8px;
$cellHeight: 48px;
$border-color: #ebebeb;
$head-bg: #fff;
$head-cell-bg: #fafafa;
$body-cell-bg: #fff;
$active-cell-color: #1677ff;
$sticky-split-color: rgba(5, 5, 5, 0.06);
$footer-height: 60px;
$overlay-bg: #fff;
$overlay-max-width: 320px;
$overlay-max-height: 280px;

@mixin grid-ify {
  display: grid;
  grid-template-columns: var(--bi-dimension-first-cell-width) repeat(var(--bi-dimension-column), var(--bi-dimension-avg-cell-width));
  grid-auto-rows: $cellHeight;
  width: fit-content;
}

@mixin cell-ify($bg) {
  background: $bg;
  padding: 0 $cellSpace;
  align-content: center;
  cursor: pointer;
  border-bottom: 1px solid $border-color;
}

@mixin sticky-top-auto {
  position: sticky;
  top: 0;
}

@mixin sticky-left-auto {
  position: sticky;
  left: 0;
}

@mixin sticky-top {
  @include sticky-top-auto;
  width: fit-content;
}

@mixin sticky-left {
  @include sticky-left-auto;
  width: var(--bi-dimension--container-width);
}

.bi-dimensional-grid {
  flex: 1;
  padding: 16px 20px 0 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.bi-dimensional-grid__scrollable-header {
  @include sticky-left;
}

.bi-dimensional-grid__container {
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bi-dimensional-grid__main {
  flex: 1;
  position: relative;
  width: fit-content;
}

.bi-dimensional-grid__header {
  @include sticky-top;
  background: $head-bg;
  z-index: 3;
}

.bi-dimensional-grid__sticky-header {
 @include sticky-left;
}

.bi-dimensional-grid__body {
  @include grid-ify;
  box-sizing: border-box;
  padding-bottom: 20px;
}

.bi-dimensional-grid__footer {
  flex-shrink: 0;
  height: $footer-height;
}

.bi-dimensional-grid__thead {
  @include grid-ify;
}

.bi-dimensional-grid__header-cell {
  @include cell-ify($head-cell-bg);
  position: relative;

  &:not(:last-of-type)::after {
    content: '';
    display: block;
    width: 1px;
    height: 40%;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: $border-color;
  }
}

.bi-dimensional-grid__cell--sticky {
  @include sticky-left-auto;
  z-index: 2;
}

.bi-dimensional-grid__container.scrolled .bi-dimensional-grid__cell--sticky:has(+.bi-dimensional-grid__header-cell:not(.bi-dimensional-grid__cell--sticky)),
.bi-dimensional-grid__container.scrolled .bi-dimensional-grid__cell--sticky:has(+.bi-dimensional-grid__body-cell:not(.bi-dimensional-grid__cell--sticky)) {
  box-shadow: inset -10px 0 8px -8px $sticky-split-color;
}

.bi-dimensional-grid__body-cell {
  @include cell-ify($body-cell-bg);
}

.bi-dimensional-grid__body-cell:not(.bi-dimensional-grid__cell--sticky) {
  position: relative;
}

.bi-dimensional-grid__body-cell--active {
  outline: none;
  box-shadow: 0 0 0 1px $active-cell-color inset;
}

.bi-dimensional-grid__cross-indicator {
  position: absolute;
  background: $active-cell-color;
  width: 8px;
  height: 8px;
  bottom: 0;
  right: 0;
  z-index: 10;
}

.bi-dimensional-grid__crossing {
  background: rgba($active-cell-color, 0.1);
}

.bi-dimensional-grid--empty {
  @include sticky-left;
  margin-inline: 0;
}

.bi-dimensional-grid__overlay {
  position: fixed;
  z-index: 8;
  top: 0;
  left: 0;
  transform: translate(-9999px, -9999px);
}

.bi-dimensional-grid__overlay-arrow {
  width: 12px;
  height: 12px;
  background: #ccc;
  position: absolute;
}

.bi-dimensional-grid__overlay-body {
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
  max-width: $overlay-max-width;
  max-height: $overlay-max-height;
  background: $overlay-bg;
  box-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
</style>
