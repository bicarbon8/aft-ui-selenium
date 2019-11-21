import { ISessionGenerator, SessionOptions, ISession } from 'aft-ui';
import { SeleniumGridSession } from './selenium-grid-session';

@ISessionGenerator.register
export class SeleniumGridSessionGenerator implements ISessionGenerator {
    provides: string = SeleniumGridSession.name;
    
    async generate(options: SessionOptions): Promise<ISession> {
        let session: SeleniumGridSession = new SeleniumGridSession();
        await session.initialise(options);
        return session;
    }
}