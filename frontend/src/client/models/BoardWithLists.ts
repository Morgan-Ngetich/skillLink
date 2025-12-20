/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Board } from './Board';
import type { ListWithCards } from './ListWithCards';
/**
 * Board with nested lists and cards
 */
export type BoardWithLists = {
    board: Board;
    lists?: Array<ListWithCards>;
    readonly active_card_count: number;
};

