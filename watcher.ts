#!/usr/bin/env -S deno run --allow-read

const BASE_PATH = new URL(".", import.meta.url).pathname.slice(0, -1);
const watcher = Deno.watchFs(BASE_PATH);
for await (const event of watcher) {
	console.log(event.kind, event.paths, event.flag);
}
