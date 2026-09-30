import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  EffectRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { ServiceTranslate } from '@/core/services';
import { EIcon } from '@/shared/enums';
import Icon from '../../atoms/icon/icon.component';
import EntryMask from '../entry/mask/mask.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [Icon, EntryMask],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search">
      <app-entry-mask
        #inputRef
        [value]="stateSearch().value ?? ''"
        [placeholder]="t('Search')"
        (handleChange)="fnChange()"
        (handlePressEnter)="fnPressEnter()"
        name="search">
      </app-entry-mask>
      <button (click)="fnClick()">
        <app-icon [name]="stateSearch() ? EIcon.Close : EIcon.Search"></app-icon>
      </button>
    </div>
  `,
  styleUrls: ['./search.component.scss'],
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class SearchComponent {
  EIcon = EIcon;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.#serviceTranslate.t()(key, params);

  readonly value = input('');
  readonly handleChange = output<string | undefined>();

  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      this.stateSearch.set({ ...this.stateSearch(), value: this.value() });
    });
    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
    });
  }

  readonly stateSearch = signal<{ value: string | undefined }>({ value: this.value() });
  readonly inputRef = viewChild<ElementRef<{ input: HTMLInputElement }>>('inputRef');
  fnPressEnter = () => {
    const val = this.inputRef()?.nativeElement?.input?.value?.trim();
    this.handleChange.emit(val);
    this.stateSearch.set({ ...this.stateSearch(), value: val });
  };

  timeoutSearch?: number;
  fnChange = () => {
    if (this.timeoutSearch) clearTimeout(this.timeoutSearch);
    this.timeoutSearch = window.setTimeout(() => this.fnPressEnter(), 500);
  };
  fnClick = () => {
    if (this.stateSearch()) {
      this.stateSearch.set({ ...this.stateSearch(), value: undefined });
      this.handleChange.emit(undefined);
    } else {
      this.fnPressEnter();
    }
  };
}
