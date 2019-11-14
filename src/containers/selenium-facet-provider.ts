import { IFacetProvider, IFacet } from "aft-ui";
import { SeleniumFacet } from "./selenium-facet";
import { WebElement } from "selenium-webdriver";

@IFacetProvider.register
export class SeleniumFacetProvider implements IFacetProvider {
    name: string = SeleniumFacet.name;
    
    async supports(element: any): Promise<boolean> {
        if (this.isWebElement(element)) {
            return true;
        }
        return false;
    }

    async provide(element: any): Promise<IFacet> {
        if (this.isWebElement(element)) {
            return new SeleniumFacet(element);
        }
        return Promise.reject('unsupported element type supplied to function');
    }

    private isWebElement(element: any): boolean {
        let instWebEl: boolean =  element instanceof WebElement;
        let likeWebEl: boolean = element['click'] && element['isDisplayed'] && element['isEnabled'] && element['sendKeys'];
        return instWebEl || likeWebEl;
    }
}