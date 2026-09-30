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

import { ServiceTranslate } from '@/core/services';
import { EIcon } from '@/shared/enums';
import Button from '../../atoms/button/button.component';
import Icon from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, Icon, Button],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      #refModal
      [ngClass]="{
        modal: stateModal().isAppendedToBody,
        open: stateModal().isOpen,
        scrollable: stateModal().scrollable,
      }"
      [attr.aria-label]="title() || 'Modal'">
      <ng-container *ngIf="stateModal().isAppendedToBody">
        <button (click)="handleCancel.emit()">&nbsp;</button>

        <div [ngClass]="className()">
          <button class="close" *ngIf="isClose()" (click)="handleCancel.emit()">
            <app-icon [name]="EIcon.Close" />
          </button>

          <h3 *ngIf="title()">{{ title() }}</h3>

          <div class="body"><ng-content></ng-content></div>

          <ng-container *ngIf="isFooter()">
            <ng-container *ngIf="footerCustomTpl(); else elseBlock">
              <ng-container *ngTemplateOutlet="footerCustomTpl()!"></ng-container>
            </ng-container>

            <ng-template #elseBlock>
              <div class="footer">
                <app-button
                  [text]="textCancel() ?? t('Cancel')"
                  [isOutline]="true"
                  (handleClick)="handleCancel.emit()"></app-button>
                <app-button
                  [text]="textOkay() ?? t('Okay')"
                  (handleClick)="handleOkay.emit()"></app-button>
              </div>
            </ng-template>
          </ng-container>
        </div>
      </ng-container>
    </section>
  `,
  styleUrls: ['./modal.component.scss'],
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Messages' },
  ],
})
export default class Modal {
  EIcon = EIcon;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.#serviceTranslate.t()(key, params);

  readonly isOpen = input(false);
  readonly title = input();
  readonly className = input('');
  readonly handleCancel = output<void>();
  readonly handleOkay = output<void>();
  readonly isClose = input(true);
  readonly isFooter = input(true);
  readonly textCancel = input();
  readonly textOkay = input();
  readonly footerCustomTpl = contentChild<TemplateRef<HTMLElement>>('footerCustom');

  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  timeout?: ReturnType<typeof setTimeout>;
  constructor() {
    this.#fnEffect = effect(() => {
      if (this.isOpen()) {
        this.#fnShow();
      } else {
        this.#fnHide();
      }
    });
    this.#destroyRef.onDestroy(() => {
      if (this.timeout) clearTimeout(this.timeout);
      this.#fnEffect.destroy();
    });
  }

  readonly stateModal = signal({
    isAppendedToBody: !!this.isOpen(),
    isOpen: !!this.isOpen(),
    scrollable: false,
  });
  readonly refModal = viewChild<ElementRef<HTMLElement>>('refModal');
  readonly #renderer = inject(Renderer2);
  readonly #fnShow = () => {
    if (this.stateModal().isAppendedToBody) return;
    this.stateModal.set({ ...this.stateModal(), isAppendedToBody: true });
    this.#renderer.appendChild(document.body, this.refModal()!.nativeElement);
    setTimeout(() => {
      const scrollable = this.refModal()!.nativeElement.scrollHeight > window.innerHeight;
      this.stateModal.set({ ...this.stateModal(), isOpen: true, scrollable });
    }, 30);
  };

  readonly #fnHide = () => {
    this.refModal()!.nativeElement?.classList.remove('open');
    this.timeout = setTimeout(() => {
      this.#renderer.removeChild(document.body, this.refModal()!.nativeElement);
      this.stateModal.set({ ...this.stateModal(), isAppendedToBody: false, isOpen: false });
    }, 250);
  };
}
