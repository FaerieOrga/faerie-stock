import React from 'react';
import { Box } from 'lucide-react';
import { PRO_ICONS } from '../../utils/constants'; // Ou là où tu as mis tes constantes

/**
 * Affiche l'image d'un objet ou d'une caisse.
 * Supporte : URLs (http), Icônes (icon:id) et Emojis.
 * * @param {string} src - La source de l'image (URL, "icon:sword", ou emoji)
 * @param {string} className - Classes CSS additionnelles pour le conteneur
 * @param {string} size - Taille du texte pour les emojis ou icônes (ex: text-4xl)
 */
const DisplayImage = ({ src, className = '', size = 'text-4xl' }) => {
  // 1. Cas : Pas de source fournie
  if (!src || typeof src !== 'string') {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-md text-slate-400 ${className}`}
      >
        <Box size={24} />
      </div>
    );
  }

  // 2. Cas : URL classique (Stockage Supabase ou lien externe)
  if (src.startsWith('http')) {
    return (
      <div
        className={`overflow-hidden rounded-md bg-slate-100 flex items-center justify-center ${className}`}
      >
        <img
          src={src}
          alt="Illustration objet"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Cas : Icône prédéfinie (format "icon:nom_icone")
  if (src.startsWith('icon:')) {
    const iconId = src.split(':')[1];
    const iconDef = PRO_ICONS.find((i) => i.id === iconId);

    // On récupère le composant Lucide associé, sinon on met une Box par défaut
    const IconComponent = iconDef ? iconDef.icon : Box;

    // Calcul dynamique de la taille de l'icône SVG basé sur la classe de taille
    const svgSize = size.includes('text-xl')
      ? 20
      : size.includes('text-2xl')
      ? 24
      : size.includes('text-4xl')
      ? 32
      : size.includes('text-6xl')
      ? 48
      : 64;

    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-md text-slate-600 ${className}`}
      >
        <IconComponent size={svgSize} strokeWidth={1.5} />
      </div>
    );
  }

  // 4. Cas par défaut : On affiche tel quel (pour les Emojis par exemple)
  return (
    <span
      className={`flex items-center justify-center bg-slate-50 rounded-md ${size} ${className}`}
    >
      {src}
    </span>
  );
};

export default DisplayImage;
