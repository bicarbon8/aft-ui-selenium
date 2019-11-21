import { TestConfig } from "aft-core";

export module SauceLabsConfig {
    export const USERNAME_KEY = 'sauce_username';
    export const ACCESS_KEY_KEY = 'sauce_access_key';
    export const USE_CONNECT_VPN_KEY = 'sauce_use_vpn';
    export const HUB_URL_KEY = 'sauce_url';
    export const TUNNEL_ID_KEY = 'sauce_tunnel_id';

    export async function user(username?: string): Promise<string> {
        if (username) {
            TestConfig.setGlobalValue(USERNAME_KEY, username);
        }
        return await TestConfig.getValueOrDefault(USERNAME_KEY);
    }

    export async function accessKey(accessKey?: string): Promise<string> {
        if (accessKey) {
            TestConfig.setGlobalValue(ACCESS_KEY_KEY, accessKey);
        }
        return await TestConfig.getValueOrDefault(ACCESS_KEY_KEY);
    }

    export async function useVpn(useVpn?: boolean): Promise<boolean> {
        if (useVpn !== undefined && useVpn !== null) {
            TestConfig.setGlobalValue(USE_CONNECT_VPN_KEY, useVpn.toString());
        }
        let useVpnStr: string = await TestConfig.getValueOrDefault(USE_CONNECT_VPN_KEY, 'false');
        if (useVpnStr && useVpnStr.toLocaleLowerCase() == 'true') {
            return true;
        }
        return false;
    }

    export async function hubUrl(url?: string): Promise<string> {
        if (url) {
            TestConfig.setGlobalValue(HUB_URL_KEY, url);
        }
        return await TestConfig.getValueOrDefault(HUB_URL_KEY, 'https://ondemand.us-east-1.saucelabs.com/wd/hub/');
    }
    
    export async function tunnelIdentifier(id?: string): Promise<string> {
        if (id) {
            TestConfig.setGlobalValue(TUNNEL_ID_KEY, id);
        }
        return await TestConfig.getValueOrDefault(TUNNEL_ID_KEY);
    }
}