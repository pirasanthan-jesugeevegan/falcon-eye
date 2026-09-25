import { SetMetadata } from '@nestjs/common';

export const DISABLED_IN_DEMO = 'disabledInDemo';

/**
 * Refused outright in demo mode. These routes store credentials and make the
 * server call caller-supplied URLs, so a public instance must not serve them.
 */
export const DisabledInDemo = () => SetMetadata(DISABLED_IN_DEMO, true);
