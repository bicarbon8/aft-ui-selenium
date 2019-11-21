import { using, TestLog, TestLogOptions, RandomGenerator } from "aft-core";
import { SessionOptions, FacetLocator, TestPlatform, IFacet } from "aft-ui";
import { SeleniumGridSession } from "../../../src/sessions/selenium-grid/selenium-grid-session";
import { Capabilities } from "selenium-webdriver";
import { BuildName } from "../../../src/helpers/build-name";

describe('SeleniumGridSession', () => {
    it('will not work properly unless initialise method is called', async () => {
        let session: SeleniumGridSession = new SeleniumGridSession();

        try {
            // expect rejected promise because initialise not called
            await session.find(FacetLocator.css('div'));
            /* failure */
            expect(true).toEqual(false);
        } catch (e) {
            /* success */
            expect(e).not.toBeUndefined();
        }
    });

    it('will not dispose of logger if it has different name than class', async () => {
        let session: SeleniumGridSession = new SeleniumGridSession();
        let logger: TestLog = new TestLog(new TestLogOptions(RandomGenerator.getString(50)));
        let fakeDriver: object = {
            findElements: function() {},
            get: function() {},
            getSession: function() {},
            close: function() {},
            quit: function() {}
        };
        spyOn(logger, 'dispose').and.callThrough();

        let options: SessionOptions = new SessionOptions();
        options.driver = fakeDriver;
        options.logger = logger;

        await session.initialise(options);
        await session.dispose();

        expect(logger.dispose).not.toHaveBeenCalled();
    });

    it('will dispose of logger if it has same name as class', async () => {
        let session: SeleniumGridSession = new SeleniumGridSession();
        let logger: TestLog = new TestLog(new TestLogOptions(SeleniumGridSession.name));
        let fakeDriver: object = {
            findElements: function() {},
            get: function() {},
            getSession: function() {},
            close: function() {},
            quit: function() {}
        };
        spyOn(logger, 'dispose').and.callThrough();

        let options: SessionOptions = new SessionOptions();
        options.driver = fakeDriver;
        options.logger = logger;

        await session.initialise(options);
        await session.dispose();

        expect(logger.dispose).toHaveBeenCalledTimes(1);
    });

    it('can generate capabilities from the passed in SessionOptions', async () => {
        let driver = {
            getSession: function() {return RandomGenerator.getString(10);}
        };
        let session: SeleniumGridSession = new SeleniumGridSession();
        let options: SessionOptions = new SessionOptions();
        let platform: TestPlatform = new TestPlatform();
        platform.os = 'os-' + RandomGenerator.getString(10);
        platform.osVersion = 'osVersion-' + RandomGenerator.getString(2, false, true);
        platform.browser = 'browser-' + RandomGenerator.getString(15);
        platform.browserVersion = 'browserVersion-' + RandomGenerator.getString(2, false, true);
        options.platform = platform;
        options.driver = driver;

        await session.initialise(options);
        let capabilities: Capabilities = await session.getCapabilities(options);

        expect(capabilities.get('platform')).toEqual(`${platform.os} ${platform.osVersion}`);
        expect(capabilities.get('browserName')).toEqual(`${platform.browser} ${platform.browserVersion}`);
    });
    
    /**
     * WARNING: this test will attempt to create an actual session on your own Selenium Grid
     * it should only be used for local debugging.
     * NOTE: you will need to set a value for the following via SeleniumGridConfig
     * or as environment variables:
     * - selenium_grid_url
     */
    xit('can create a session on Selenium Grid', async () => {
        await using (new SeleniumGridSession(), async (session: SeleniumGridSession) => {
            let platform: TestPlatform = new TestPlatform();
            platform.browser = 'chrome';
            platform.os = 'windows';
            platform.osVersion = '10';
            let opts: SessionOptions = new SessionOptions();
            opts.platform = platform;

            await session.initialise(opts);

            let expectedUrl: string = 'https://the-internet.herokuapp.com/login';
            await session.goTo(expectedUrl);

            let actualUrl: string = await session.driver.getCurrentUrl();

            expect(actualUrl).toEqual(expectedUrl);

            let elements: IFacet[] = await session.find(FacetLocator.css('button.radius'));

            expect(elements.length).toBe(1);
            expect(await elements[0].text()).toEqual('Login');
        });
    }, 300000);
});