import * as selenium from "selenium-webdriver";
import { ISession, SessionOptions, FacetLocator, IFacet } from "aft-ui";
import { TestLog, Func, Wait } from "aft-core";
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
            let lookupDuration: number = await SeleniumGridConfig.elementLookupDuration();
            for (var i=0; i<elements.length; i++) {
                let index: number = i;
                let deferred: Func<void, Promise<selenium.WebElement>> = async () => {
                    let elements: selenium.WebElement[];
                    await Wait.forCondition(async () => {
                        elements = await this.driver.findElements(loc);
                        return elements.length > index;
                    }, lookupDuration);
                    return elements[index];
                };
                let facet: SeleniumFacet = new SeleniumFacet(deferred);
                facet.cachedRoot = await Promise.resolve(deferred());
                facets.push(facet);
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