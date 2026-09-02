import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The placeholder guard (ROADMAP 2.5) reports by printing. The default
    // reporter swallows stdout from passing tests, so let logs through.
    disableConsoleIntercept: true,
  },
});
