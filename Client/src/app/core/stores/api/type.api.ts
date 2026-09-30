type Props<TData, TParam> = {
  url: string;
  valueParam?: string;
  keyParam: keyof TParam | keyof TData;
  isAddParamEmpty?: boolean;
};
export default Props;
