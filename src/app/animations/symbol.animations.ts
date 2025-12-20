import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {AnimationMode} from '../models/animation.model';


export const motionAnimation = trigger('motion', [
  state(AnimationMode.None, style({
    transform: 'translate(0, 0) scale(1)'
  })),

  state(AnimationMode.Move, style({
    transform: 'translate(calc({{x}} * {{tileSizePx}}), calc({{y}} * {{tileSizePx}})) scale(1)',
  }), { params: { x: '0px', y: '0px', tileSizePx: '64px' } }),

  state(AnimationMode.Creating, style({
    transform: 'translate(0, 0) scale(1)',
    opacity: 1,
  })),

  transition(`${AnimationMode.None} => ${AnimationMode.Move}`, animate('300ms ease-in-out')),
  transition(`${AnimationMode.Move} => ${AnimationMode.None}`, animate('0ms')),

  transition(`${AnimationMode.None} => ${AnimationMode.Creating}`, [
    style({ opacity: 0, transform: 'translate(0, 0) scale(0.5)' }),
    animate('400ms ease-out', style({
        opacity: 1,
        transform: 'translate(0, 0) scale(1)', offset: 1
    })),
  ]),
  transition(`${AnimationMode.Creating} => ${AnimationMode.None}`, animate('0ms')),
]);


export const clearingAnimation = trigger('clearing', [
  state(AnimationMode.None, style({
    opacity: 1,
    filter: 'brightness(1)'
  })),

  state(AnimationMode.Clearing, style({
    opacity: 0,
    filter: 'brightness(1)'
  })),

  transition(`${AnimationMode.None} => ${AnimationMode.Clearing}`, [
    animate('400ms ease-out', keyframes([
      style({ opacity: 1, filter: 'brightness(2)', offset: 0 }),
      style({ opacity: 0.7, filter: 'brightness(1)', offset: 0.6 }),
      style({ opacity: 0, filter: 'brightness(1)', offset: 1 }),
    ]))
  ]),
  transition(`${AnimationMode.Move} => ${AnimationMode.Clearing}`, [
    animate('400ms ease-out', keyframes([
      style({ opacity: 1, filter: 'brightness(2)', offset: 0 }),
      style({ opacity: 0.7, filter: 'brightness(1)', offset: 0.6 }),
      style({ opacity: 0, filter: 'brightness(1)', offset: 1 }),
    ]))
  ]),
]);
