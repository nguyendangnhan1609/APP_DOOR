/**
 * Represents the response object returned by an API request.
 */
export type TResponses<T> = {
  readonly statusCode?: 200 | 201 | 500 | 404;
  readonly message?: string;
  readonly data?: T;
  readonly meta?: {
    readonly pageIndex: number;
    readonly pageSize: number;
    readonly totalItemCount: number;
  };
};
