import {
  BaseSource,
  Candidate,
  Context,
  DdcOptions,
  Denops,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v0.0.13/types.ts#^";
import { Denops, } from "https://deno.land/x/ddc_vim@v0.0.13/deps.ts#^";
import {
  readLines, writeAll
} from "https://deno.land/std@0.104.0/io/mod.ts#^";

export class Source extends BaseSource {
  _proc: Deno.Process;

  async gatherCandidates(
    denops: Denops,
    context: Context,
    _options: SourceOptions,
    _sourceOptions: SourceOptions,
    _sourceParams: Record<string, unknown>,
    _completeStr: string,
  ): Promise<Candidate[]> {
    if (!this._proc) {
      this._proc = Deno.run({
        cmd: ["nextword", "-n", "100", "-g"],
        stdout: "piped",
        stderr: "piped",
        stdin: "piped",
      });
    }

    await writeAll(this._proc.stdin, new TextEncoder().encode(context.input + "\n"));

    // Todo: Better implementation
    for await (const line of readLines(this._proc.stdout)) {
      return line.split(/\s/).map((word) => ({ word }));
    }

    return [];
  }
}
