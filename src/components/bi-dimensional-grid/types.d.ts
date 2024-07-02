import type { CellTypes } from './utils';

export interface Item {
  id: string;
  name: string;
}

export type DataItem = Record<string, unknown> &
  Item & {
    cells: (Record<string, unknown> & Item)[];
  };

interface Props {
  columns: Item[];
  data: DataItem[];
  isShowOverlay?: (i: number, j: number, c: CellTypes) => boolean;
  isCellSilent?: (i: number, j: number, c: CellTypes) => boolean;
  isCellSticky?: (i: number, j: number, c: CellTypes) => boolean;
}

export interface PayloadForHeadEvent {
  index: number;
  item: Item;
}

export interface PayloadForBodyEvent {
  i: number;
  j: number;
  row: DataItem;
  col: Item;
  cell: DataItem['cells'][number];
}

export interface Emits {
  (e: 'activateHeadCell', payload: PayloadForHeadEvent): void;
  (e: 'deactivateHeadCell', payload: PayloadForHeadEvent): void;

  (e: 'activateBodyCell', payload: PayloadForBodyEvent): void;
  (e: 'deactivateBodyCell', payload: PayloadForBodyEvent): void;
}

export interface ActiveCell {
  i?: number;
  j?: number;
  c?: CellTypes;
}
