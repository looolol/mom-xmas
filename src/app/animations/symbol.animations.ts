import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {AnimationPhase} from './models/animation.model';


export const motionAnimation = trigger('motion', [
  state(AnimationPhase.None, style({
    transform: 'translate(0, 0) scale(1)'
  })),

  state(AnimationPhase.Move, style({
    transform: 'translate(calc({{x}} * {{tileSizePx}}), calc({{y}} * {{tileSizePx}})) scale(1)',
  }), { params: { x: '0px', y: '0px', tileSizePx: '64px' } }),

  state(AnimationPhase.Creating, style({
    transform: 'translate(0, 0) scale(1)',
    opacity: 1,
  })),

  state(AnimationPhase.FadeOut, style({
    opacity: 0,
    transform: 'scale(0.8)',
  })),

  state(AnimationPhase.FadeIn, style({
    opacity: 1,
    transform: 'scale(1)'
  })),

  transition(`${AnimationPhase.None} => ${AnimationPhase.Move}`, animate('300ms ease-in-out')),
  transition(`${AnimationPhase.Move} => ${AnimationPhase.None}`, animate('0ms')),

  transition(`${AnimationPhase.None} => ${AnimationPhase.Creating}`, [
    style({ opacity: 0, transform: 'translate(0, 0) scale(0.5)' }),
    animate('400ms ease-out', style({
        opacity: 1,
        transform: 'translate(0, 0) scale(1)', offset: 1
    })),
  ]),
  transition(`${AnimationPhase.Creating} => ${AnimationPhase.None}`, animate('0ms')),

  transition(`${AnimationPhase.None} => ${AnimationPhase.FadeOut}`, [
    animate('400ms ease-in')
  ]),
  transition(`${AnimationPhase.FadeOut} => ${AnimationPhase.None}`, [
    animate('0ms')
  ]),

  transition(`${AnimationPhase.None} => ${AnimationPhase.FadeIn}`, [
    style({ opacity: 0, transform: 'scale(0.8)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(`${AnimationPhase.FadeIn} => ${AnimationPhase.None}`, animate('0ms')),
]);


export const clearingAnimation = trigger('clearing', [
  state(AnimationPhase.None, style({
    opacity: 1,
    filter: 'brightness(1)'
  })),

  state(AnimationPhase.Clearing, style({
    opacity: 0,
    filter: 'brightness(1)'
  })),

  transition(`${AnimationPhase.None} => ${AnimationPhase.Clearing}`, [
    animate('400ms ease-out', keyframes([
      style({ opacity: 1, filter: 'brightness(2)', offset: 0 }),
      style({ opacity: 0.7, filter: 'brightness(1)', offset: 0.6 }),
      style({ opacity: 0, filter: 'brightness(1)', offset: 1 }),
    ]))
  ]),
  transition(`${AnimationPhase.Move} => ${AnimationPhase.Clearing}`, [
    animate('400ms ease-out', keyframes([
      style({ opacity: 1, filter: 'brightness(2)', offset: 0 }),
      style({ opacity: 0.7, filter: 'brightness(1)', offset: 0.6 }),
      style({ opacity: 0, filter: 'brightness(1)', offset: 1 }),
    ]))
  ]),
]);


export const fadeAnimation = trigger('fade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('400ms ease-in', style({ opacity: 0 }))
  ])
]);
