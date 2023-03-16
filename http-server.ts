#!/usr/bin/env -S deno run --allow-net --allow-read

import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";

const BASE_PATH = new URL(".", import.meta.url).pathname.slice(0, -1);
const STATIC_FILES_PATH = BASE_PATH + "/public";

const MIME_TYPES = {
	html: "text/html; charset=UTF-8",
	js: "application/javascript",
	css: "text/css",
	svg: "image/svg+xml",
	bin: "application/octet-stream",
};

// "ohneatrhentar.nothrea".substring("ohneatrhentar.nothrea".lastIndexOf(".") + 1)

const httpRequestHandler = async (req: Request) => {
	// TODO: Do I have vulnerability in this line?
	// Can pathname start not with slash?
	// Can pathname have a bunch of .. in it?
	const path = (STATIC_FILES_PATH + new URL(req.url).pathname)
		.replace(/\/+$/, "/index.html").replace(/\/+/g, "/");
	console.log(new URL(req.url).pathname, "->", path);
	if (!(path in staticFiles)) await loadFile(path);
	const status = path in staticFiles ? 200 : 404;
	const file = staticFiles[path] ?? staticFiles[BASE_PATH + "/404.html"];
	return new Response(file.body, {
		status: status,
		headers: { "content-type": file.type },
	});
};

const staticFiles = {};
const loadFile = async (path: string) => {
	console.log("loading", path);
	try {
		const body = await Deno.readFile(path);
		const type = MIME_TYPES[getExtension(path)] ?? MIME_TYPES.bin;
		const watcher = Deno.watchFs(path);
		updateFile(path, watcher);
		staticFiles[path] = { body, type, watcher };
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) return;
		console.error(path, error);
	}
};

const updateFile = async (path: string, watcher: Deno.FsWatcher) => {
	for await (const event of watcher) {
		if (event.kind == "modify" || event.kind == "remove") {
			delete staticFiles[path];
			console.log(path, "has been updated");
			await loadFile(path);
			break;
		}
	}
};

const getExtension = (path: string) => {
	return path.substring(path.lastIndexOf(".") + 1);
};

loadFile(BASE_PATH + "/404.html");
serve(httpRequestHandler);
