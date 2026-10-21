import { handleBorrarCuenta } from './handler.js';

Deno.serve((request) => handleBorrarCuenta(request, { env: Deno.env, fetchFn: fetch }));
