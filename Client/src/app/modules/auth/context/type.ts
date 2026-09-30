import type { EStatusState } from '@/shared/enums';
import type { MUser } from '@/shared/models';

/**
 * Represents the global state of the application.
 */
type TState = {
  isLoading?: boolean;
  user?: MUser;
  data?: MUser;
  status?: EStatusState;
};

export default TState;
