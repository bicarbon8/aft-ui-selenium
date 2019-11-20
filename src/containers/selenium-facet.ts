import { IFacet, FacetLocator } from "aft-ui";
import { WebElement, By } from "selenium-webdriver";
import { Wait, Func } from "aft-core";
import { FacetLocatorConverter } from "../helpers/facet-locator-converter";

export class SeleniumFacet implements IFacet {
    deferredRoot: Func<void, Promise<WebElement>>
    cachedRoot: WebElement;
    
    constructor(deferredRoot: Func<void, Promise<WebElement>>) {
        this.deferredRoot = deferredRoot;
    }
    
    async find(locator: FacetLocator, searchDuration?: number): Promise<IFacet[]> {
        try {
            let loc: By = FacetLocatorConverter.toSeleniumLocator(locator);
            let elements: WebElement[] = await this.getRootElement().then((r) => r.findElements(loc));
            let facets: IFacet[] = [];
            for (var i=0; i<elements.length; i++) {
                let el: WebElement = elements[i];
                let index: number = i;
                let f: SeleniumFacet = new SeleniumFacet(async (): Promise<WebElement> => {
                    return await this.getRootElement().then((r) => r.findElements(loc)[index]);
                });
                f.cachedRoot = el;
                facets.push(f);
            }
            return facets;
        } catch (e) {
            return Promise.reject(e);
        }
    }
    
    async enabled(): Promise<boolean> {
        return await this.getRootElement().then((r) => r.isEnabled());
    }

    async displayed(): Promise<boolean> {
        return await this.getRootElement().then((r) => r.isDisplayed());
    }

    async click(): Promise<void> {
        await this.getRootElement().then((r) => r.click());
    }

    async text(input?: string): Promise<string> {
        if (input) {
            this.getRootElement().then((r) => r.sendKeys(input));
            return this.getRootElement().then((r) => r.getAttribute('value'));
        }
        return await this.getRootElement().then((r) => r.getText());
    }

    async attribute(key: string): Promise<string> {
        return await this.getRootElement().then((r) => r.getAttribute(key));
    }

    private async getRootElement(): Promise<WebElement> {
        if (!this.cachedRoot) {
            this.cachedRoot = await Promise.resolve(this.deferredRoot());
        } else {
            try {
                // ensure cachedRoot is not stale
                await this.cachedRoot.isDisplayed();
            } catch (e) {
                this.cachedRoot = null;
                return await this.getRootElement();
            }
        }
        return this.cachedRoot;
    }
}