export interface PlaywrightRuntimeConfig {
  baseURL: string;
  host: string;
  port: number;
  webServerCommand: string;
}

const DEFAULT_PLAYWRIGHT_HOST = '127.0.0.1';
const DEFAULT_PLAYWRIGHT_PORT = 3100;
const DEFAULT_PLAYWRIGHT_PROTOCOL = 'http';

/**
 * Builds the runtime configuration shared by Playwright's base URL and web server.
 *
 * @param env - Environment variables used to derive the Playwright runtime config
 * @returns The aligned runtime configuration for local and CI E2E runs
 * @throws {Error} When PLAYWRIGHT_PORT is not a positive integer
 */
export function getPlaywrightRuntimeConfig(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): PlaywrightRuntimeConfig {
  const host = env.PLAYWRIGHT_HOST ?? DEFAULT_PLAYWRIGHT_HOST;
  const protocol = env.PLAYWRIGHT_PROTOCOL ?? DEFAULT_PLAYWRIGHT_PROTOCOL;
  const rawPort = env.PLAYWRIGHT_PORT ?? String(DEFAULT_PLAYWRIGHT_PORT);
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PLAYWRIGHT_PORT must be a positive integer');
  }

  const baseURL = env.PLAYWRIGHT_BASE_URL ?? `${protocol}://${host}:${port}`;
  const webServerCommand =
    env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
    `npm run dev -- --hostname ${host} --port ${port}`;

  return {
    baseURL,
    host,
    port,
    webServerCommand,
  };
}
