import { ProcessingResult } from "aft-core";
import { BrowserTestWrapper, BrowserTestWrapperOptions } from "./browser-test-wrapper";

/**
 * function creates a new {BrowserTestWrapper} that can be used like:
 * ```
 * await browserShould({expect: async (tw) => {
 *     let facet: SeleniumFacet = await tw.session.getFacet(SeleniumFacet, {locator: By.css('div.foo')}); 
 *     expect(await facet.getRoot().getText()).toEqual('foo text');
 * }});
 * await browserShould({expect: () => expect(true).toBeTruthy(), description: 'expect true will always be truthy'});
 * await browserShould({expect: () => expect(false).toBeFalsy(), testCases: ['C1234'], description: 'expect false is always falsy'});
 * await browserShould({expect: () => expect('foo').toBe('foo')});
 * ```
 * @param options a {BrowserTestWrapperOptions} object containing the expectation and other options
 */
 export const browserShould = async function(options: BrowserTestWrapperOptions): Promise<ProcessingResult> {
    let t: BrowserTestWrapper = new BrowserTestWrapper(options);
    return await t.run();
}