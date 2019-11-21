import * as selenium from "selenium-webdriver";
import { SessionOptions, TestPlatform, UiConfig } from "aft-ui";
import { TestLog, TestLogOptions } from "aft-core";
import { BrowserStackConfig } from "./configuration/browserstack-config";
import { AbstractGridSession } from "../selenium-grid/abstract-grid-session";
import { BuildName } from "../../helpers/build-name";

export class BrowserStackSession extends AbstractGridSession {
    private logger: TestLog;
    getLogger(): TestLog {
        if (!this.logger) {
            this.logger = new TestLog(new TestLogOptions(BrowserStackSession.name));
        }
        return this.logger;
    }

    async initialise(options: SessionOptions): Promise<void> {
        this.logger = options.logger;
        
        if (options.driver) {
            this.driver = options.driver as selenium.WebDriver;
            this.getLogger().trace("using passed in Driver session of: " + await this.driver.getSession());
        } else {
            let hubUrl: string = await BrowserStackConfig.hubUrl();
            let capabilities: selenium.Capabilities = await this.getCapabilities(options);
            this.getLogger().trace("creating new BrowserStack session...");
            await this.createDriver(hubUrl, capabilities);
            this.getLogger().trace("new BrowserStack session created successfully: " + await this.driver.getSession());
        }
    }

    async getCapabilities(options: SessionOptions): Promise<selenium.Capabilities> {
        let caps: selenium.Capabilities = await super.getCapabilities(options);
        let platform: TestPlatform = options.platform || await UiConfig.platform();
        if (platform.browser) {
            caps.set('browserName', platform.browser);
        }
        if (platform.browserVersion) {
            caps.set('browser_version', platform.browserVersion);
        }
        if (platform.os) {
            caps.set('os', platform.os);
        }
        if (platform.osVersion) {
            caps.set('os_version', platform.osVersion);
        }
        if (platform.deviceName) {
            caps.set('device', platform.deviceName);
            caps.set('realMobile', 'true');
        }
        if (options.resolution) {
            caps.set('resolution', options.resolution);
        }
        caps.set('browserstack.user', await BrowserStackConfig.user());
        caps.set('browserstack.key', await BrowserStackConfig.accessKey());
        caps.set('browserstack.debug', true);
        caps.set('build', await BuildName.get());
        caps.set('name', this.getLogger().name);
        let useVpn: boolean = options.useVpn || await BrowserStackConfig.useVpn();
        if (useVpn) {
            caps.set('browserstack.local', true);
            let localId: string = await BrowserStackConfig.localIdentifier();
            if (localId) {
                caps.set('browserstack.localIdentifier', localId);
            }
        }
        return caps;
    }

    async dispose(e?: Error) {
        super.dispose(e);
        if (this.getLogger() && this.getLogger().name == BrowserStackSession.name) {
            this.getLogger().dispose(e);
        }
    }
}