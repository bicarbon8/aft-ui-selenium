import * as selenium from "selenium-webdriver";
import { SessionOptions, TestPlatform, UiConfig } from "aft-ui";
import { TestLog, TestLogOptions } from "aft-core";
import { SauceLabsConfig } from "./configuration/sauce-labs-config";
import { BuildName } from "../../helpers/build-name";
import { AbstractGridSession } from "../selenium-grid/abstract-grid-session";

export class SauceLabsSession extends AbstractGridSession {
    private logger: TestLog;
    getLogger(): TestLog {
        if (!this.logger) {
            this.logger = new TestLog(new TestLogOptions(SauceLabsSession.name));
        }
        return this.logger;
    }

    async initialise(options: SessionOptions): Promise<void> {
        this.logger = options.logger;
        
        if (options.driver) {
            this.driver = options.driver as selenium.WebDriver;
            this.getLogger().trace("using passed in Driver session of: " + await this.driver.getSession());
        } else {
            let hubUrl: string = await SauceLabsConfig.hubUrl();
            let capabilities: selenium.Capabilities = await this.getCapabilities(options);
            this.getLogger().trace("creating new Sauce Labs session...");
            await this.createDriver(hubUrl, capabilities);
            this.getLogger().trace("new Sauce Labs session created successfully: " + await this.driver.getSession());
        }
    }

    async getCapabilities(options: SessionOptions): Promise<selenium.Capabilities> {
        let caps: selenium.Capabilities = await super.getCapabilities(options);
        let platform: TestPlatform = options.platform || await UiConfig.platform();
        if (platform.deviceName) {
            caps.set('platformName', platform.os);
            caps.set('platformVersion', platform.osVersion);
        } else {
            let osVersion: string = '';
            if (platform.osVersion) {
                osVersion = ' ' + platform.osVersion;
            }
            caps.set('platformName', `${platform.os}${osVersion}`);
        }
        if (platform.browser) {
            caps.set('browserName', platform.browser);
        }
        if (platform.browserVersion) {
            caps.set('browserVersion', platform.browserVersion);
        }
        if (platform.deviceName) {
            caps.set('deviceName', platform.deviceName);
        }
        caps.set('sauce:options', {
            'username': await SauceLabsConfig.user(),
            'accessKey': await SauceLabsConfig.accessKey(),
            'build': await BuildName.get(),
            'name': this.getLogger().name
        });
        if (options.resolution) {
            let opts: {} = caps.get('sauce:options');
            opts['screenResolution'] = options.resolution;
            caps.set('sauce:options', opts);
        }
        if (options.useVpn) {
            let opts: {} = caps.get('sauce:options');
            opts['tunnelIdentifier'] = await SauceLabsConfig.tunnelIdentifier();
            caps.set('sauce:options', opts);
        }
        return caps;
    }

    async dispose(e?: Error) {
        super.dispose(e);
        if (this.getLogger() && this.getLogger().name == SauceLabsSession.name) {
            this.getLogger().dispose(e);
        }
    }
}