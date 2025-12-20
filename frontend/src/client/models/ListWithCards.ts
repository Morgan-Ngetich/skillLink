/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoardList } from './BoardList';
import type { CardPublic } from './CardPublic';
/**
 * BoardList with its cards
 */
export type ListWithCards = {
    boardlist: BoardList;
    cards?: Array<CardPublic>;
    readonly card_count: number;
};

