import { TestConfig } from "aft-core";

export module SeleniumGridConfig {
    export const HUB_URL_KEY = 'selenium_grid_url';
    export const ADDITIONAL_CAPABILITIES_KEY = 'additional_capabilities';
    export const ELEMENT_LOOKUP_DURATION_KEY = 'element_lookup_duration';

    export async function hubUrl(url?: string): Promise<string> {
        if (url) {
            TestConfig.setGlobalValue(HUB_URL_KEY, url);
        }
        return await TestConfig.getValueOrDefault(HUB_URL_KEY);
    }

    export async function additionalCapabilities(capabilities?: {}): Promise<{}> {
        if (capabilities) {
            TestConfig.setGlobalValue(ADDITIONAL_CAPABILITIES_KEY, JSON.stringify(capabilities));
        }
        let addtlCapsStr: string = await TestConfig.getValueOrDefault(ADDITIONAL_CAPABILITIES_KEY);
        if (addtlCapsStr) {
            return JSON.parse(addtlCapsStr);
        }
        return null;
    }

    export async function elementLookupDuration(duration?: number): Promise<number> {
        if (duration) {
            TestConfig.setGlobalValue(ELEMENT_LOOKUP_DURATION_KEY, duration.toString());
        }
        let durationStr: string = await TestConfig.getValueOrDefault(ELEMENT_LOOKUP_DURATION_KEY, '5000');
        if (durationStr) {
            return +durationStr; // magic to convert string to number without chance for NaN
        }
        return 5000;
    }
}