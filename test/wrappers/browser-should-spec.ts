import { ProcessingResult } from "../../../aft-core/src";
import { SessionGeneratorPluginManager } from "../../../aft-ui/src";
import { browserShould, BrowserTestWrapperOptions } from "../../src";

let consoleLog = console.log;
describe('browserShould', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('returns an IProcessingResult', async () => {
        let expected: ProcessingResult = await browserShould({
            expect: () => expect(true).toBeTruthy(), 
            _sessionGenPluginMgr: new SessionGeneratorPluginManager({pluginNames: ['fake-session-generator-plugin']})
        });

        expect(expected).toBeDefined();
        expect(expected.success).toBeTruthy();
    });
    
    it('supports passing in BrowserTestWrapperOptions', async () => {
        let options: BrowserTestWrapperOptions = {
            expect: () => expect(false).toBeFalsy(),
            testCases: ['C1234'],
            defects: ['AUTO-123'],
            description: 'false should always be falsy',
            _sessionGenPluginMgr: new SessionGeneratorPluginManager({pluginNames: ['fake-session-generator-plugin']})
        };
        let expected: ProcessingResult = await browserShould(options);

        expect(expected).toBeDefined();
        expect(expected).toBeTruthy();
    });
});