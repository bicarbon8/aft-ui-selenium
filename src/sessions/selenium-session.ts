import { Locator, WebDriver, WebElement } from "selenium-webdriver";
import { LoggingPluginManager } from "../../../aft-core/src";
import { IFacet, IFacetOptions, ISession, ISessionOptions } from "../../../aft-ui/src";

export interface SeleniumSessionOptions extends ISessionOptions<WebDriver> {

}

export class SeleniumSession implements ISession<WebDriver, WebElement, Locator> {
    readonly driver: WebDriver;
    readonly logMgr: LoggingPluginManager;
    
    constructor(options: SeleniumSessionOptions) {
        this.driver = options.driver;
        this.logMgr = options.logMgr || new LoggingPluginManager({logName: `SeleniumSession_${this.driver.getSession().then((s) => s.getId())}`});
    }
    
    async getFacet<T extends IFacet<WebDriver, WebElement, Locator>>(facetType: new (options: IFacetOptions<WebDriver, WebElement, Locator>) => T, options?: IFacetOptions<WebDriver, WebElement, Locator>): Promise<T> {
        options = options || {};
        options.session = options.session || this;
        options.logMgr = options.logMgr || this.logMgr;
        let facet: T = new facetType(options);
        return facet;
    }

    async dispose(error?: Error): Promise<void> {
        if (error) {
            this.logMgr.warn(`Error: SeleniumSession - ${error.message}`);
        }
        this.logMgr.trace(`shutting down SeleniumSession: ${await this.driver?.getSession().then((s) => s.getId())}`);
        await this.driver?.quit();
    }

    async goTo(url: string): Promise<void> {
        try {
            await this.driver?.get(url);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async refresh(): Promise<void> {
        try {
            await this.driver?.navigate().refresh();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async resize(width: number, height: number): Promise<void> {
        try {
            await this.driver?.manage().window().setSize(width, height);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}