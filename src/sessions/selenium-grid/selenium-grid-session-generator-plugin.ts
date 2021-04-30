import { AbstractGridSessionGeneratorPlugin, SeleniumGridSessionPluginOptions } from "./abstract-grid-session-generator-plugin";
import { TestPlatform } from "aft-ui";
import { Capabilities } from "selenium-webdriver";
import { nameof } from "ts-simple-nameof";
import { SeleniumSessionOptions } from "../selenium-session";

export class SeleniumGridSessionGeneratorPlugin extends AbstractGridSessionGeneratorPlugin {
    constructor(options?: SeleniumGridSessionPluginOptions) {
        super(nameof(SeleniumGridSessionGeneratorPlugin).toLowerCase(), options);
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async getCapabilities(options?: SeleniumSessionOptions): Promise<Capabilities> {
        let capabilities: Capabilities = new Capabilities();
        let platform: TestPlatform = await this.getPlatform();
        let osVersion = '';
        if (platform.osVersion) {
            osVersion = ' ' + platform.osVersion;
        }
        let browserVersion = '';
        if (platform.browserVersion) {
            browserVersion = ' ' + platform.browserVersion;
        }
        capabilities.set('platform', `${platform.os}${osVersion}`);
        capabilities.set('browserName', `${platform.browser}${browserVersion}`);
        // overwrite the above with passed in capabilities if any
        let superCaps: Capabilities = await super.getCapabilities();
        capabilities = capabilities.merge(superCaps);
        return capabilities;
    }
    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }
}