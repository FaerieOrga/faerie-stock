/**
 * Vérifie si deux périodes se chevauchent
 */
export const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  return s1 <= e2 && e1 >= s2;
};

/**
 * Détermine si un objet est disponible sur une période donnée
 */
export const checkObjectAvailability = (
  objectId,
  startDate,
  endDate,
  rentalRequests,
  events
) => {
  if (!startDate || !endDate) return true;

  // 1. Vérifier les locations approuvées (statut 'approved')
  const hasRentalConflict = rentalRequests?.some((req) => {
    // On ignore les demandes rejetées ou déjà retournées
    if (
      req.status === 'rejected' ||
      req.status === 'returned' ||
      req.status === 'pending'
    )
      return false;

    const overlap = isOverlapping(
      startDate,
      endDate,
      req.start_date,
      req.end_date
    );
    const containsObject = req.rental_items?.some(
      (item) => Number(item.object_id) === Number(objectId)
    );

    return overlap && containsObject;
  });

  if (hasRentalConflict) return false;

  // 2. Vérifier les conflits avec les événements
  const hasEventConflict = events?.some((ev) => {
    const overlap = isOverlapping(
      startDate,
      endDate,
      ev.start_date,
      ev.end_date
    );
    const containsObject = ev.items?.some(
      (item) => Number(item.id) === Number(objectId)
    );

    return overlap && containsObject;
  });

  return !hasEventConflict;
};
