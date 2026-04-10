"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
function isAddressInUseError(error) {
    return (error instanceof Error &&
        'code' in error &&
        error.code === 'EADDRINUSE');
}
async function isExistingFreightShaktiApi(port) {
    try {
        const apiRootResponse = await fetch(`http://127.0.0.1:${port}/api`);
        if (apiRootResponse.status === 404) {
            const body = (await apiRootResponse.json().catch(() => null));
            if (body?.path === '/api' && body.detail?.includes('Cannot GET /api')) {
                return true;
            }
        }
        const authProbeResponse = await fetch(`http://127.0.0.1:${port}/api/auth/me`);
        if (authProbeResponse.status === 401) {
            const body = (await authProbeResponse.json().catch(() => null));
            return body?.path === '/api/auth/me';
        }
        return false;
    }
    catch {
        return false;
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
    });
    console.log('CORS origin:', process.env.FRONTEND_URL || 'http://localhost:3000');
    const port = Number(process.env.PORT ?? 8000);
    const host = process.env.HOST ?? '0.0.0.0';
    if (await isExistingFreightShaktiApi(port)) {
        console.log(`FreightShakti API is already running on http://localhost:${port}/api`);
        await app.close();
        return;
    }
    try {
        await app.listen(port, host);
        console.log(`FreightShakti API running on http://${host}:${port}/api`);
    }
    catch (error) {
        if (isAddressInUseError(error) &&
            (await isExistingFreightShaktiApi(port))) {
            console.log(`FreightShakti API is already running on http://localhost:${port}/api`);
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
//# sourceMappingURL=main.js.map