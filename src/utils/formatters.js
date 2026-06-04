/**
 * Nettoie et aplatit un tableau de catégories.
 * Gère les chaînes JSON mal formées et supprime les doublons/vides.
 */
export const cleanArray = (data) => {
  if (!data) return [];

  let arr = Array.isArray(data) ? data : [data];

  const flattened = arr.flatMap((item) => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      // Gestion récursive si la chaîne est un tableau JSON (ex: "[cat1, cat2]")
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? cleanArray(parsed) : [parsed];
        } catch (e) {
          return [item];
        }
      }
      return [trimmed];
    }
    return [item];
  });

  // Supprime les doublons, les valeurs nulles et les chaînes vides
  return [...new Set(flattened)].filter(
    (i) => i && typeof i === 'string' && i.trim() !== ''
  );
};

/**
 * Vérifie si une chaîne est au format date ISO (YYYY-MM-DD)
 */
export const cleanDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return '';
  return dateStr;
};

/**
 * Compresse une image côté client avant l'envoi vers Supabase
 * @param {File} file - Le fichier image brut
 * @returns {Promise<File>} - Le fichier compressé
 */
export const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Largeur max pour économiser du stockage
        const scale = MAX_WIDTH / img.width;

        // Si l'image est déjà petite, on ne la touche pas
        if (scale >= 1) {
          resolve(file);
          return;
        }

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.7 // Qualité à 70%
        );
      };
    };
  });
};

/**
 * Vérifie si une date de retour est dépassée par rapport à aujourd'hui
 */
export const isRentalOverdue = (dateString) => {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};
