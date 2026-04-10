import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function isAddressInUseError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'EADDRINUSE'
  );
}

async function isExistingFreightShaktiApi(port: number) {
  try {
    const apiRootResponse = await fetch(`http://127.0.0.1:${port}/api`);
    if (apiRootResponse.status === 404) {
      const body = (await apiRootResponse.json().catch(() => null)) as
        | { detail?: string; path?: string }
        | null;
      if (body?.path === '/api' && body.detail?.includes('Cannot GET /api')) {
        return true;
      }
    }

    const authProbeResponse = await fetch(
      `http://127.0.0.1:${port}/api/auth/me`,
    );
    if (authProbeResponse.status === 401) {
      const body = (await authProbeResponse.json().catch(() => null)) as
        | { detail?: string; path?: string }
        | null;
      return body?.path === '/api/auth/me';
    }

    return false;
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes live under /api to match the existing frontend contract.
  app.setGlobalPrefix('api');

  // Validate and strip any unknown fields from all request bodies.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Consistent error response shape across the whole API.
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS must be set before listen so browser preflight requests succeed.
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  console.log(
    'CORS origin:',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  );

  const port = Number(process.env.PORT ?? 8000);
  const host = process.env.HOST ?? '0.0.0.0';

  if (await isExistingFreightShaktiApi(port)) {
    console.log(
      `FreightShakti API is already running on http://localhost:${port}/api`,
    );
    await app.close();
    return;
  }

  try {
    await app.listen(port, host);
    console.log(`FreightShakti API running on http://${host}:${port}/api`);
  } catch (error) {
    if (
      isAddressInUseError(error) &&
      (await isExistingFreightShaktiApi(port))
    ) {
      console.log(
        `FreightShakti API is already running on http://localhost:${port}/api`,
      );
      await app.close();
      return;
    }

    await app.close();
    throw error;
  }
}

void bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
