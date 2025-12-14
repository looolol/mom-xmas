import {animate, state, style, transition, trigger} from '@angular/animations';

export const dropAnimation = trigger('drop', [
  state('falling', style({ transform: 'translateY(0)', opacity: 1 })),
  state('landed', style( {transform: 'translateY(0)', opacity: 1 })),

  transition('void => falling', [
    style({ transform: 'translateY({{offset}})', opacity: 0 }),
    animate('400ms ease-out')
  ], { params: { offset: '-100%' }}),

  transition('falling => landed', [
    animate('200ms ease-in')
  ]),

  transition('landed => falling', [
    style({ transform: 'translateY({{offset}})', opacity: 0 }),
    animate('400ms 100ms ease-out')
  ], { params: { offset: '-100%' }}),

]);
