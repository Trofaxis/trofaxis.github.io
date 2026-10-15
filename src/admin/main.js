// Panel de administración de Trofaxis (admin/index.html). No está en el menú de la app.
// Ojo: GitHub Pages es público. Esta página solo muestra datos que ya son públicos en el repo;
// datos privados necesitarían inicio de sesión de administrador (Supabase), no esta página.
import { viewCerebro, montarCerebro } from './cerebro.js';

const app = document.getElementById('app');
app.innerHTML = viewCerebro();
montarCerebro(document);
