import * as selenium from "selenium-webdriver";
import { AbstractGridSession } from "../../../src/sessions/selenium-grid/abstract-grid-session";
import { TestLog, RandomGenerator } from "aft-core";
import { SessionOptions, TestPlatform, IFacet, FacetLocator } from "aft-ui";

describe('AbstractGridSession', () => {
    beforeEach(() => {
        jasmine.getEnv().allowRespy(true);
    });
    
    it('can generate capabilities from the passed in SessionOptions', async () => {
        let session: FakeGridSession = new FakeGridSession();
        let options: SessionOptions = new SessionOptions();
        let additional: {} = {
            'custom1': 'custom1-' + RandomGenerator.getString(10),
            'custom2': 'custom2-' + RandomGenerator.getString(10),
            'custom3': 'custom3-' + RandomGenerator.getString(10),
            'custom4': 'custom4-' + RandomGenerator.getString(10)
        };
        options.additionalCapabilities = additional;

        let capabilities: selenium.Capabilities = await session.getCapabilities(options);

        expect(capabilities.get('custom1')).toEqual(additional['custom1']);
        expect(capabilities.get('custom2')).toEqual(additional['custom2']);
        expect(capabilities.get('custom3')).toEqual(additional['custom3']);
        expect(capabilities.get('custom4')).toEqual(additional['custom4']);
    });

    it('can auto-refresh from WebDriver on cached WebElement exception', async () => {
        let element: selenium.WebElement = jasmine.createSpyObj('WebElement', {
            'isDisplayed': Promise.resolve(true), 
            'isEnabled': Promise.resolve(true), 
            'click': Promise.resolve(), 
            'sendKeys': Promise.resolve(), 
            'getAttribute': Promise.resolve('foo'),
            'findElements': Promise.resolve([])
        });
        let driver: selenium.WebDriver = jasmine.createSpyObj('WebDriver', {
            'findElements': Promise.resolve([element]),
            'close': Promise.resolve(),
            'quit': Promise.resolve()
        });
        let session: FakeGridSession = new FakeGridSession();
        let sOpts: SessionOptions = new SessionOptions(driver);
        session.initialise(sOpts);
        spyOn(session, "find").and.callThrough();

        let facets: IFacet[] = await session.find(FacetLocator.css('div.fake'));
        let facet: IFacet = facets[0];

        expect(await facet.displayed()).toBe(true);

        spyOn(element, 'isDisplayed').and.throwError('fake stale element error');

        expect(await facet.enabled()).toBe(true);
        expect(driver.findElements).toHaveBeenCalledTimes(3);
    });
});

class FakeGridSession extends AbstractGridSession {
    logger: TestLog;
    options: SessionOptions;
    getLogger(): TestLog {
        return this.logger;
    }
    
    async initialise(options: SessionOptions): Promise<void> {
        this.options = options;
        this.driver = options.driver;
    }
}