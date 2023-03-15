#!/usr/bin/env -S deno run

function parseBigInt(string: string) {
	try {
		return BigInt(string);
	} catch (_) {
		throw SyntaxError("Can't parse \"" + string + "\" as a number");
	}
}

try {
	let result = 0n;
	Deno.args.forEach(arg => result += parseBigInt(arg));
	console.log(result.toString());
} catch (error) {
	console.error("ERROR: " + error.message);
	Deno.exit(1);
}
