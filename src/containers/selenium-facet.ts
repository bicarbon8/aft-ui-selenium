import { IFacet, FacetLocator, IFacetProvider } from "aft-ui";
import { WebElement, By } from "selenium-webdriver";
import { Wait } from "aft-core";
import { FacetLocatorConverter } from "../helpers/facet-locator-converter";

export class SeleniumFacet implements IFacet {
    root: WebElement;
    constructor(element: WebElement) {
        this.root = element;
    }
    async find(locator: FacetLocator, searchDuration?: number): Promise<IFacet[]> {
        let facets: IFacet[] = [];
        let loc: By = FacetLocatorConverter.toSeleniumLocator(locator);
        if (!searchDuration) {
            searchDuration = 1000;
        }
        // get all elements matching locator under this root and return as IFacet[]
        await Wait.forCondition(async (): Promise<boolean> => {
            let elements: WebElement[] = await this.root.findElements(loc);
            facets = await IFacetProvider.process(...elements);
            return elements.length > 0 && facets.length == elements.length;
        }, searchDuration);
        return facets;
    }
    async enabled(): Promise<boolean> {
        return await this.root.isEnabled();
    }
    async displayed(): Promise<boolean> {
        return await this.root.isDisplayed();
    }
    async click(): Promise<void> {
        await this.root.click();
    }
    async text(input?: string): Promise<string> {
        if (input) {
            this.root.sendKeys(input);
            return this.root.getAttribute('value');
        }
        return await this.root.getText();
    }
    async attribute(key: string): Promise<string> {
        return await this.root.getAttribute(key);
    }
}