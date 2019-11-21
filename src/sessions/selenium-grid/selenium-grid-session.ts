import * as selenium from "selenium-webdriver";
import { AbstractGridSession } from "./abstract-grid-session";
import { TestLog, TestLogOptions } from "aft-core";
import { SessionOptions, TestPlatform, UiConfig } from "aft-ui";
import { SeleniumGridConfig } from "./configuration/selenium-grid-config";

export class SeleniumGridSession extends AbstractGridSession {
    private logger: TestLog;
    getLogger(): TestLog {
        if (!this.logger) {
            this.logger = new TestLog(new TestLogOptions(SeleniumGridSession.name));
        }
        return this.logger;
    }
    
    async initialise(options: SessionOptions): Promise<void> {
        this.logger = options.logger;
        
        if (options.driver) {
            this.driver = options.driver as selenium.WebDriver;
            this.getLogger().trace("using passed in Driver session of: " + await this.driver.getSession());
        } else {
            let hubUrl: string = await SeleniumGridConfig.hubUrl();
            let capabilities: selenium.Capabilities = await this.getCapabilities(options);
            this.getLogger().trace("creating new Selenium Grid session...");
            await this.createDriver(hubUrl, capabilities);
            this.getLogger().trace("new Selenium Grid session created successfully: " + await this.driver.getSession());
        }
    }

    async getCapabilities(options: SessionOptions): Promise<selenium.Capabilities> {
        let caps: selenium.Capabilities = await super.getCapabilities(options);
        let platform: TestPlatform = options.platform || await UiConfig.platform();
        let osVersion = '';
        if (platform.osVersion) {
            osVersion = ' ' + platform.osVersion;
        }
        let browserVersion = '';
        if (platform.browserVersion) {
            browserVersion = ' ' + platform.browserVersion;
        }
        caps.set('platform', `${platform.os}${osVersion}`);
        caps.set('browserName', `${platform.browser}${browserVersion}`);
        return caps;
    }

    async dispose(e?: Error) {
        await super.dispose(e);
        if (this.getLogger() && this.getLogger().name == SeleniumGridSession.name) {
            this.getLogger().dispose(e);
        }
    }
}