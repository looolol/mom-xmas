import {animate, state, style, transition, trigger} from '@angular/animations';
import {AnimationMode} from '../models/animation.model';

export const dropAnimation = trigger('drop', [
  state('falling', style({ transform: 'translateY(0)', opacity: 1 })),
  state('landed', style( {transform: 'translateY(0)', opacity: 1 })),

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
  state('default', style({ transform: 'translate(0, 0)' })),

  transition(AnimationMode.None + " => " + AnimationMode.Swapping, [
    animate('300ms ease-in-out', style({ transform: 'translate({{x}}px, {{y}}px'}))
  ]),

  transition(AnimationMode.Swapping + " => " + AnimationMode.None, [
    animate('300ms ease-in-out', style({ transform: 'translate(0, 0)'}))
  ]),
]);
