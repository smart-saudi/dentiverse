import { describe, expect, it } from 'vitest';

import { getPlaywrightRuntimeConfig } from '../../../playwright.config.helpers';

describe('getPlaywrightRuntimeConfig', () => {
  it('should default to a dedicated local E2E port', () => {
    const config = getPlaywrightRuntimeConfig({});

    expect(config.host).toBe('127.0.0.1');
    expect(config.port).toBe(3100);
    expect(config.baseURL).toBe('http://127.0.0.1:3100');
    expect(config.webServerCommand).toBe(
      'npm run dev -- --hostname 127.0.0.1 --port 3100',
    );
  });

  it('should keep the base URL and web server command aligned for env overrides', () => {
    const config = getPlaywrightRuntimeConfig({
      PLAYWRIGHT_HOST: 'localhost',
      PLAYWRIGHT_PORT: '4200',
      PLAYWRIGHT_PROTOCOL: 'https',
    });

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(4200);
    expect(config.baseURL).toBe('https://localhost:4200');
    expect(config.webServerCommand).toBe(
      'npm run dev -- --hostname localhost --port 4200',
    );
  });

  it('should throw for an invalid port value', () => {
    expect(() =>
      getPlaywrightRuntimeConfig({
        PLAYWRIGHT_PORT: 'not-a-number',
      }),
    ).toThrowError('PLAYWRIGHT_PORT must be a positive integer');
  });
});
