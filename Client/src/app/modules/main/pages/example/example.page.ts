import { ServiceTranslate } from '@/core/services';
import { sApi } from '@/core/stores';
import { Button, RowVirtualizer, Tooltip } from '@/shared/components/atoms';
import { Spin } from '@/shared/components/molecules';
import { DataGrid, FormModal } from '@/shared/components/organisms';
import { C_API } from '@/shared/constants';
import { TForm } from '@/shared/types';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import constants from '../../constants';
import { MExample } from '../../models';

@Component({
  selector: 'app-page-example',
  standalone: true,
  imports: [Spin, RowVirtualizer, FormModal, Button, Tooltip, DataGrid],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.page.html',
  providers: [
    ServiceTranslate,
    { provide: 'url', useFactory: ServiceTranslate, useValue: 'Pages/Example' },
  ],
})
export class PageExample {
  readonly serviceTranslate = inject(ServiceTranslate);
  t = (key: string, params?: Record<string, string>): string =>
    this.serviceTranslate.t()(key, params);

  readonly stateExample = signal({ isVisible: false });
  readonly list = sApi.useList<MExample, { id: string }>({
    url: C_API.Example,
    valueParam: '',
    keyParam: 'id',
  });
  readonly fields = constants.Forms.EXAMPLE();

  fnOpenModal = () => {
    console.log('Open Modal');
    this.stateExample.set({ ...this.stateExample(), isVisible: true });
  };
  fnCloseModal = () => {
    this.stateExample.set({ ...this.stateExample(), isVisible: false });
  };
  fnSubmit = ({ value }: { value?: MExample; formApi: TForm<MExample> }) => {
    console.log(value);
  };

  readonly columns = constants.Tables.EXAMPLE();
  readonly tableBody = {
    checkbox: {
      width: 44,
      isAsynchronous: true,
    },
  };

  handleSubmit = () => {
    console.log('Handle Submit');
    // Logic for handling submit action
  };
}
