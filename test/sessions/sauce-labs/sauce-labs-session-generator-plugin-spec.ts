import { By, Capabilities } from 'selenium-webdriver';
import { using, LoggingPluginManager, rand } from "../../../../aft-core/src";
import { TestPlatform } from "../../../../aft-ui/src";
import { BuildName } from "../../../src/helpers/build-name";
import { SeleniumFacet } from '../../../src/facets/selenium-facet';
import { SauceLabsSessionGeneratorPlugin, SauceLabsSessionGeneratorPluginOptions } from '../../../src';

describe('SauceLabsSessionGeneratorPlugin', () => {
    it('can generate capabilities from the passed in SessionOptions', async () => {
        let opts: SauceLabsSessionGeneratorPluginOptions = {
            username: rand.getString(10, true, false, false, false),
            accesskey: rand.getString(12, true, true, false, false),
            platform: new TestPlatform({
                os: 'os-' + rand.getString(10),
                osVersion: 'osVersion-' + rand.getString(2, false, true),
                browser: 'browser-' + rand.getString(15),
                browserVersion: 'browserVersion-' + rand.getString(2, false, true),
                deviceName: 'deviceName-' + rand.getString(22)
            }),
            resolution: rand.getString(4, false, true) + 'x' + rand.getString(4, false, true),
            tunnel: true,
            tunnelId: rand.getString(11, true),
            _logMgr: new LoggingPluginManager({logName:'can generate capabilities from the passed in SessionOptions'})
        }
        let session: SauceLabsSessionGeneratorPlugin = new SauceLabsSessionGeneratorPlugin(opts);

        let caps: Capabilities = await session.getCapabilities();

        expect(caps.get('platformName')).toEqual(opts.platform.os);
        expect(caps.get('platformVersion')).toEqual(opts.platform.osVersion);
        expect(caps.get('browserName')).toEqual(opts.platform.browser);
        expect(caps.get('browserVersion')).toEqual(opts.platform.browserVersion);
        expect(caps.get('deviceName')).toEqual(opts.platform.deviceName);
        let sauceOpts: object = caps.get('sauce:options');
        expect(sauceOpts).toBeDefined();
        expect(sauceOpts['build']).toEqual(await BuildName.get());
        expect(sauceOpts['name']).toEqual(await opts._logMgr.logName());
        expect(sauceOpts['screenResolution']).toEqual(opts.resolution);
        expect(sauceOpts['tunnelIdentifier']).toEqual(opts.tunnelId);
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
        let plugin: SauceLabsSessionGeneratorPlugin = new SauceLabsSessionGeneratorPlugin({
            username: 'fake-username',
            accesskey: 'fake-accesskey',
            platform: new TestPlatform({os: 'windows', osVersion: '10', browser: 'chrome'})
        });
        await using (await plugin.newSession(), async (session) => {
            let expectedUrl: string = 'https://the-internet.herokuapp.com/login';
            await session.goTo(expectedUrl);

            let actualUrl: string = await session.driver.getCurrentUrl();

            expect(actualUrl).toEqual(expectedUrl);

            let facet: SeleniumFacet = await session.getFacet(SeleniumFacet, {locator: By.css('button.radius')});

            expect(facet).toBeDefined();
            expect(await facet.getRoot().then((r) => r.getText())).toEqual('Login');
        });
    }, 300000);
});