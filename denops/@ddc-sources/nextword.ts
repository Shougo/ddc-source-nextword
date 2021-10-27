import {
  BaseSource,
  Candidate,
  Context,
} from "https://deno.land/x/ddc_vim@v0.17.0/types.ts#^";
import {
  readLines, writeAll
} from "https://deno.land/std@0.113.0/io/mod.ts#^";

export class Source extends BaseSource<{}> {
  _proc: Deno.Process | undefined = undefined;

  constructor() {
    super();

    try {
      this._proc = Deno.run({
        cmd: ["nextword", "-n", "100", "-g"],
        stdout: "piped",
        stderr: "piped",
        stdin: "piped",
      });
    } catch (e) {
      console.error("[ddc-nextword] Run \"nextword\" is failed");
      console.error("[ddc-nextword] \"nextword\" binary seems not installed");
    }
  }

  async gatherCandidates(args: {
    context: Context,
  }): Promise<Candidate[]> {
    if (!this._proc || !this._proc.stdin || !this._proc.stdout) {
      return [];
    }
    await writeAll(this._proc.stdin,
                   new TextEncoder().encode(args.context.input + "\n"));

    // Todo: Better implementation
    for await (const line of readLines(this._proc.stdout)) {
      return line.split(/\s/).map((word: string) => ({ word }));
    }

    return [];
  }

  params(): {} { return {}; }
}
