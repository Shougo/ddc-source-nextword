import {
  BaseSource,
  Context,
  Item,
} from "https://deno.land/x/ddc_vim@v3.9.1/types.ts";
import { Lock } from "https://deno.land/x/ddc_vim@v3.9.1/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.196.0/streams/mod.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  private _proc: Deno.ChildProcess | undefined = undefined;
  private _lock = new Lock(0);

  constructor() {
    super();

    try {
      this._proc = new Deno.Command(
        "nextword",
        {
          args: ["-n", "100", "-g"],
          stdout: "piped",
          stderr: "piped",
          stdin: "piped",
        },
      ).spawn();
    } catch (_e) {
      console.error('[ddc-nextword] Run "nextword" is failed');
      console.error('[ddc-nextword] "nextword" binary seems not installed');
    }
  }

  override async gather(args: {
    context: Context;
    completeStr: string;
  }): Promise<Item[]> {
    if (!this._proc || !this._proc.stdin || !this._proc.stdout) {
      return [];
    }

    const proc = this._proc;
    let items: Item[] = [];

    await this._lock.lock(async () => {
      items = await this._gather(args.context, args.completeStr, proc);
    });

    return items;
  }

  async _gather(
    context: Context,
    completeStr: string,
    proc: Deno.ChildProcess,
  ): Promise<Item[]> {
    const [sentence, offset] = extractWords(completeStr);
    const query = offset > 0 ? sentence : context.input;
    const precedingLetters = completeStr.slice(0, offset);

    const writer = proc.stdin.getWriter();
    await writer.ready;
    await writer.write(new TextEncoder().encode(query + "\n"));
    writer.releaseLock();

    try {
      for await (const line of iterLine(proc.stdout)) {
        return line.split(/\s/).map((word: string) => ({
          word: precedingLetters.concat(word),
        }));
      }
    } catch (_e) {
      // NOTE: ReadableStream may be locked
    }

    return [];
  }

  override params(): Params {
    return {};
  }
}

async function* iterLine(r: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const lines = r
    .pipeThrough(new TextDecoderStream(), {
      preventCancel: true,
      preventClose: true,
    })
    .pipeThrough(new TextLineStream());

  for await (const line of lines) {
    if ((line as string).length) {
      yield line as string;
    }
  }
}

function extractWords(
  completeStr: string,
): [string, number] {
  const upperCaseRegexp = /[A-Z][A-Z]+/g;
  const camelCaseRegexp = /([A-Z]?[a-z]+|[A-Z][a-z]*)/g; // Also matched to PascalCase
  const snakeCaseRegexp = /[a-z][a-z]*/g; // Also matched to kebab-case, etc.
  let matches: string[] | null = completeStr.match(upperCaseRegexp);
  if (matches === null) matches = completeStr.match(camelCaseRegexp);
  if (matches === null) matches = completeStr.match(snakeCaseRegexp);
  if (matches === null) return [completeStr, 0];
  const sentence = matches.join(" ");
  if (completeStr.match(/[^a-zA-Z]+$/)) {
    return [sentence.concat(" "), completeStr.length];
  }
  const lastWord = matches.at(-1) || completeStr;
  const offset = completeStr.lastIndexOf(lastWord);
  return [sentence, offset];
}
