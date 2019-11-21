import { TestConfig, BuildInfo, MachineInfo } from "aft-core";

export module BrowserStackConfig {
    export const USER_KEY = 'browserstack_user';
    export const ACCESSKEY_KEY = 'browserstack_accesskey';
    export const USE_VPN_KEY = 'browserstack_use_vpn';
    export const HUB_URL_KEY = 'browserstack_url';
    export const LOCAL_ID_KEY = 'browserstack_local_id';

    export async function user(user?: string): Promise<string> {
        if (user) {
            TestConfig.setGlobalValue(USER_KEY, user);
        }
        return await TestConfig.getValueOrDefault(USER_KEY);
    }

    export async function accessKey(key?: string): Promise<string> {
        if (key) {
            TestConfig.setGlobalValue(ACCESSKEY_KEY, key);
        }
        return await TestConfig.getValueOrDefault(ACCESSKEY_KEY);
    }

    export async function useVpn(useVpn?: boolean): Promise<boolean> {
        if (useVpn !== undefined && useVpn !== null) {
            TestConfig.setGlobalValue(USE_VPN_KEY, useVpn.toString());
        }
        let useVpnStr: string = await TestConfig.getValueOrDefault(USE_VPN_KEY, 'false');
        if (useVpnStr && useVpnStr.toLocaleLowerCase() == 'true') {
            return true;
        }
        return false;
    }

    export async function hubUrl(url?: string): Promise<string> {
        if (url) {
            TestConfig.setGlobalValue(HUB_URL_KEY, url);
        }
        return await TestConfig.getValueOrDefault(HUB_URL_KEY, 'https://hub-cloud.browserstack.com/wd/hub/');
    }

    export async function localIdentifier(id?: string): Promise<string> {
        if (id) {
            TestConfig.setGlobalValue(LOCAL_ID_KEY, id);
        }
        return await TestConfig.getValueOrDefault(LOCAL_ID_KEY);
    }
}