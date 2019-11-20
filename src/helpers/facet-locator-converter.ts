import { FacetLocator, FacetLocatorType } from "aft-ui";
import { By } from "selenium-webdriver";

export module FacetLocatorConverter {
    export function toSeleniumLocator(locator: FacetLocator): By {
        switch(locator.type) {
            case FacetLocatorType.css:
                return By.css(locator.value);
            case FacetLocatorType.id:
                return By.id(locator.value);
            case FacetLocatorType.xpath:
                return By.xpath(locator.value);
            default:
                throw new Error(`unknown type: '${locator.type}' cannot be converted to Selenium By Locator`);
        }
    }
}