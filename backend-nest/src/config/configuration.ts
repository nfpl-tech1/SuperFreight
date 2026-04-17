export default () => ({
  port: parseInt(process.env.PORT ?? '8000', 10) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appDatabase: {
    host: process.env.APP_DB_HOST || process.env.DB_HOST || 'localhost',
    port:
      parseInt(process.env.APP_DB_PORT ?? process.env.DB_PORT ?? '5432', 10) ||
      5432,
    username:
      process.env.APP_DB_USERNAME || process.env.DB_USERNAME || 'postgres',
    password:
      process.env.APP_DB_PASSWORD || process.env.DB_PASSWORD || 'postgres',
    name: process.env.APP_DB_NAME || process.env.DB_NAME || 'superfreight_app',
    migrationsRun: process.env.APP_DB_MIGRATIONS_RUN
      ? process.env.APP_DB_MIGRATIONS_RUN === 'true'
      : process.env.DB_MIGRATIONS_RUN === 'true',
  },
  businessDatabase: {
    host:
      process.env.BUSINESS_DB_HOST ||
      process.env.APP_DB_HOST ||
      process.env.DB_HOST ||
      'localhost',
    port:
      parseInt(
        process.env.BUSINESS_DB_PORT ??
          process.env.APP_DB_PORT ??
          process.env.DB_PORT ??
          '5432',
        10,
      ) || 5432,
    username:
      process.env.BUSINESS_DB_USERNAME ||
      process.env.APP_DB_USERNAME ||
      process.env.DB_USERNAME ||
      'postgres',
    password:
      process.env.BUSINESS_DB_PASSWORD ||
      process.env.APP_DB_PASSWORD ||
      process.env.DB_PASSWORD ||
      'postgres',
    name: process.env.BUSINESS_DB_NAME || 'logistics_business_core',
    migrationsRun: process.env.BUSINESS_DB_MIGRATIONS_RUN
      ? process.env.BUSINESS_DB_MIGRATIONS_RUN === 'true'
      : process.env.DB_MIGRATIONS_RUN === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      'changeme-refresh-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    refreshCookieName:
      process.env.JWT_REFRESH_COOKIE_NAME || 'sf_refresh_token',
  },
  os: {
    appSlug: process.env.OS_APP_SLUG || 'super-freight',
    backendUrl: process.env.OS_BACKEND_URL || 'http://localhost:3001',
    internalApiKey: process.env.INTERNAL_API_KEY || '',
    jwtPublicKey: process.env.OS_JWT_PUBLIC_KEY?.replace(/\\n/g, '\n') || '',
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri:
      process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/onboarding',
    webhookUrl: process.env.MICROSOFT_WEBHOOK_URL || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  },
  initialSuperadminEmail: process.env.INITIAL_SUPERADMIN_EMAIL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});
