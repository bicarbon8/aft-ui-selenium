import { By, Capabilities } from 'selenium-webdriver';
import { using, LoggingPluginManager, rand } from "aft-core";
import { BrowserStackSessionGeneratorPlugin, BrowserStackSessionGeneratorPluginOptions } from "../../../src/sessions/browserstack/browserstack-session-generator-plugin";
import { TestPlatform } from "aft-ui";
import { BuildName } from "../../../src/helpers/build-name";
import { SeleniumFacet, SeleniumSession } from "../../../src";

describe('BrowserStackSessionGeneratorPlugin', () => {
    it('can generate capabilities from the passed in SessionOptions', async () => {
        let platform: TestPlatform = new TestPlatform({
            os: 'os-' + rand.getString(10),
            osVersion: 'osVersion-' + rand.getString(2, false, true),
            browser: 'browser-' + rand.getString(15),
            browserVersion: 'browserVersion-' + rand.getString(2, false, true),
            deviceName: 'deviceName-' + rand.getString(22)
        });
        let opts: BrowserStackSessionGeneratorPluginOptions = {
            user: rand.getString(10, true, false, false, false),
            key: rand.getString(12, true, true, false, false),
            platform: platform,
            resolution: rand.getString(4, false, true) + 'x' + rand.getString(4, false, true),
            local: true,
            _logMgr: new LoggingPluginManager({logName: 'can generate capabilities from the passed in SessionOptions'})
        };
        let session: BrowserStackSessionGeneratorPlugin = new BrowserStackSessionGeneratorPlugin(opts);

        let capabilities: Capabilities = await session.getCapabilities();

        expect(capabilities.get('browserstack.user')).toEqual(opts.user);
        expect(capabilities.get('browserstack.key')).toEqual(opts.key);
        expect(capabilities.get('os')).toEqual(platform.os);
        expect(capabilities.get('os_version')).toEqual(platform.osVersion);
        expect(capabilities.get('browserName')).toEqual(platform.browser);
        expect(capabilities.get('browser_version')).toEqual(platform.browserVersion);
        expect(capabilities.get('device')).toEqual(platform.deviceName);
        expect(capabilities.get('realMobile')).toEqual('true');
        expect(capabilities.get('browserstack.local')).toEqual(true);
        expect(capabilities.get('build')).toEqual(await BuildName.get());
        expect(capabilities.get('name')).toEqual(await opts._logMgr.logName());
    });
    
    /**
     * WARNING: this test will attempt to create an actual session on BrowserStack
     * it should only be used for local debugging.
     * NOTE: you will need to set a value for the following via BrowserStackConfig
     * or as environment variables:
     * - browserstack_user
     * - browserstack_accesskey
     */
    xit('can create a session in BrowserStack', async () => {
        let plugin: BrowserStackSessionGeneratorPlugin = new BrowserStackSessionGeneratorPlugin({
            user: 'your-user',
            key: 'your-key',
            platform: new TestPlatform({
                browser: 'chrome',
                os: 'windows',
                osVersion: '10'
            })
        });
        await using (await plugin.newSession(), async (session: SeleniumSession) => {
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