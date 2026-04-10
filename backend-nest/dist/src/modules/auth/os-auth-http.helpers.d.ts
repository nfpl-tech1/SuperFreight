import { ConfigService } from '@nestjs/config';
export declare function fetchFromOs(config: ConfigService, path: string): Promise<Response | null>;
export declare function postToOs(config: ConfigService, path: string, payload: Record<string, unknown>): Promise<Response | null>;
