// Fotos del empaque por SKU. Se usan con los datos de ejemplo y también cuando la API
// todavía no tiene fotos cargadas para una presentación.
import bolsaFrenteGrano from '../assets/images/bolsas/bolsa-frente-grano.webp';
import bolsaAtrasGrano from '../assets/images/bolsas/bolsa-atras-grano.webp';
import bolsaFrenteMolido from '../assets/images/bolsas/bolsa-frente-molido.webp';
import bolsaAtrasMolido from '../assets/images/bolsas/bolsa-atras-molido.webp';

const PHOTOS = {
  'LEG-GRANO-500': [bolsaFrenteGrano, bolsaAtrasGrano],
  'LEG-MOLIDO-500': [bolsaFrenteMolido, bolsaAtrasMolido],
};

export function productImages(sku, name, grind, remote = {}) {
  const [front, back] = PHOTOS[sku] || [];
  const label = `${name} ${grind.toLowerCase() === 'grano' ? 'en grano' : grind.toLowerCase()}`;
  return [
    { src: remote.front || front, alt: `Bolsa de ${label}, vista de frente` },
    { src: remote.back || back, alt: `Reverso de la bolsa de ${label}, con origen y perfil de taza` },
  ].filter((image) => image.src);
}
