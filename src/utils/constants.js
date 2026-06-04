import { 
  Box, Sword, Shield, Shirt, Crown, Scroll, Tent, Hammer, 
  Gem, Flag, MapPin, Key, Archive, Flame, Ticket, Skull, 
  Star, Trophy, Lock, Zap 
} from 'lucide-react';

/**
 * Liste des icônes disponibles pour les objets sans photo réelle.
 * Utilisé par le composant DisplayImage.
 */
export const PRO_ICONS = [
  { id: 'box', icon: Box, label: 'Caisse' },
  { id: 'sword', icon: Sword, label: 'Arme' },
  { id: 'shield', icon: Shield, label: 'Bouclier' },
  { id: 'shirt', icon: Shirt, label: 'Costume' },
  { id: 'crown', icon: Crown, label: 'VIP' },
  { id: 'scroll', icon: Scroll, label: 'Papier' },
  { id: 'tent', icon: Tent, label: 'Camp' },
  { id: 'hammer', icon: Hammer, label: 'Outil' },
  { id: 'gem', icon: Gem, label: 'Trésor' },
  { id: 'flag', icon: Flag, label: 'Faction' },
  { id: 'map', icon: MapPin, label: 'Carte' },
  { id: 'key', icon: Key, label: 'Clé' },
  { id: 'archive', icon: Archive, label: 'Stock' },
  { id: 'flame', icon: Flame, label: 'Lumière' },
  { id: 'ticket', icon: Ticket, label: 'Event' },
  { id: 'skull', icon: Skull, label: 'Danger' },
  { id: 'star', icon: Star, label: 'Unique' },
  { id: 'trophy', icon: Trophy, label: 'Prix' },
  { id: 'lock', icon: Lock, label: 'Sécurisé' },
  { id: 'zap', icon: Zap, label: 'Magie' },
];

/**
 * Liste exhaustive des catégories de matériel.
 * Triée par ordre alphabétique.
 */
export const CATEGORIES = [
  'Accessoire',
  'Arme',
  'Armure/Bouclier',
  'Autre',
  'Bibliothèque/Archives',
  'Bijoux/Parures',
  'Bivouac',
  'Bureau',
  'Chapeau/coiffe',
  'Compta/Tréso',
  'Communication',
  'Consommable',
  'Costume',
  'Craft',
  'Cuisine',
  'Déco/Décorum',
  'Documentation',
  'Élec/Son',
  'Éclairage',
  'Forge/Atelier',
  'Forgeron',
  'Grimoire/Livres',
  'Hygiène',
  'Infirmerie',
  'Jeu',
  'Logistique',
  'Maquillage/Prothèses',
  'Masque',
  'Monnaie/Économie',
  'Organisation',
  'Parking',
  'Outil',
  'Premiers soins',
  'Rangement',
  'Sécurité',
  'Signalétique',
  'Stockage',
  'Taverne/Auberge',
  'Véhicule',
].sort((a, b) => a.localeCompare(b, 'fr'));

/**
 * États possibles d'un objet
 */
export const ITEM_STATES = [
  'Neuf',
  'Bon',
  'Satisfaisant',
  'À réparer',
  'HS'
];