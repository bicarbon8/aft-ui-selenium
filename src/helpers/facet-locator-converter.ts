import { FacetLocator, FacetLocatorType } from "aft-ui";
import { By } from "selenium-webdriver";

export module FacetLocatorConverter {
    export function toSeleniumLocator(locator: FacetLocator): By {
        switch(locator.locatorType) {
            case FacetLocatorType.css:
                return By.css(locator.locatorValue);
            case FacetLocatorType.id:
                return By.id(locator.locatorValue);
            case FacetLocatorType.xpath:
                return By.xpath(locator.locatorValue);
            default:
                throw new Error(`unknown type: '${locator.locatorType}' cannot be converted to Selenium By Locator`);
        }
    }
}