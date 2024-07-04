import { debounce, isFunction, isNil, throttle } from 'lodash';
import { computed, ref, unref } from 'vue';
import type { ActiveCell, Emits, PayloadForBodyEvent, PayloadForHeadEvent, Props } from './types';
import { CellTypes, DirectKey, DirectKeySet } from './utils';

const useBiDimensionalGrid = (props: Props, emits: Emits) => {
  const Offset = 8;

  const OffsetLg = 20;

  const MinWidth = 148;

  const containerRef = ref<HTMLDivElement | null>(null);

  const overlayRef = ref<HTMLDivElement | null>(null);

  const overlayArrowRef = ref<HTMLDivElement | null>(null);

  const onCrossing = ref(false);

  const crossingSet = new Set<number>();

  const containerWidth = ref<number>();

  const avgCellWidth = ref(MinWidth);

  const firstCellWidth = ref(MinWidth);

  const activeCell = ref<ActiveCell>({
    i: undefined,
    j: undefined,
    k: undefined,
    c: undefined,
  });

  const columns = computed(() => {
    return props.columns || [];
  });

  const data = computed(() => props.data || []);

  const isAllowCrossing = computed(() => props.isAllowCrossing);

  const activeItem = computed(() => {
    if (isNilCoordinate(activeCell.value)) {
      return null;
    }

    if (activeCell.value.c === CellTypes.H) {
      return {
        type: CellTypes.H,
        index: activeCell.value.j,
        data: unref(columns.value[activeCell.value.j as number]),
      };
    }

    if (activeCell.value.c === CellTypes.B) {
      return {
        type: CellTypes.B,
        i: activeCell.value.i as number,
        j: activeCell.value.j as number,
        row: data.value?.[activeCell.value.i as number],
        col: columns.value[activeCell.value.j as number],
        cell: data.value?.[activeCell.value.i as number]?.cells?.[activeCell.value.j as number],
      };
    }

    return null;
  });

  function isShowOverlay(i: number, j: number, c: CellTypes) {
    if (isFunction(props.isShowOverlay)) {
      return props.isShowOverlay(i, j, c);
    }

    return c === CellTypes.H ? true : !isCellSilent(i, j, c);
  }

  function isCellSilent(i: number, j: number, c: CellTypes) {
    if (isFunction(props.isCellSilent)) {
      return props.isCellSilent(i, j, c);
    }

    return c === CellTypes.H;
  }

  function isCellSticky(i: number, j: number, c: CellTypes) {
    if (isFunction(props.isCellSticky)) {
      return props.isCellSticky(i, j, c);
    }

    return columns.value.length === 0 || j % columns.value.length === 0;
  }

  function isCellDraggable(i: number, j: number, c: CellTypes) {
    if (isFunction(props.isCellDraggable)) {
      return props.isCellDraggable(i, j, c);
    }

    return i % 2 === 0;
  }

  function isCellDroppable(i: number, j: number, c: CellTypes) {
    if (isFunction(props.isCellDroppable)) {
      return props.isCellDroppable(i, j, c);
    }

    return true;
  }

  function getSelector(i: number, j: number, c: CellTypes) {
    return `div[data-i="${i}"][data-j="${j}"][data-c="${c}"]`;
  }

  function resetActiveCell() {
    activeCell.value = {
      i: undefined,
      j: undefined,
      k: undefined,
      c: undefined,
    };

    crossingSet.clear();
  }

  function isNilCoordinate(coordinate: { i?: number; j?: number }): boolean {
    return isNil(coordinate?.i) || isNil(coordinate?.j);
  }

  function getHeadEventPayload(_i: number, j: number): PayloadForHeadEvent {
    return {
      index: j as number,
      item: columns.value[j as number],
    };
  }

  function getBodyEventPayload(i: number, j: number): PayloadForBodyEvent {
    return {
      i,
      j,
      row: data.value[i],
      col: columns.value[j],
      cell: data.value[i].cells[j],
    };
  }

  function getTopBound(container: HTMLElement) {
    return container.querySelector(getSelector(-1, 0, CellTypes.H))?.getBoundingClientRect()?.bottom || 0;
  }

  function findBoundForHead(container: HTMLElement, containerRect: DOMRect) {
    const m = unref(columns).length;

    const rightBound = containerRect.right;

    let leftBound = containerRect.left;

    for (let j = 0; j < m; j++) {
      if (!isCellSticky(-1, j, CellTypes.H)) {
        if (j === 0) {
          break;
        }

        leftBound =
          container.querySelector(getSelector(-1, j - 1, CellTypes.H))?.getBoundingClientRect()?.right ||
          containerRect.right;
        break;
      }
    }

    return {
      leftBound,
      rightBound,
    };
  }

  function findLeftBoundForBody(container: HTMLElement, containerRect: DOMRect) {
    const n = unref(data).length;
    const m = unref(columns).length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (!isCellSticky(i, j, CellTypes.B)) {
          if (j === 0) {
            return containerRect.left;
          }

          return (
            container.querySelector(getSelector(i, j - 1, CellTypes.B))?.getBoundingClientRect()?.right ||
            containerRect.right
          );
        }
      }
    }

    return containerRect.right;
  }

  function findBoundForBody(container: HTMLElement, containerRect: DOMRect) {
    const topBound = getTopBound(container);
    const leftBound = findLeftBoundForBody(container, containerRect);
    const rightBound = containerRect.right;
    const bottomBound = containerRect.bottom;

    return {
      topBound,
      leftBound,
      rightBound,
      bottomBound,
    };
  }

  function scrollByForHead(container: HTMLElement, containerRect: DOMRect, targetRect: DOMRect) {
    const { leftBound, rightBound } = findBoundForHead(container, containerRect);

    let offsetX = 0;

    if (targetRect.left < leftBound) {
      offsetX = targetRect.left - leftBound;
    } else if (targetRect.right > rightBound) {
      offsetX = targetRect.right - rightBound;
    }

    if (offsetX !== 0) {
      container.scrollBy({
        left: offsetX,
        behavior: 'smooth',
      });
    }

    return {
      offsetX,
    };
  }

  function scrollByForBody(container: HTMLElement, containerRect: DOMRect, targetRect: DOMRect) {
    const { leftBound, topBound, rightBound, bottomBound } = findBoundForBody(container, containerRect);

    let offsetX = 0;
    let offsetY = 0;

    if (targetRect.left < leftBound) {
      offsetX = targetRect.left - leftBound;
    } else if (targetRect.right > rightBound) {
      offsetX = targetRect.right - rightBound;
    }

    if (targetRect.top < topBound) {
      offsetY = targetRect.top - topBound - OffsetLg;
    } else if (targetRect.bottom > bottomBound) {
      offsetY = targetRect.bottom - bottomBound + OffsetLg;
    }

    if (offsetX !== 0 || offsetY !== 0) {
      container.scrollBy({
        top: offsetY,
        left: offsetX,
        behavior: 'smooth',
      });
    }

    return {
      offsetX,
      offsetY,
    };
  }

  function placeOverlayWidthLtTarget(
    containerRect: DOMRect,
    overlayRect: DOMRect,
    targetRect: { x: number; y: number; width: number; height: number },
  ) {
    const { height } = overlayRect;

    const x = targetRect.x;

    let y = targetRect.y + targetRect.height + Offset;

    if (y + height > containerRect.bottom) {
      y = targetRect.y - height - Offset;
    }

    return { x, y };
  }

  function placeOverlayWidthGteTarget(
    containerRect: DOMRect,
    overlayRect: DOMRect,
    targetRect: { x: number; y: number; width: number; height: number },
  ) {
    const { width, height } = overlayRect;

    let x = targetRect.x + targetRect.width / 2 - width / 2;
    let y = targetRect.y + targetRect.height + Offset;

    if (x + width > containerRect.right) {
      x = targetRect.x + targetRect.width - width;
    }

    if (y + height > containerRect.bottom) {
      y = targetRect.y - height - Offset;
    }

    return { x, y };
  }

  function placeOverlayDelay(
    overlay: HTMLElement,
    containerRect: DOMRect,
    targetRect: { x: number; y: number; width: number; height: number },
    delay = 200,
  ) {
    setTimeout(() => {
      const overlayArrow = unref(overlayArrowRef);
      const overlayRect = overlay.getBoundingClientRect();

      const { x, y } =
        overlayRect.width < targetRect.width
          ? placeOverlayWidthLtTarget(containerRect, overlayRect, targetRect)
          : placeOverlayWidthGteTarget(containerRect, overlayRect, targetRect);

      overlay.setAttribute('style', `transform: translate(${x}px, ${y}px);`);

      if (overlayArrow) {
        const u = targetRect.x - x + Offset;
        const v = y < targetRect.y ? overlayRect.height : -Offset;

        overlayArrow.setAttribute('style', `transform: translate(${u}px, ${v}px);`);
      }
    }, delay);
  }

  function placeOverlay(
    containerRect: DOMRect,
    targetRect: DOMRect,
    pos: { x: number; y: number },
    needOverlay: boolean,
    delay = 200,
  ) {
    if (!needOverlay) {
      return;
    }

    const overlay = unref(overlayRef);

    if (!overlay) {
      return;
    }

    placeOverlayDelay(
      overlay,
      containerRect,
      {
        x: pos.x,
        y: pos.y,
        width: targetRect.width,
        height: targetRect.height,
      },
      delay,
    );
  }

  function checkBound(container: HTMLElement, containerRect: DOMRect, targetRect: DOMRect, c: CellTypes) {
    if (c === CellTypes.H) {
      const { leftBound, rightBound } = findBoundForHead(container, containerRect);

      return targetRect.left + targetRect.width / 2 < leftBound || targetRect.left + targetRect.width / 2 > rightBound;
    }

    const { leftBound, topBound, rightBound, bottomBound } = findBoundForBody(container, containerRect);

    return (
      targetRect.left + targetRect.width / 2 < leftBound ||
      targetRect.top + targetRect.height / 2 < topBound ||
      targetRect.left + targetRect.width / 2 > rightBound ||
      targetRect.top + targetRect.height / 2 > bottomBound
    );
  }

  function hideOverlay() {
    const overlay = unref(overlayRef);

    if (!overlay) {
      return;
    }

    overlay.setAttribute('style', 'opacity: 0;');
  }

  function clearActiveState() {
    hideOverlay();
    resetActiveCell();
  }

  function scrollIntoViewForHead(i: number, j: number, c: CellTypes, needOverlay: boolean) {
    requestAnimationFrame(() => {
      const container = unref(containerRef);
      const target = container?.querySelector(getSelector(i, j, c));

      if (!container || !target) {
        return;
      }

      const targetRect = target.getBoundingClientRect();

      const containerRect = container.getBoundingClientRect();

      const rawX = targetRect.x;
      const rawY = targetRect.y;

      const { offsetX } = scrollByForHead(container, containerRect, targetRect);

      placeOverlay(containerRect, targetRect, { x: -offsetX + rawX, y: rawY }, needOverlay);
    });
  }

  function scrollIntoViewForBodyCell(i: number, j: number, c: CellTypes, needOverlay: boolean) {
    requestAnimationFrame(() => {
      const container = unref(containerRef);
      const target = container?.querySelector(getSelector(i, j, c));

      if (!container || !target) {
        return;
      }

      const targetRect = target.getBoundingClientRect();

      const containerRect = container.getBoundingClientRect();

      const rawX = targetRect.x;
      const rawY = targetRect.y;

      const { offsetX, offsetY } = scrollByForBody(container, containerRect, targetRect);

      placeOverlay(containerRect, targetRect, { x: -offsetX + rawX, y: -offsetY + rawY }, needOverlay);
    });
  }

  function activateHeadCell(i: number, j: number) {
    activeCell.value.i = i;
    activeCell.value.j = j;
    activeCell.value.k = undefined;
    activeCell.value.c = CellTypes.H;

    crossingSet.clear();

    emits('activateHeadCell', getHeadEventPayload(i, j));

    return scrollIntoViewForHead(i, j, CellTypes.H, isShowOverlay(i, j, CellTypes.H));
  }

  function deactivateHeadCell(i: number, j: number) {
    hideOverlay();

    emits('deactivateHeadCell', getHeadEventPayload(i, j));

    resetActiveCell();
  }

  function activateBodyCell(i: number, j: number) {
    activeCell.value.i = i;
    activeCell.value.j = j;
    activeCell.value.k = undefined;
    activeCell.value.c = CellTypes.B;

    emits('activateBodyCell', getBodyEventPayload(i, j));

    return scrollIntoViewForBodyCell(i, j, CellTypes.B, isShowOverlay(i, j, CellTypes.B));
  }

  function deactivateBodyCell(i: number, j: number) {
    hideOverlay();

    emits('deactivateBodyCell', getBodyEventPayload(i, j));

    resetActiveCell();
  }

  function activateFirstBodyCell(x: number, y: number) {
    const n = unref(data).length;
    const m = unref(columns).length;

    for (let i = x; i < n; i++) {
      for (let j = y; j < m; j++) {
        if (!isCellSilent(i, j, CellTypes.B)) {
          activateBodyCell(i, j);
          return true;
        }
      }
    }

    return false;
  }

  function activateLastBodyCell(x: number, y: number) {
    const n = unref(data).length - 1;
    const m = unref(columns).length - 1;

    for (let i = n; i >= x; i--) {
      for (let j = m; j >= y; j--) {
        if (!isCellSilent(i, j, CellTypes.B)) {
          activateBodyCell(i, j);
          return true;
        }
      }
    }

    return false;
  }

  function activateNextLineFirstBodyCell(x: number) {
    const m = unref(columns).length;

    for (let j = 0; j < m; j++) {
      if (!isCellSilent(x, j, CellTypes.B)) {
        activateBodyCell(x, j);
        return true;
      }
    }

    return activateFirstBodyCell(0, 0);
  }

  function activateFirstLineBodyCell(_x: number, y: number) {
    const n = unref(data).length;

    for (let i = 0; i < n; i++) {
      if (!isCellSilent(i, y, CellTypes.B)) {
        activateBodyCell(i, y);
        return true;
      }
    }

    return false;
  }

  function activateNextLineBodyCell(x: number, y: number) {
    const n = unref(data).length;

    for (let i = x + 1; i < n; i++) {
      if (!isCellSilent(i, y, CellTypes.B)) {
        activateBodyCell(i, y);
        return true;
      }
    }

    return activateFirstLineBodyCell(x, y);
  }

  function activateLastLineBodyCell(_x: number, y: number) {
    const n = unref(data).length;

    for (let i = n - 1; i > -1; i -= 1) {
      if (!isCellSilent(i, y, CellTypes.B)) {
        activateBodyCell(i, y);
        return true;
      }
    }

    return false;
  }

  function activatePrevLineBodyCell(x: number, y: number) {
    for (let i = x - 1; i > -1; i -= 1) {
      if (!isCellSilent(i, y, CellTypes.B)) {
        activateBodyCell(i, y);
        return true;
      }
    }

    return activateLastLineBodyCell(x, y);
  }

  function activateFirstColBodyCell(x: number, _y: number) {
    const m = unref(columns).length;

    for (let j = 0; j < m; j++) {
      if (!isCellSilent(x, j, CellTypes.B)) {
        activateBodyCell(x, j);
        return true;
      }
    }

    return false;
  }

  function activateNextColBodyCell(x: number, y: number) {
    const m = unref(columns).length;

    for (let j = y + 1; j < m; j++) {
      if (!isCellSilent(x, j, CellTypes.B)) {
        activateBodyCell(x, j);
        return true;
      }
    }

    return activateFirstColBodyCell(x, y);
  }

  function activateLastColBodyCell(x: number, _y: number) {
    const m = unref(columns).length;

    for (let j = m - 1; j > -1; j--) {
      if (!isCellSilent(x, j, CellTypes.B)) {
        activateBodyCell(x, j);
        return true;
      }
    }

    return false;
  }

  function activatePrevColBodyCell(x: number, y: number) {
    for (let j = y - 1; j > -1; j--) {
      if (!isCellSilent(x, j, CellTypes.B)) {
        activateBodyCell(x, j);
        return true;
      }
    }

    return activateLastColBodyCell(x, y);
  }

  function activateNextBodyCelProtected(x: number, y: number) {
    if (!isCellSilent(x, y, CellTypes.B)) {
      activateBodyCell(x, y);
      return true;
    }

    return activateNextLineFirstBodyCell(x + 1);
  }

  function activeNextBodyCell() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      activateFirstBodyCell(0, 0);
      return;
    }

    if (act.i === unref(data).length - 1 && act.j === unref(columns).length - 1) {
      activateFirstBodyCell(0, 0);
      return;
    }

    if (act.j === unref(columns).length - 1) {
      activateNextLineFirstBodyCell((act.i as number) + 1);
    } else {
      activateNextBodyCelProtected(act.i as number, (act.j as number) + 1);
    }
  }

  const activeNextBodyCellThrottled = throttle(activeNextBodyCell, 100);

  function handleTabEvent(evt: KeyboardEvent) {
    if (evt.key !== 'Tab') {
      return;
    }

    evt.preventDefault();

    return activeNextBodyCellThrottled();
  }

  function handleUpDirectionEvent() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return activateLastBodyCell(0, 0);
    }

    return activatePrevLineBodyCell(act.i as number, act.j as number);
  }

  function handleDownDirectionEvent() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return activateFirstBodyCell(0, 0);
    }

    return activateNextLineBodyCell(act.i as number, act.j as number);
  }

  function handleLeftDirectionEvent() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return activateLastBodyCell(0, 0);
    }

    return activatePrevColBodyCell(act.i as number, act.j as number);
  }

  function handleRightDirectionEvent() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return activateFirstBodyCell(0, 0);
    }

    return activateNextColBodyCell(act.i as number, act.j as number);
  }

  const handleDirectionEventThrottled = throttle((evt: KeyboardEvent) => {
    switch (evt.key as DirectKey) {
      case DirectKey.Up:
        return handleUpDirectionEvent();
      case DirectKey.Down:
        return handleDownDirectionEvent();
      case DirectKey.Left:
        return handleLeftDirectionEvent();
      case DirectKey.Right:
        return handleRightDirectionEvent();
      default:
        console.error(evt.key);
    }
  }, 200);

  function handleDirectionEvent(evt: KeyboardEvent) {
    if (!DirectKeySet.has(evt.key as DirectKey)) {
      return;
    }

    evt.preventDefault();

    handleDirectionEventThrottled(evt);
  }

  function getCoordinateFromEvent(evt: Event) {
    const { i, j, c } = (evt?.target as HTMLElement)?.dataset || { i: undefined, j: undefined, c: undefined };

    return {
      i: isNil(i) ? i : Number.parseInt(i, 10),
      j: isNil(j) ? j : Number.parseInt(j, 10),
      c,
    };
  }

  function computeCellWidth() {
    if (!columns.value.length) {
      return;
    }

    const num = columns.value.length;

    const containerRect = containerRef.value?.getBoundingClientRect();

    containerWidth.value = containerRect?.width as number;

    const expectedWidth = Math.ceil(unref(containerWidth.value) / num);

    const width = expectedWidth < MinWidth ? MinWidth : expectedWidth;

    firstCellWidth.value = width === MinWidth ? width : width - (width * num - unref(containerWidth.value));

    avgCellWidth.value = width;
  }

  function checkDragDrop(evt: Event) {
    if (!evt) {
      return null;
    }

    const { i, j, c } = getCoordinateFromEvent(evt);

    if (isNilCoordinate({ i, j })) {
      return null;
    }

    if (!isCellDraggable(i as number, j as number, c as CellTypes)) {
      return null;
    }

    return { i: i as number, j: j as number, c: c as CellTypes };
  }

  function onClickHeader(evt: MouseEvent) {
    const { i, j } = getCoordinateFromEvent(evt);

    if (isNilCoordinate({ i, j })) {
      console.log('click on invalid header cell: ', evt?.target);
      return;
    }

    activateHeadCell(i as number, j as number);
  }

  function onClickBody(evt: MouseEvent) {
    const { i, j } = getCoordinateFromEvent(evt);

    if (isNilCoordinate({ i, j })) {
      console.log('click on invalid body cell: ', evt?.target);
      return;
    }

    if (isCellSilent(i as number, j as number, CellTypes.B)) {
      scrollIntoViewForBodyCell(
        i as number,
        j as number,
        CellTypes.B,
        isShowOverlay(i as number, j as number, CellTypes.B),
      );
      return;
    }

    activateBodyCell(i as number, j as number);
  }

  function onClickOutside(evt: MouseEvent) {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return;
    }

    const { i, j, c } = getCoordinateFromEvent(evt);

    const shouldIgnore =
      (!isNilCoordinate({ i, j }) && !isCellSilent(i as number, j as number, c as CellTypes)) ||
      c === CellTypes.H ||
      overlayRef.value?.contains(evt.target as HTMLElement) ||
      unref(onCrossing);

    if (shouldIgnore) {
      return;
    }

    if (act.c === CellTypes.H) {
      deactivateHeadCell(act.i as number, act.j as number);
    }

    if (act.c === CellTypes.B) {
      deactivateBodyCell(act.i as number, act.j as number);
    }
  }

  function onScroll() {
    const act = unref(activeCell.value);

    if (isNilCoordinate(act)) {
      return;
    }

    const targetRect = containerRef.value
      ?.querySelector(getSelector(act.i as number, act.j as number, act.c as CellTypes))
      ?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    const container = unref(containerRef);

    const containerRect = container?.getBoundingClientRect();

    if (!container || !containerRect) {
      return;
    }

    if (checkBound(container, containerRect, targetRect, act.c as CellTypes)) {
      hideOverlay();
    } else {
      placeOverlay(
        containerRect,
        targetRect,
        { x: targetRect.x, y: targetRect.y },
        isShowOverlay(act.i as number, act.j as number, act.c as CellTypes),
        20,
      );
    }
  }

  function onKeyDown(evt: KeyboardEvent) {
    handleTabEvent(evt);

    handleDirectionEvent(evt);
  }

  function onDragStart(evt: DragEvent) {
    const dataset = checkDragDrop(evt);

    if (!dataset) {
      return false;
    }

    evt.dataTransfer?.setData(
      'text/plain',
      JSON.stringify({
        target: {
          dataset,
        },
      }),
    );

    emits('dragStart', getBodyEventPayload(dataset.i, dataset.j));
  }

  function onDragOver(evt: DragEvent) {
    if (!checkDragDrop(evt)) {
      return false;
    }

    evt.preventDefault();
    return true;
  }

  function onDrop(evt: DragEvent) {
    const dataset = checkDragDrop(evt);

    if (!dataset) {
      return false;
    }

    const derivedDataset = getCoordinateFromEvent(
      JSON.parse(evt.dataTransfer?.getData('text/plain') || '{}') as unknown as Event,
    );

    evt.preventDefault();
    emits('drop', {
      from: getBodyEventPayload(derivedDataset.i as number, derivedDataset.j as number),
      to: getBodyEventPayload(dataset.i as number, dataset.j as number),
    });
  }

  function onMousedown(evt: MouseEvent) {
    if (!unref(isAllowCrossing)) {
      return;
    }

    hideOverlay();

    onCrossing.value = true;
    activeCell.value.k = undefined;

    evt.preventDefault();
  }

  function onMouseMove(evt: MouseEvent) {
    if (!unref(onCrossing) || !unref(isAllowCrossing)) {
      return;
    }

    const act = unref(activeCell);

    const cur = getCoordinateFromEvent(evt);

    const b =
      isNilCoordinate(act) ||
      isNilCoordinate(cur) ||
      isCellSilent(cur.i as number, cur.j as number, CellTypes.B) ||
      (act.i as number) >= (cur.i as number);

    if (b) {
      return;
    }

    activeCell.value.k = cur.i;

    crossingSet.add(cur.i as number);

    emits('cross', {
      from: getBodyEventPayload(act.i as number, act.j as number),
      to: getBodyEventPayload(cur.i as number, act.j as number),
    });
  }

  function onMouseup(evt: MouseEvent) {
    if (!unref(isAllowCrossing)) {
      return;
    }

    evt.stopPropagation();

    const act = unref(activeCell);

    if (!isNilCoordinate(act) && !isNil(act.k) && crossingSet.size > 0) {
      for (let i = act.i as number; i <= act.k; i += 1) {
        if (!crossingSet.has(i)) {
          emits('cross', {
            from: getBodyEventPayload(act.i as number, act.j as number),
            to: getBodyEventPayload(i, act.j as number),
          });
        }
      }
    }

    setTimeout(() => {
      emits('crossEnd');
      onCrossing.value = false;
      crossingSet.clear();
    }, 20);
  }

  return {
    MinWidth,
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
    isCellDroppable,
    computeCellWidth,
    clearActiveState,
    onResize: debounce(computeCellWidth, 200),
    onClickHeader,
    onClickBody,
    onClickOutside,
    onScroll: debounce(onScroll, 100),
    onKeyDown,
    onDragStart,
    onDragOver,
    onDrop,
    onMousedown,
    onMouseMove,
    onMouseup,
  };
};

export default useBiDimensionalGrid;
