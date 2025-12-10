import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {trigger, transition, style, animate, state, AnimationEvent} from '@angular/animations';



@Component({
  selector: 'app-tile',
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
  animations: [
    trigger('swapAnimation', [
      transition('* => left', [
        animate('300ms ease', style({ transform: 'translateX(-60px)' })),
      ]),
      transition('* => right', [
        animate('300ms ease', style({ transform: 'translateX(60px)' })),
      ]),
      transition('* => up', [
        animate('300ms ease', style({ transform: 'translateY(-60px)' })),
      ]),
      transition('* => down', [
        animate('300ms ease', style({ transform: 'translateY(60px)' })),
      ]),
      transition('* => none', [
        style({ transform: 'none' })
      ]),
    ]),
    trigger('fallAnimation', [
      transition('* => *', [
        style({
          transform: 'translateY(0)'
        }),
        animate('{{duration}}ms ease-out', style({
          transform: 'translateY({{endOffset}}px'
        })),
      ], { params: { duration: 400, endOffset: '0' } })
    ])

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileComponent {
  @Input() value: string | null = null;
  @Input() cleared = false;
  @Input() spawned = false;
  @Input() selected = false;
  @Input() swapping = false;
  @Input() swapDirection: 'left' | 'right' | 'up' | 'down' | null = null;
  @Input() fallDistance: number = 0;
  @Input() maxFallDistance: number = 0;

  @Output() fallAnimationDone = new EventEmitter<AnimationEvent>()

  handleClick() {
    // Could emit click event to parent if needed
  }

  onAnimationStart(event: AnimationEvent) {
    // console.log('Animation started:', event);
  }

  onAnimationDone(event: AnimationEvent) {
    // console.log('Animation done:', event);
    // You could emit an event to parent to signal animation done if needed
  }

  onFallAnimationDone(event: AnimationEvent) {
    this.fallAnimationDone.emit(event);
  }

  protected readonly Math = Math;
}
