import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  EffectRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
declare const GLightbox: (options: { selector: string }) => { destroy: () => void };

let timeoutImage: ReturnType<typeof setTimeout>;
const lightbox: Record<string, { destroy: () => void } | undefined> = {};

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [href]="src()" [class]="'glightbox ' + (selector() || '')">
      <img
        [attr.width]="width()"
        [attr.height]="height()"
        [attr.alt]="alt()"
        [src]="src()"
        [class]="className()" />
    </a>
  `,
  styleUrls: ['./image.component.scss'],
})
export default class Image {
  readonly src = input('');
  readonly className = input('');
  readonly alt = input('');
  readonly width = input('');
  readonly height = input('');
  readonly selector = input('');

  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      this.#setupLightbox();
    });
    this.#destroyRef.onDestroy(() => {
      if (timeoutImage) clearTimeout(timeoutImage);
      const classLightbox = '.' + (this.selector() ?? 'glightbox');
      if (lightbox[classLightbox]) lightbox[classLightbox].destroy();
      this.#fnEffect.destroy();
    });
  }

  readonly #setupLightbox = () => {
    if (timeoutImage) {
      clearTimeout(timeoutImage);
    }
    timeoutImage = setTimeout(() => {
      const classLightbox = '.' + (this.selector() ?? 'glightbox');
      if (lightbox[classLightbox]) lightbox[classLightbox].destroy();
      lightbox[classLightbox] = GLightbox({ selector: classLightbox });
    }, 400);
  };
}
