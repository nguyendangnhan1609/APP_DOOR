import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  effect,
  EffectRef,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  arrow,
  computePosition,
  flip,
  MiddlewareData,
  offset,
  shift,
  type Placement,
} from '@floating-ui/dom';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #refTrigger
      [ngClass]="['tooltip-container', classContainer()]"
      (click)="fnClick({ event: $event, isAllow: !!isClick() })"
      (keydown)="fnClick({ event: $event, isAllow: !!isClick() })"
      (mouseenter)="fnHover(true)"
      (mouseleave)="fnHover(false)"
      (contextmenu)="fnClick({ event: $event, isAllow: !!isRightClick(), isClick: false })"
      role="none">
      <ng-content></ng-content>
      <ng-container>
        <div
          #refTooltip
          [ngClass]="['tooltip', className()]"
          [ngStyle]="{
            width: isWidthFull() ? this.refTrigger()!.nativeElement.offsetWidth + 'px' : 'auto',
          }">
          <ng-container *ngIf="contentTpl() && !content()">
            <ng-container *ngTemplateOutlet="contentTpl()!"></ng-container>
          </ng-container>
          {{ content() }}
          <div class="arrow" #refArrow *ngIf="isArrow()"></div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./tooltip.component.scss'],
})
export default class Tooltip {
  readonly placement = input<Placement>('top');
  readonly className = input('');
  readonly classContainer = input('');
  readonly isArrow = input(true);
  readonly isClick = input(false);
  readonly isWidthFull = input(false);
  readonly isOpen = input(false);
  readonly isRightClick = input(false);
  readonly isDisabled = input(false);
  readonly content = input('');
  readonly handleOpen = output<boolean>();
  readonly handleClick = output<Event>();
  readonly contentTpl = contentChild<TemplateRef<HTMLElement>>('content');

  readonly #fnEffect: EffectRef;
  readonly #fnEffectOutside: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      if (this.stateTooltip().isOpen) {
        this.fnShow();
      }
    });
    this.#fnEffectOutside = effect(() => {
      if (this.isOpen() !== undefined) {
        this.stateTooltip.set({ isOpen: this.isOpen() });
      }
      this.refTooltip()?.nativeElement.remove();
    });
    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
      this.#fnEffectOutside.destroy();
    });
  }

  readonly stateTooltip = signal({ isOpen: false });
  fnClick = ({
    event,
    isAllow,
    isClick = true,
  }: {
    event: Event;
    isAllow: boolean;
    isClick?: boolean;
  }) => {
    if (!this.isDisabled() && isAllow) {
      event.preventDefault();
      if (!this.stateTooltip().isOpen) {
        this.fnShow();
      } else {
        this.fnHide();
      }
    }
    if (isClick) this.handleClick.emit(event);
  };

  fnHover = (isHover: boolean) => {
    if (!this.isDisabled() && !this.isRightClick() && !this.isClick()) {
      if (isHover) {
        this.fnShow();
      } else {
        this.fnHide();
      }
    }
  };

  readonly #renderer = inject(Renderer2);
  fnShow = async () => {
    if (this.stateTooltip().isOpen) return;
    this.stateTooltip.set({ ...this.stateTooltip(), isOpen: true });
    this.#renderer.appendChild(document.body, this.refTooltip()?.nativeElement);
    await this.#fnUpdatePosition();
    setTimeout(async () => {
      await this.#fnUpdatePosition();
      this.handleOpen.emit(true);
    });

    if (!this.isClick() && !this.isRightClick()) return;
    document.addEventListener('mousedown', this.#fnClickOutside);
  };

  fnHide = () => {
    this.stateTooltip.set({ ...this.stateTooltip(), isOpen: false });
    if (this.refTooltip()?.nativeElement) {
      this.#renderer.removeChild(document.body, this.refTooltip()?.nativeElement);
    }
    this.handleOpen.emit(false);

    if (!this.isClick() && !this.isRightClick()) return;
    document.removeEventListener('mousedown', this.#fnClickOutside);
  };

  readonly refTrigger = viewChild<ElementRef<HTMLElement>>('refTrigger');
  readonly refTooltip = viewChild<ElementRef<HTMLElement>>('refTooltip');
  readonly #fnClickOutside = (event: MouseEvent) => {
    if (
      this.refTooltip()?.nativeElement &&
      !this.refTooltip()?.nativeElement.contains(event.target as Node) &&
      !this.refTrigger()?.nativeElement.contains(event.target as Node)
    ) {
      this.fnHide();
    }
  };

  readonly refArrow = viewChild<ElementRef<HTMLElement>>('refArrow');
  readonly #fnUpdatePosition = async () => {
    if (this.refTrigger() && this.refTooltip()?.nativeElement) {
      const middleware = [offset(this.isArrow() ? 8 : 2), flip(), shift()];
      if (this.isArrow() && this.refArrow()?.nativeElement) {
        middleware.push(arrow({ element: this.refArrow()!.nativeElement }));
      }
      const {
        x,
        y,
        strategy,
        middlewareData,
        placement: placementPosition,
      } = await computePosition(
        this.refTrigger()!.nativeElement,
        this.refTooltip()!.nativeElement,
        {
          placement: this.placement(),
          middleware,
        },
      );
      Object.assign(this.refTooltip()!.nativeElement.style, {
        position: strategy,
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 1000,
        opacity: 1,
      });

      this.#fnPositionArrowIfNeeded(middlewareData, placementPosition);
    }
  };

  readonly #fnPositionArrowIfNeeded = (
    middlewareData: MiddlewareData,
    placementPosition: string,
  ) => {
    if (this.isArrow() && this.refArrow()?.nativeElement && middlewareData.arrow) {
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placementPosition.split('-')[0]];

      Object.assign(this.refArrow()!.nativeElement.style, {
        left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : '',
        top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : '',
        right: '',
        bottom: '',
        [staticSide!]: '-6px',
        transform: this.#fnGetArrowTransform(placementPosition),
      });
    }
  };

  readonly #fnGetArrowTransform = (placement: string): string => {
    const base = 'rotate(45deg)';
    switch (placement.split('-')[0]) {
      case 'top':
        return base;
      case 'bottom':
        return 'rotate(225deg)';
      case 'left':
        return 'rotate(135deg)';
      case 'right':
        return 'rotate(-45deg)';
      default:
        return base;
    }
  };
}
