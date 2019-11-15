import { TestConfig, BuildInfo, MachineInfo } from "aft-core";

export module BrowserStackConfig {
    export const USER_KEY = 'browserstack_user';
    export const ACCESSKEY_KEY = 'browserstack_accesskey';
    export const USE_VPN_KEY = 'browserstack_use_vpn';
    export const HUB_URL_KEY = 'browserstack_url';

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
        return await TestConfig.getValueOrDefault(HUB_URL_KEY, 'http://hub-cloud.browserstack.com/wd/hub/');
    }

    export async function buildName(): Promise<string> {
        let job: string = await BuildInfo.name();
        if (job) {
            job = formatString(job);
            let build: string = await BuildInfo.name();
            build = formatString(build);
            return `${job}_${build}`;
        } else {
            let username: string = formatString(await MachineInfo.user());
            let machine: string = formatString(await MachineInfo.name());
            let d = new Date();
            let month: number = d.getUTCMonth() + 1;
            let monthStr: string = month.toString();
            if (month < 10) {
                monthStr = '0' + month;
            }
            let day: number = d.getUTCDate();
            let dayStr: string = day.toString();
            if (day < 10) {
                dayStr = '0' + day;
            }
            let now: string = formatString(`${d.getUTCFullYear()}${monthStr}${dayStr}`);
            return `${username}_${machine}_${now}`;
        }
    }

    function formatString(input: string): string {
        return input.replace(/[\()\;\\\/\|\<\>""'*&^%$#@!,.\-\+_=\?]/gi, '');
    }
}