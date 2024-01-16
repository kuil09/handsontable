import Core from '../../core';
import { CellProperties } from '../../settings';

export const RENDERER_TYPE: 'numeric';
export function numericRenderer(instance: Core, TD: HTMLTableCellElement, row: number, column: number, prop: string | number, value: any, cellProperties: CellProperties): void;
