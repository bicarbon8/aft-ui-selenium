import { ISessionGenerator, SessionOptions, ISession } from 'aft-ui';
import { SauceLabsSession } from './sauce-labs-session';

@ISessionGenerator.register
export class SauceLabsSessionGenerator implements ISessionGenerator {
    provides: string = SauceLabsSession.name;
    
    async generate(options: SessionOptions): Promise<ISession> {
        let session: SauceLabsSession = new SauceLabsSession();
        await session.initialise(options);
        return session;
    }
}