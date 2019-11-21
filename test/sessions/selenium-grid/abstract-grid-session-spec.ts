import * as selenium from "selenium-webdriver";
import { AbstractGridSession } from "../../../src/sessions/selenium-grid/abstract-grid-session";
import { TestLog, RandomGenerator } from "aft-core";
import { SessionOptions, TestPlatform } from "aft-ui";

describe('AbstractGridSession', () => {
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
});

class FakeGridSession extends AbstractGridSession {
    logger: TestLog;
    options: SessionOptions;
    getLogger(): TestLog {
        return this.logger;
    }
    
    async initialise(options: SessionOptions): Promise<void> {
        this.options = options;
    }
}