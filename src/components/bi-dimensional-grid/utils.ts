export enum CellTypes {
  H = 'head-cell',
  B = 'body-cell',
}

export enum DirectKey {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
}

export const DirectKeySet = new Set([DirectKey.Up, DirectKey.Down, DirectKey.Left, DirectKey.Right]);
