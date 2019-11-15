import { using, TestLog, TestLogOptions, RandomGenerator } from "aft-core";
import { BrowserStackSession } from "../../../src/sessions/browserstack/browserstack-session";
import { SessionOptions, FacetLocator, TestPlatform, IFacet } from "aft-ui";
import '../../../src/containers/selenium-facet-provider';

describe('BrowserStackSession', () => {
    it('will not work properly unless initialise method is called', async () => {
        let session: BrowserStackSession = new BrowserStackSession();

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
        let session: BrowserStackSession = new BrowserStackSession();
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
        let session: BrowserStackSession = new BrowserStackSession();
        let logger: TestLog = new TestLog(new TestLogOptions(BrowserStackSession.name));
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
    
    /**
     * WARNING: this test will attempt to create an actual session on BrowserStack
     * it should only be used for local debugging
     */
    xit('can create a session in BrowserStack', async () => {
        await using (new BrowserStackSession(), async (session: BrowserStackSession) => {
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