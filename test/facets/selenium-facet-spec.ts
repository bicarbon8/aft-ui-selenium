import { By, WebDriver, WebElement, Session } from "selenium-webdriver";
import { LoggingPluginManager, rand } from "../../../aft-core/src";
import { SeleniumFacet } from "../../src";
import { SeleniumSession } from "../../src/sessions/selenium-session";

describe('SeleniumFacet', () => {
    beforeEach(() => {
        jasmine.getEnv().allowRespy(true);
    });

    it('can auto-refresh from WebDriver on Error in getRoot', async () => {
        let element: WebElement = jasmine.createSpyObj('WebElement', {
            'isDisplayed': Promise.resolve(true), 
            'isEnabled': Promise.resolve(true), 
            'click': Promise.resolve(), 
            'sendKeys': Promise.resolve(), 
            'getAttribute': Promise.resolve('foo'),
            'findElements': Promise.resolve([])
        });
        let count: number = 0;
        let sesh: Session = jasmine.createSpyObj('Session', {
            'getId': rand.guid
        });
        let driver: WebDriver = jasmine.createSpyObj('WebDriver', {
            'findElements': () => {
                if (count == 0) {
                    count++;
                    throw new Error('element not found');
                }
                return Promise.resolve([element]);
            },
            'close': Promise.resolve(),
            'quit': Promise.resolve(),
            'getSession': Promise.resolve(sesh)
        });
        let session: SeleniumSession = new SeleniumSession({
            driver: driver, 
            logMgr: new LoggingPluginManager({logName: 'can auto-refresh from WebDriver on Error in getRoot'})
        });
        let facet: SeleniumFacet = await session.getFacet(SeleniumFacet, {
            locator: By.css('div.fake'),
            maxWaitMs: 5000
        });
        let actual: WebElement = await facet.getRoot();

        expect(actual).toBeDefined();
        expect(await actual.isDisplayed()).toBe(true);
        expect(driver.findElements).toHaveBeenCalledTimes(2);
    });
});