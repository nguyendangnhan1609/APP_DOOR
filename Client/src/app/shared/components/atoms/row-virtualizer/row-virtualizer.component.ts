import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EffectRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { injectVirtualizer } from '@tanstack/angular-virtual';

@Component({
  selector: 'app-row-virtualizer',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #refContainer
      [ngClass]="['overflow-auto', className()]"
      (scroll)="handleScroll.emit($event)">
      <ng-container *ngIf="firstItemTpl()">
        <ng-container *ngTemplateOutlet="firstItemTpl()!"></ng-container>
      </ng-container>

      <div *ngIf="!isDisabled()" [style.height.px]="virtualizer.getTotalSize()">
        <div [ngStyle]="styleTransform()">
          <ng-container *ngFor="let virtualRow of items()">
            <div #refRow [attr.data-index]="virtualRow.index">
              <ng-container
                [ngTemplateOutlet]="renderTpl()"
                [ngTemplateOutletContext]="{
                  row: data() && data()[virtualRow.index],
                  index: virtualRow.index,
                }"></ng-container>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export default class RowVirtualizer<T> {
  readonly data = input<T[]>([]);
  readonly className = input('');
  readonly heightCell = input(28);
  readonly isOpen = input(false);
  readonly isDisabled = input(false);
  readonly handleScroll = output<Event>();
  readonly firstItemTpl = contentChild<TemplateRef<HTMLElement>>('firstItem');
  readonly renderTpl = contentChild.required<TemplateRef<{ row: T; index: number }>>('render');

  readonly #fnMeasureRows: EffectRef;
  readonly refRows = viewChildren<ElementRef<HTMLDivElement>>('refRow');
  readonly #fnEffect: EffectRef;
  #refScrollOffset = 0;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnMeasureRows = effect(() =>
      this.refRows().forEach(el => {
        this.virtualizer.measureElement(el.nativeElement);
      }),
    );

    this.#fnEffect = effect(() => {
      const count = this.data()?.length ?? 0;
      if (count !== this.virtualizer.options().count) {
        this.virtualizer.setOptions({
          ...this.virtualizer.options(),
          count: this.data()?.length ?? 0,
        });
        this.#refScrollOffset += 1;
      }

      if (!this.isDisabled()) {
        setTimeout(() => {
          this.virtualizer.scrollToOffset(this.#refScrollOffset);
        });
      } else {
        this.#refScrollOffset = this.virtualizer.scrollOffset() ?? 0;
      }
    });

    this.#destroyRef.onDestroy(() => {
      this.#fnMeasureRows.destroy();
      this.#fnEffect.destroy();
    });
  }

  readonly refContainer = viewChild<ElementRef<HTMLDivElement>>('refContainer');
  readonly virtualizer = injectVirtualizer(() => ({
    count: this.data()?.length ?? 0,
    scrollElement: this.refContainer(),
    estimateSize: () => this.heightCell() ?? 28,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element: Element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  }));

  readonly items = computed(() => this.virtualizer.getVirtualItems());
  readonly styleTransform = computed(() => ({
    transform: 'translateY(' + (this.items()[0]?.start ?? 0) + 'px)',
  }));
}
