import { BrowserStackSession } from "./browserstack-session";
import { ISessionGenerator, SessionOptions, ISession } from 'aft-ui';

@ISessionGenerator.register
export class BrowserStackSessionGenerator implements ISessionGenerator {
    provides: string = BrowserStackSession.name;
    
    async generate(options: SessionOptions): Promise<ISession> {
        let session: BrowserStackSession = new BrowserStackSession();
        await session.initialise(options);
        return session;
    }
}