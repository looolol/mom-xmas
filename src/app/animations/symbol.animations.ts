import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {AnimationMode} from '../models/animation.model';

export const dropAnimation = trigger('drop', [
  state(AnimationMode.Falling, style({ transform: 'translateY(0)', opacity: 1 })),
  state(AnimationMode.Landing, style( {transform: 'translateY(0)', opacity: 1 })),

  transition(AnimationMode.None + " => " + AnimationMode.Falling, [
    style({ transform: 'translateY({{offset}})', opacity: 0 }),
    animate('400ms ease-out')
  ], { params: { offset: '-100%' }}),

  transition(AnimationMode.Falling + " => " + AnimationMode.Landing, [
    animate('100ms ease-in')
  ]),

  transition(AnimationMode.Landing + " => " + AnimationMode.Falling, [
    style({ transform: 'translateY({{offset}})', opacity: 0 }),
    animate('400ms 100ms ease-out')
  ], { params: { offset: '-100%' }}),
]);

export const swapAnimation = trigger('swap', [
  state(AnimationMode.None, style({ transform: 'translate(0, 0)' })),

  transition(AnimationMode.None + " => " + AnimationMode.Swapping, [
    animate('300ms ease-in-out', style({ transform: 'translate({{x}}, {{y}}'}))
  ], { params: { x: 0, y: 0 }}),

  transition(AnimationMode.Swapping + " => " + AnimationMode.None, [
    animate('300ms ease-in-out', style({ transform: 'translate(0, 0)'}))
  ]),
]);

export const clearingAnimation = trigger('clearing', [
  transition(AnimationMode.None + " => " + AnimationMode.Clearing, [
    animate('400ms ease-out', keyframes([
      style({ opacity: 1, filter: 'brightness(2)', transform: 'scale(1) rotate(0deg)', offset: 0 }),
      style({ opacity: 1, filter: 'brightness(1)', transform: 'scale(1.2) rotate(15deg)', offset: 0.15 }),

      style({ opacity: 0.7, filter: 'brightness(1)', transform: 'scale(1.5) rotate(-10deg)', offset: 0.6 }),
      style({ opacity: 0, filter: 'brightness(1)', transform: 'scale(2) rotate(45deg)', offset: 1 }),
    ])),
  ]),

  transition(AnimationMode.Clearing + " => " + AnimationMode.None, [
    style({ opacity: 1, filter: 'brightness(1)', transform: 'scale(1) rotate(0deg)' }),
  ]),
]);
