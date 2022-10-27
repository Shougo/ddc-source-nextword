import {
  BaseSource,
  Context,
  Item,
} from "https://deno.land/x/ddc_vim@v3.0.0/types.ts";
import { readLines } from "https://deno.land/std@0.161.0/io/mod.ts";
import { writeAll } from "https://deno.land/std@0.161.0/streams/mod.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
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
      console.error('[ddc-nextword] Run "nextword" is failed');
      console.error('[ddc-nextword] "nextword" binary seems not installed');
    }
  }

  async gather(args: {
    context: Context;
  }): Promise<Item[]> {
    if (!this._proc || !this._proc.stdin || !this._proc.stdout) {
      return [];
    }
    await writeAll(
      this._proc.stdin,
      new TextEncoder().encode(args.context.input + "\n"),
    );

    // Todo: Better implementation
    for await (const line of readLines(this._proc.stdout)) {
      return line.split(/\s/).map((word: string) => ({ word }));
    }

    return [];
  }

  params(): Params {
    return {};
  }
}
