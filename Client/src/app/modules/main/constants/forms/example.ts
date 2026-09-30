import { EFormRuleType, EFormType } from '@/shared/enums';
import type { TFieldForm } from '@/shared/types';
import type { MExample } from '../../models';

export const form = (): TFieldForm<MExample>[] => [
  {
    name: 'hidden',
    title: 'Hidden',
    type: EFormType.Hidden,
    rules: [{ type: EFormRuleType.Required }],
  },
  {
    name: 'title',
    title: 'Text',
    type: EFormType.Text,
    rules: [{ type: EFormRuleType.Required }],
  },
  {
    name: 'number',
    title: 'Number',
    type: EFormType.Number,
    rules: [{ type: EFormRuleType.Required }],
  },
  {
    name: 'url',
    title: 'Password',
    type: EFormType.Password,
    rules: [{ type: EFormRuleType.Required }],
  },
  {
    name: 'thumbnailUrl',
    title: 'Textarea',
    type: EFormType.Textarea,
    rules: [{ type: EFormRuleType.Required }],
  },
  {
    name: 'albumId',
    title: 'Radio',
    type: EFormType.Radio,
    rules: [{ type: EFormRuleType.Required }],
    options: [
      { value: '1', label: 'Label Radio 1' },
      { value: '2', label: 'Label Radio 2' },
    ],
  },
  {
    name: 'id',
    title: 'Checkbox',
    type: EFormType.Checkbox,
    rules: [{ type: EFormRuleType.Required }],
    options: [
      { value: '1', label: 'Label Checkbox 1' },
      { value: '2', label: 'Label Checkbox 2' },
    ],
  },
  {
    name: 'date',
    title: 'Date',
    type: EFormType.Date,
    rules: [{ type: EFormRuleType.Required }],
  },
  // {
  //   name: 'date_range',
  //   title: 'Date Range',
  //   type: EFormType.DateRange,
  //   rules: [{ type: EFormRuleType.Required }],
  // },
  {
    name: 'select',
    title: 'Select',
    type: EFormType.Select,
    rules: [{ type: EFormRuleType.Required }],
    options: [
      { value: '1', label: 'Label Select 1' },
      { value: '2', label: 'Label Select 2' },
    ],
  },
  {
    name: 'upload',
    title: 'Upload',
    type: EFormType.Upload,
    rules: [{ type: EFormRuleType.Required }],
  },
  // {
  //   name: 'tab',
  //   title: 'Language',
  //   type: EFormType.Tab,
  //   tab: 'language',
  //   list: [
  //     { label: t('English'), value: 'en' },
  //     { label: t('Vietnamese'), value: 'vi' },
  //   ],
  //   fields: [
  //     {
  //       title: t('Textarea 1'),
  //       name: 'title',
  //       type: EFormType.Editor,
  //     },
  //   ],
  // },
];

export default form;
