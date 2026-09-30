import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Renderer2,
  signal,
  viewChild,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';

import { EDialog, EIcon } from '@/shared/enums';
import Button from '../../atoms/button/button.component';
import Icon from '../../atoms/icon/icon.component';

type Props = {
  readonly title: string;
  readonly content?: string;
  readonly type?: EDialog;
  readonly onCancel?: () => void;
  readonly onOk?: () => void;
  readonly okText?: string;
  readonly cancelText?: string;
};

export let showDialog: (props: Props) => void;

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, Icon, Button],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      #refDialog
      [ngClass]="{
        dialog: stateDialog().isAppendedToBody,
        open: stateDialog().isOpen,
        scrollable: stateDialog().scrollable,
      }"
      [attr.aria-label]="stateDialog().title || 'Dialog'">
      <ng-container *ngIf="stateDialog().isAppendedToBody">
        <button (click)="fnHide()">&nbsp;</button>
        <div>
          <h3>
            <app-icon [name]="renderIcon()" [className]="renderColor()" />
            {{ stateDialog().title }}
          </h3>
          <div class="body">
            {{ stateDialog().content }}
          </div>
          <div class="footer">
            <app-button
              *ngIf="
                stateDialog().type === EDialog.Warning || stateDialog().type === EDialog.Confirm
              "
              [text]="stateDialog().cancelText"
              [isOutline]="true"
              (handleClick)="fnCancel()" />
            <app-button [text]="stateDialog().okText" (handleClick)="fnOk()" />
          </div>
        </div>
      </ng-container>
    </section>
  `,
  styleUrls: ['./dialog.component.scss'],
})
export default class Dialog {
  EDialog = EDialog;
  EIcon = EIcon;

  timeout?: ReturnType<typeof setTimeout>;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    showDialog = (props: Props) => {
      this.stateDialog.set({
        content: undefined,
        type: undefined,
        ...props,
        isOpen: false,
        isAppendedToBody: false,
        scrollable: false,
      });
      this.#fnShow();
    };
    this.#destroyRef.onDestroy(() => {
      if (this.timeout) clearTimeout(this.timeout);
    });
    this.refDialog()?.nativeElement.remove();
  }

  readonly stateDialog: WritableSignal<
    Props & { isOpen: boolean; isAppendedToBody: boolean; scrollable: boolean }
  > = signal({
    isOpen: false,
    title: '',
    isAppendedToBody: false,
    scrollable: false,
  });

  readonly refDialog = viewChild<ElementRef<HTMLElement>>('refDialog');
  readonly #renderer = inject(Renderer2);
  readonly #fnShow = () => {
    if (this.stateDialog().isAppendedToBody) return;
    this.stateDialog.set({ ...this.stateDialog(), isAppendedToBody: true });
    this.#renderer.appendChild(document.body, this.refDialog()!.nativeElement);
    setTimeout(() => {
      const scrollable = this.refDialog()!.nativeElement.scrollHeight > window.innerHeight;
      this.stateDialog.set({ ...this.stateDialog(), isOpen: true, scrollable });
    }, 30);
  };

  fnHide = () => {
    this.refDialog()!.nativeElement?.classList.remove('open');
    this.timeout = setTimeout(() => {
      this.#renderer.removeChild(document.body, this.refDialog()!.nativeElement);
      this.stateDialog.set({ ...this.stateDialog(), isAppendedToBody: false, isOpen: false });
    }, 250);
  };

  fnOk = () => {
    this.fnHide();
    this.stateDialog().onOk?.();
  };

  fnCancel = () => {
    this.fnHide();
    this.stateDialog().onCancel?.();
  };

  renderIcon = () => {
    switch (this.stateDialog().type) {
      case EDialog.Error:
        return EIcon.Error;
      case EDialog.Warning:
        return EIcon.Warning;
      case EDialog.Confirm:
        return EIcon.Confirm;
      default:
        return EIcon.Success;
    }
  };

  renderColor = () => {
    switch (this.stateDialog().type) {
      case EDialog.Error:
        return 'text-error-500';
      case EDialog.Warning:
        return 'text-warning-500';
      case EDialog.Confirm:
        return 'text-info-500';
      default:
        return 'text-success-500';
    }
  };
}
