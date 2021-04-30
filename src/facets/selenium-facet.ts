import { Clazz, wait } from "aft-core";
import { AbstractFacet, IElementOptions, IFacetOptions } from "aft-ui";
import { Locator, WebElement } from "selenium-webdriver";
import { SeleniumSession } from "../sessions/selenium-session";

export interface WebElementOptions extends IElementOptions {
    locator: Locator;
}

export interface SeleniumFacetOptions extends IFacetOptions {
    locator?: Locator;
    session?: SeleniumSession;
    parent?: SeleniumFacet;
}

export class SeleniumFacet extends AbstractFacet {
    readonly locator: Locator;
    readonly session: SeleniumSession;
    readonly parent: SeleniumFacet;

    async getElements(options: WebElementOptions): Promise<WebElement[]> {
        let elements: WebElement[]
        await wait.untilTrue(async () => {
            elements = await this.getRoot().then((r) => r.findElements(options.locator));
            return elements.length > 0;
        }, options.maxWaitMs || 0);
        return elements;
    }

    async getElement(options: WebElementOptions): Promise<WebElement> {
        let element: WebElement;
        await wait.untilTrue(async () => {
            element = await this.getRoot()
                .then(r => r.findElement(options.locator));
            return !!element;
        }, options.maxWaitMs || 0);
        return element;
    }
    
    async getFacet<T extends AbstractFacet>(facetType: Clazz<T>, options?: IFacetOptions): Promise<T> {
        options = options || {} as IFacetOptions;
        options.parent = options?.parent || this as AbstractFacet;
        options.session = options?.session || this.session;
        options.logMgr = options?.logMgr || this.logMgr;
        options.maxWaitMs = options?.maxWaitMs || this.maxWaitMs;
        let facet: T = new facetType(options);
        return facet;
    }
    
    async getRoot(): Promise<WebElement>  {
        let el: WebElement;
        await wait.untilTrue(async () => {
            if (this.parent) {
                let els: WebElement[] = await this.parent.getRoot()
                    .then(r => r.findElements(this.locator));
                el = els[this.index];
            } else {
                let els: WebElement[] = await this.session.driver.findElements(this.locator);
                el = els[this.index];
            }
            if (el) {
                return true;
            }
            return false;
        }, this.maxWaitMs);
        return el;
    }
}