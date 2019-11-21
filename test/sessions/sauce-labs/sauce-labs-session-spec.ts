import { using, TestLog, TestLogOptions, RandomGenerator } from "aft-core";
import { SessionOptions, FacetLocator, TestPlatform, IFacet } from "aft-ui";
import { SauceLabsSession } from "../../../src/sessions/sauce-labs/sauce-labs-session";
import { Capabilities } from "selenium-webdriver";
import { BuildName } from "../../../src/helpers/build-name";
import { SauceLabsConfig } from "../../../src/sessions/sauce-labs/configuration/sauce-labs-config";

describe('SauceLabsSession', () => {
    it('will not work properly unless initialise method is called', async () => {
        let session: SauceLabsSession = new SauceLabsSession();

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
        let session: SauceLabsSession = new SauceLabsSession();
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
        let session: SauceLabsSession = new SauceLabsSession();
        let logger: TestLog = new TestLog(new TestLogOptions(SauceLabsSession.name));
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
        let session: SauceLabsSession = new SauceLabsSession();
        let options: SessionOptions = new SessionOptions();
        let platform: TestPlatform = new TestPlatform();
        platform.os = 'os-' + RandomGenerator.getString(10);
        platform.osVersion = 'osVersion-' + RandomGenerator.getString(2, false, true);
        platform.browser = 'browser-' + RandomGenerator.getString(15);
        platform.browserVersion = 'browserVersion-' + RandomGenerator.getString(2, false, true);
        platform.deviceName = 'deviceName-' + RandomGenerator.getString(22);
        options.platform = platform;
        options.resolution = RandomGenerator.getString(4, false, true) + 'x' + RandomGenerator.getString(4, false, true);
        options.useVpn = true;
        options.logger = new TestLog(new TestLogOptions('can generate capabilities from the passed in SessionOptions'));
        options.driver = driver;

        await session.initialise(options);
        let capabilities: Capabilities = await session.getCapabilities(options);

        expect(capabilities.get('platformName')).toEqual(platform.os);
        expect(capabilities.get('platformVersion')).toEqual(platform.osVersion);
        expect(capabilities.get('browserName')).toEqual(platform.browser);
        expect(capabilities.get('browserVersion')).toEqual(platform.browserVersion);
        expect(capabilities.get('deviceName')).toEqual(platform.deviceName);
        let sauceOpts: {} = capabilities.get('sauce:options');
        expect(sauceOpts['build']).toEqual(await BuildName.get());
        expect(sauceOpts['name']).toEqual(options.logger.name);
        expect(sauceOpts['screenResolution']).toEqual(options.resolution);
        expect(sauceOpts['tunnelIdentifier']).toEqual(await SauceLabsConfig.tunnelIdentifier());
    });
    
    /**
     * WARNING: this test will attempt to create an actual session on Sauce Labs
     * it should only be used for local debugging.
     * NOTE: you will need to set a value for the following via SauceLabsConfig
     * or as environment variables:
     * - sauce_username
     * - sauce_access_key
     */
    xit('can create a session in Sauce Labs', async () => {
        await using (new SauceLabsSession(), async (session: SauceLabsSession) => {
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