import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {AnimationRenderMode} from '../models/animation.model';


/**
 * DROP / FALL ANIMATION
 */
export const dropAnimation = trigger('drop', [
  state(AnimationRenderMode.None, style({
    transform: 'translateY(0)',
    opacity: 1
  })),

  state(AnimationRenderMode.Falling, style({
    transform: 'translateY(0)',
    opacity: 1
  })),

  transition(
    `${AnimationRenderMode.None} => ${AnimationRenderMode.Falling}`,
    [
      style({
        transform: 'translateY({{offset}})',
        opacity: 0
      }),
      animate('400ms ease-out')
    ],
    { params: { offset: '-100%' } }
  ),

  transition(
    `${AnimationRenderMode.Falling} => ${AnimationRenderMode.None}`,
    [
      animate('100ms ease-in')
    ]
  )
]);

/**
 * SWAP ANIMATION
 */
export const swapAnimation = trigger('swap', [
  state(AnimationRenderMode.None, style({
    transform: 'translate(0, 0)'
  })),

  state(AnimationRenderMode.Swapping, style({
    transform: 'translate({{x}}, {{y}})'
  }), { params: { x: '0px', y: '0px' } }),

  transition(
    `${AnimationRenderMode.None} => ${AnimationRenderMode.Swapping}`,
    [
      animate('300ms ease-in-out')
    ]
  ),

  transition(
    `${AnimationRenderMode.Swapping} => ${AnimationRenderMode.None}`,
    [
      animate('300ms ease-in-out')
    ]
  )
]);

/**
 * CLEARING ANIMATION
 */
export const clearingAnimation = trigger('clearing', [
  state(AnimationRenderMode.None, style({
    opacity: 1,
    filter: 'brightness(1)',
    transform: 'scale(1) rotate(0deg)'
  })),

  state(AnimationRenderMode.Clearing, style({
    opacity: 0,
    transform: 'scale(2) rotate(45deg)'
  })),

  transition(
    `${AnimationRenderMode.None} => ${AnimationRenderMode.Clearing}`,
    [
      animate('400ms ease-out', keyframes([
        style({
          opacity: 1,
          filter: 'brightness(2)',
          transform: 'scale(1) rotate(0deg)',
          offset: 0
        }),
        style({
          opacity: 1,
          filter: 'brightness(1)',
          transform: 'scale(1.2) rotate(15deg)',
          offset: 0.15
        }),
        style({
          opacity: 0.7,
          filter: 'brightness(1)',
          transform: 'scale(1.5) rotate(-10deg)',
          offset: 0.6
        }),
        style({
          opacity: 0,
          filter: 'brightness(1)',
          transform: 'scale(2) rotate(45deg)',
          offset: 1
        }),
      ]))
    ]
  ),

  transition(
    `${AnimationRenderMode.Clearing} => ${AnimationRenderMode.None}`,
    []
  )
]);
