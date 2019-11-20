import * as selenium from "selenium-webdriver";
import { ISession, SessionOptions, TestPlatform, UiConfig, FacetLocator, IFacet } from "aft-ui";
import { IDisposable, TestLog, TestLogOptions } from "aft-core";
import { FacetLocatorConverter } from "../../helpers/facet-locator-converter";
import { BrowserStackConfig } from "./configuration/browserstack-config";
import { SeleniumFacet } from "../../containers/selenium-facet";

export class BrowserStackSession implements ISession, IDisposable {
    driver: selenium.WebDriver;
    
    private logger: TestLog;
    private getLogger(): TestLog {
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
            let caps: selenium.Capabilities = new selenium.Capabilities();
            
            let platform: TestPlatform = options.platform || await UiConfig.platform();
            if (platform) {
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
            }
            if (options.resolution) {
                caps.set('resolution', options.resolution);
            }
            caps.set('browserstack.user', await BrowserStackConfig.user());
            caps.set('browserstack.key', await BrowserStackConfig.accessKey());
            caps.set('browserstack.debug', true);
            caps.set('build', await BrowserStackConfig.buildName());
            let useVpn: boolean = await BrowserStackConfig.useVpn();
            if (useVpn) {
                caps.set('browserstack.local', true);
            }
                
            let driver: selenium.WebDriver;
            this.getLogger().trace("creating new BrowserStack session...");
            try {
                driver = await new selenium.Builder()
                .usingServer(await BrowserStackConfig.hubUrl())
                .withCapabilities(caps)
                .build();

                let options: selenium.Options = await driver.manage();
                options.setTimeouts({implicit: 1000});
                await options.window().maximize();
            } catch (e) {
                return Promise.reject(e);
            }
            this.getLogger().trace("new BrowserStack session created successfully: " + await driver.getSession());

            this.driver = driver;
        }
    }

    async dispose(e?: Error) {
        try {
            await this.driver.close();
            await this.driver.quit();
        } catch (e) {
            this.getLogger().warn(e.toString());
        } finally {
            if (this.getLogger() && this.getLogger().name == BrowserStackSession.name) {
                this.getLogger().dispose(e);
            }
        }
    }

    async find(locator: FacetLocator): Promise<IFacet[]> {
        try {
            let loc: selenium.By = FacetLocatorConverter.toSeleniumLocator(locator);
            let elements: selenium.WebElement[] = await this.driver.findElements(loc);
            let facets: IFacet[] = [];
            for (var i=0; i<elements.length; i++) {
                let el: selenium.WebElement = elements[i];
                let index: number = i;
                let f: SeleniumFacet = new SeleniumFacet(async (): Promise<selenium.WebElement> => {
                    return await this.driver.findElements(loc)[index];
                });
                f.cachedRoot = el;
                facets.push(f);
            }
            return facets;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async goTo(url: string): Promise<void> {
        try {
            await this.driver.get(url);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}