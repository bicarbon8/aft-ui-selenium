import * as selenium from "selenium-webdriver";
import { ISession, SessionOptions, FacetLocator, IFacet } from "aft-ui";
import { TestLog } from "aft-core";
import { FacetLocatorConverter } from "../../helpers/facet-locator-converter";
import { SeleniumFacet } from "../../containers/selenium-facet";
import { SeleniumGridConfig } from "./configuration/selenium-grid-config";

export abstract class AbstractGridSession implements ISession {
    driver: selenium.WebDriver;
    
    abstract getLogger(): TestLog;

    abstract initialise(options: SessionOptions): Promise<void>;

    async getCapabilities(options: SessionOptions): Promise<selenium.Capabilities> {
        let caps: selenium.Capabilities = new selenium.Capabilities();

        let additionalCapabilities: {} = options.additionalCapabilities || await SeleniumGridConfig.additionalCapabilities();
        for (let key in additionalCapabilities) {
            caps.set(key, additionalCapabilities[key]);
        }

        return caps;
    }

    async createDriver(url: string, capabilities: selenium.Capabilities): Promise<void> {
        try {
            this.driver = await new selenium.Builder()
                .usingServer(url)
                .withCapabilities(capabilities)
                .build();

            await this.driver.manage().setTimeouts({implicit: 1000});
            await this.driver.manage().window().maximize();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async dispose(e?: Error) {
        try {
            await this.driver.close();
            await this.driver.quit();
        } catch (ex) {
            this.getLogger().warn(ex.toString());
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

    async refresh(): Promise<void> {
        try {
            await this.driver.navigate().refresh();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async resize(width: number, height: number): Promise<void> {
        try {
            await this.driver.manage().window().setSize(width, height);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}