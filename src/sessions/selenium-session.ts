import { WebDriver } from "selenium-webdriver";
import { Clazz, LoggingPluginManager } from "aft-core";
import { AbstractFacet, ISession, ISessionOptions } from "aft-ui";
import { SeleniumFacetOptions } from "../facets/selenium-facet";

export interface SeleniumSessionOptions extends ISessionOptions {
    driver?: WebDriver;
}

export class SeleniumSession implements ISession {
    readonly driver: WebDriver;
    readonly logMgr: LoggingPluginManager;
    
    constructor(options: SeleniumSessionOptions) {
        this.driver = options.driver;
        this.logMgr = options.logMgr || new LoggingPluginManager({logName: `SeleniumSession_${this.driver?.getSession().then(s => s.getId())}`});
    }
    
    async getFacet<T extends AbstractFacet>(facetType: Clazz<T>, options?: SeleniumFacetOptions): Promise<T> {
        options = options || {};
        options.session = options.session || this;
        options.logMgr = options.logMgr || this.logMgr;
        let facet: T = new facetType(options);
        return facet;
    }

    async goTo(url: string): Promise<SeleniumSession> {
        try {
            await this.driver?.get(url);
        } catch (e) {
            return Promise.reject(e);
        }
        return this;
    }

    async refresh(): Promise<SeleniumSession> {
        try {
            await this.driver?.navigate().refresh();
        } catch (e) {
            return Promise.reject(e);
        }
        return this;
    }

    async resize(width: number, height: number): Promise<SeleniumSession> {
        try {
            await this.driver?.manage().window().setSize(width, height);
        } catch (e) {
            return Promise.reject(e);
        }
        return this;
    }

    async dispose(error?: Error): Promise<void> {
        if (error) {
            this.logMgr.warn(`Error: SeleniumSession - ${error.message}`);
        }
        this.logMgr.trace(`shutting down SeleniumSession: ${await this.driver?.getSession().then(s => s.getId())}`);
        await this.driver?.quit();
    }
}