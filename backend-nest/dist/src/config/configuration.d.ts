declare const _default: () => {
    port: number;
    nodeEnv: string;
    appDatabase: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        migrationsRun: boolean;
    };
    businessDatabase: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        migrationsRun: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
        refreshCookieName: string;
    };
    os: {
        appSlug: string;
        backendUrl: string;
        internalApiKey: string;
        jwtPublicKey: string;
    };
    microsoft: {
        clientId: string | undefined;
        tenantId: string | undefined;
        clientSecret: string | undefined;
        redirectUri: string;
        webhookUrl: string;
    };
    gemini: {
        apiKey: string;
        model: string;
    };
    quoteIntake: {
        enabled: boolean;
        pollIntervalMs: number;
        overlapSeconds: number;
        initialLookbackHours: number;
        batchSize: number;
    };
    initialSuperadminEmail: string | undefined;
    frontendUrl: string;
};
export default _default;
