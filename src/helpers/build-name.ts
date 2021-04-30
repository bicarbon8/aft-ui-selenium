import { BuildInfoPluginManager, MachineInfo, MachineInfoData } from "aft-core";

export module BuildName {
    export async function get(): Promise<string> {
        let job: string = await BuildInfoPluginManager.instance().getBuildName();
        if (job) {
            job = formatString(job);
            let build: string = await BuildInfoPluginManager.instance().getBuildNumber();
            build = formatString(build);
            return `${job}_${build}`;
        } else {
            let mi: MachineInfoData = await MachineInfo.get();
            let username: string = formatString(mi.user);
            let machine: string = formatString(mi.name);
            let d = new Date();
            let month: number = d.getUTCMonth() + 1;
            let monthStr: string = month.toString();
            if (month < 10) {
                monthStr = '0' + month;
            }
            let day: number = d.getUTCDate();
            let dayStr: string = day.toString();
            if (day < 10) {
                dayStr = '0' + day;
            }
            let now: string = formatString(`${d.getUTCFullYear()}${monthStr}${dayStr}`);
            return `${username}_${machine}_${now}`;
        }
    }

    function formatString(input: string): string {
        return input.replace(/[\()\;\\\/\|\<\>""'*&^%$#@!,.\-\+_=\?]/gi, '');
    }
}