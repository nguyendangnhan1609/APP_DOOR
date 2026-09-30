import { EIcon } from '../enums';

/**
 * Represents an item in a table filter list.
 */
export type TOption = {
  readonly value: string | number;
  readonly label: string;
  readonly icon?: EIcon;
  readonly disabled?: boolean;
  readonly isActive?: boolean;
  readonly children?: TOption[];
  readonly onClick?: () => void;
};
