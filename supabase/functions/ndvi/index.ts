import { handleNdvi } from './handler.js';

Deno.serve((request) => handleNdvi(request, { env: Deno.env, fetchFn: fetch }));
