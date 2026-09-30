import { CommonModule } from '@angular/common';
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
import { v4 as uuidv4 } from 'uuid';

import { serviceFetch, serviceMessage, ServiceTranslate } from '@/core/services';
import { KEY_TOKEN } from '@/shared/constants';
import { EIcon, ESize } from '@/shared/enums';
import type { TFile } from '@/shared/types';
import { arrayMove } from '@/shared/utils';
import Button from '../../../atoms/button/button.component';
import Icon from '../../../atoms/icon/icon.component';
import Image from '../../../atoms/image/image.component';
import Spin from '../../spin/spin.component';

@Component({
  selector: 'app-entry-upload',
  standalone: true,
  imports: [CommonModule, Spin, Image, Icon, Button],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Components' },
  ],
})
export default class UploadComponent {
  EIcon = EIcon;
  ESize = ESize;
  readonly #serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.#serviceTranslate.t()(key, params);

  readonly value = input<(TFile | string)[]>([]);
  readonly showBtnDelete = input<(file: TFile | string) => boolean>(() => true);
  readonly method = input('post');
  readonly maxSize = input(40);
  readonly isMultiple = input(false);
  readonly api = input('/files');
  readonly accept = input('image/*');
  readonly validation = input<(file: File, listFiles: (TFile | string)[]) => Promise<boolean>>(
    async () => true,
  );
  readonly handleChange = output<(TFile | string)[]>();

  readonly stateEntryUpload = signal<{ listFiles: (TFile | string)[]; isLoading: boolean }>({
    listFiles: [],
    isLoading: false,
  });
  readonly #fnEffect: EffectRef;
  readonly #destroyRef = inject(DestroyRef);
  constructor() {
    this.#fnEffect = effect(() => {
      const value = this.value();
      let listFiles: (TFile | string)[] = typeof value === 'string' ? [value] : [];
      if (value && typeof value === 'object') {
        listFiles = value;
      }
      if (
        JSON.stringify(this.stateEntryUpload().listFiles) !== JSON.stringify(listFiles) &&
        this.stateEntryUpload().listFiles.filter(
          item => typeof item === 'object' && item.status === 'uploading',
        ).length === 0
      ) {
        this.stateEntryUpload.set({
          listFiles,
          isLoading: false,
        });
      }
    });

    this.#destroyRef.onDestroy(() => {
      this.#fnEffect.destroy();
    });
  }

  fnGetData = (file: TFile | string, key: keyof TFile) =>
    (typeof file === 'object' ? file[key] : file) as string;

  readonly refInput = viewChild<ElementRef<HTMLInputElement>>('inputRef');
  fnUpload = async (files: FileList | null) => {
    if (files) {
      for (const file of Array.from(files)) {
        if (this.maxSize() && file.size > (this.maxSize() ?? 40) * 1024 * 1024) {
          serviceMessage.error({
            title: 'Error',
            content: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}mb): ${this.t(
              'YouCanOnlyUploadUpToMB',
              { max: this.maxSize().toString() },
            )}`,
          });
        }

        if (
          (this.maxSize() && file.size > (this.maxSize() ?? 40) * 1024 * 1024) ||
          !(await (this.validation()?.(file, this.stateEntryUpload().listFiles) ?? true))
        ) {
          this.stateEntryUpload.set({
            isLoading: false,
            listFiles: this.stateEntryUpload().listFiles.filter(
              _item => typeof _item === 'object' && _item.name !== file.name,
            ),
          });

          return;
        }
        const thumbUrl = await this.#fnGetBase64(file);
        const dataFile = { name: file.name, path: thumbUrl, id: uuidv4(), status: 'uploading' };
        this.stateEntryUpload().listFiles = !this.isMultiple()
          ? [dataFile]
          : [...this.stateEntryUpload().listFiles, dataFile];
        this.stateEntryUpload().isLoading = true;

        this.#fnFormatData({ file, dataFile });
      }
    }
    if (this.refInput()!.nativeElement.value) this.refInput()!.nativeElement.value = '';
  };

  fnPaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const index in items) {
      const item = items[index];
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        const dataTransfer = new DataTransfer();
        if (blob) dataTransfer.items.add(blob);
        await this.fnUpload(dataTransfer.files);
      }
    }
  };

  fnMoveImage = async (index: number, new_index: number) => {
    if (this.isMultiple()) {
      const listFiles = arrayMove<TFile | string>(
        this.stateEntryUpload().listFiles,
        index,
        new_index,
      );
      this.stateEntryUpload().listFiles = listFiles;
      this.stateEntryUpload().isLoading = false;
      this.handleChange.emit(listFiles);
    }
  };

  fnClickUpload = () => this.refInput()!.nativeElement.click();

  fnConfirmDelete = (file: TFile | string) =>
    serviceMessage.confirm({
      content: this.t('AreYouSureWantDelete', {
        name: typeof file === 'object' ? file.name : file,
        label: this.t('File').toLowerCase(),
      }),
      onOk: () =>
        this.handleChange.emit(this.stateEntryUpload().listFiles.filter(_item => _item !== file)),
    });

  classBtnDelete = (index: number) => ({
    'btn-delete': true,
    'top-16':
      this.stateEntryUpload().listFiles.length > 1 &&
      index > 0 &&
      index < this.stateEntryUpload().listFiles.length - 1,
    'top-8':
      this.stateEntryUpload().listFiles.length > 1 &&
      (index === 0 || index === this.stateEntryUpload().listFiles.length - 1),
    'top-1': this.stateEntryUpload().listFiles.length === 1,
  });

  readonly #fnFormatData = async ({ file, dataFile }: { file: File; dataFile: TFile }) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    let data;
    try {
      data = (
        await serviceFetch.responsible<TFile>({
          url: this.api() ?? '/files',
          config: {
            ...serviceFetch.init(),
            method: this.method() ?? 'post',
            body: bodyFormData,
            headers: {
              authorization: 'Bearer ' + (localStorage.getItem(KEY_TOKEN) ?? ''),
              'Accept-Language': localStorage.getItem('i18nextLng') ?? '',
            },
          },
        })
      ).data;
    } catch (e) {
      console.error(e);
    }

    if (data) {
      const listFiles = this.isMultiple()
        ? this.stateEntryUpload().listFiles.map(item => {
            if (typeof item === 'object' && item.id === dataFile.id) {
              item = { ...item, ...data, status: 'done' };
            }
            return item;
          })
        : [{ ...data, status: 'done' }];
      this.stateEntryUpload.set({
        isLoading: false,
        listFiles,
      });
      this.handleChange?.emit(listFiles);
    } else {
      this.stateEntryUpload.set({
        isLoading: false,
        listFiles: this.stateEntryUpload().listFiles.filter(
          item => typeof item === 'object' && item.id !== dataFile.id,
        ),
      });
    }
  };

  readonly #fnGetBase64 = async (file: File): Promise<string> =>
    await new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.readAsDataURL(file);
    });
}
