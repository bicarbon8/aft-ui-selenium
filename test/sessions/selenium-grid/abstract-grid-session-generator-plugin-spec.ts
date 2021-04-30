import { Capabilities } from "selenium-webdriver";
import { nameof } from "ts-simple-nameof";
import { rand } from "aft-core";
import { AbstractGridSessionGeneratorPlugin, SeleniumGridSessionPluginOptions } from "../../../src";

describe('AbstractGridSessionGeneratorPlugin', () => {
    beforeEach(() => {
        jasmine.getEnv().allowRespy(true);
    });
    
    it('can generate capabilities from the passed in SessionOptions', async () => {
        let caps: Capabilities = new Capabilities({
            'custom1': `custom1-${rand.getString(10)}`,
            'custom2': `custom2-${rand.getString(10)}`,
            'custom3': `custom3-${rand.getString(10)}`,
            'custom4': `custom4-${rand.getString(10)}`
        });
        let session: FakeGridSession = new FakeGridSession({capabilities: caps});
        let actual: Capabilities = await session.getCapabilities();

        for (var prop in caps) {
            expect(actual.get(prop)).toEqual(caps.get(prop));
        }
    });
});

class FakeGridSession extends AbstractGridSessionGeneratorPlugin {
    constructor(options?: SeleniumGridSessionPluginOptions) {
        super(nameof(FakeGridSession).toLowerCase(), options);
    }
    async getCapabilities(): Promise<Capabilities> {
        return new Capabilities();
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }
}