import { AbstractFacet, IElementOptions, IFacet, IFacetOptions } from "../../../aft-ui/src";
import { WebElement, WebDriver, Locator } from "selenium-webdriver";
import { wait } from "../../../aft-core/src";

export interface SeleniumFacetOptions extends IFacetOptions<WebDriver, WebElement, Locator> {
    
}

export class SeleniumFacet extends AbstractFacet<WebDriver, WebElement, Locator> {
    async getElements(options: IElementOptions<Locator>): Promise<WebElement[]> {
        let elements: WebElement[]
        await wait.untilTrue(async () => {
            elements = await this.getRoot().then(async (r) => {
                return await r.findElements(options.locator);
            });
            return elements.length > 0;
        }, options.maxWaitMs || 0);
        return elements;
    }

    async getElement(options: IElementOptions<Locator>): Promise<WebElement> {
        let element: WebElement;
        await wait.untilTrue(async () => {
            element = await this.getRoot().then(async (r) => {
                return await r.findElement(options.locator);
            });
            return !!element;
        }, options.maxWaitMs || 0);
        return element;
    }
    
    async getFacet<T extends IFacet<WebDriver, WebElement, Locator>>(facetType: new (options: IFacetOptions<WebDriver, WebElement, Locator>) => T, options?: IFacetOptions<WebDriver, WebElement, Locator>): Promise<T> {
        options = options || {} as IFacetOptions<WebDriver, WebElement, Locator>;
        options.parent = options?.parent || this;
        options.session = options?.session || this.session;
        options.logMgr = options?.logMgr || this.logMgr;
        options.maxWaitMs = options?.maxWaitMs || this.maxWaitMs;
        let facet: T = new facetType(options);
        return facet;
    }
    
    async getRoot(): Promise<WebElement>  {
        let el: WebElement;
        await wait.untilTrue(async () => {
            let parent = this.parent;
            if (parent) {
                let els: WebElement[] = await parent.getRoot()
                    .then((root) => root.findElements(this.locator));
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