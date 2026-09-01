import { Logger } from "homebridge";
import { TuyaIRConfiguration } from "../model/TuyaIRConfiguration";
import { BaseHelper } from "./BaseHelper";
export declare class LoginHelper extends BaseHelper {
    private static _instance;
    private accessToken;
    private refreshToken;
    private retryCount;
    private refreshInProgress;
    private refreshTimer;
    private constructor();
    static Instance(config: TuyaIRConfiguration, log: Logger): LoginHelper;
    getAccessToken(): string;
    login(): Promise<void>;
    private invokeTuyaLoginAPI;
    /**
     * Refresh the access token. Returns a Promise so callers can await it.
     * Multiple concurrent callers share the same in-flight request.
     */
    refreshAccessToken(): Promise<void>;
    private doRefresh;
    /**
     * Schedule the proactive (timer-based) token refresh that fires before
     * the token expires. Cancels any previously scheduled refresh.
     */
    private scheduleProactiveRefresh;
    private extractAccessTokenFromAPIResponse;
    /**
     * Called when login fails. Logs the error and increments backoff state.
     * Retry scheduling is handled by the caller (TuyaIRDiscovery) to ensure
     * the discovery chain stays connected.
     */
    private handleLoginError;
}
//# sourceMappingURL=LoginHelper.d.ts.map