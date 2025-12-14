import {animate, style, transition, trigger} from '@angular/animations';

export const symbolMode = trigger('symbolMove', [
  transition('* => *', [
    animate('200ms cubic-bezier(0.2, 0, 0.2, 1')
  ])
]);

export const symbolRemove = trigger('symbolRemove', [
  transition('* => true', [
    animate('150ms ease-in', style({
      transform: 'scale(0)',
      opacity: 0
    }))
  ])
]);
