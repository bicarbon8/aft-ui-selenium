import { BrowserStackSession } from "./browserstack-session";
import { ISessionGenerator, SessionOptions, ISession } from 'aft-ui';

@ISessionGenerator.register
export class BrowserStackSessionGenerator implements ISessionGenerator {
    provides: string = BrowserStackSession.name;
    
    async generate(options: SessionOptions): Promise<ISession> {
        let container: BrowserStackSession = new BrowserStackSession();
        await container.initialise(options);
        return container;
    }
}