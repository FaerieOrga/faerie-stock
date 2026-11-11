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
  events,
  totalQuantity = 1
) => {
  if (!startDate || !endDate) return true;

  // 1. Vérifier les locations approuvées (statut 'approved')
  // Quantité déjà réservée (approuvée / en cours) sur la période
  let reservedQty = 0;
  rentalRequests?.forEach((req) => {
    // On ignore les demandes rejetées ou déjà retournées
    if (
      req.status === 'rejected' ||
      req.status === 'returned' ||
      req.status === 'pending'
    )
      return;

    const overlap = isOverlapping(
      startDate,
      endDate,
      req.start_date,
      req.end_date
    );
    if (!overlap) return;
    req.rental_items?.forEach((item) => {
      if (Number(item.object_id) === Number(objectId)) {
        reservedQty += Number(item.quantity) || 1;
      }
    });
  });

  if (reservedQty >= (Number(totalQuantity) || 1)) return false;

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

/**
 * Quantité d'un objet actuellement louée (demandes dans les statuts donnés)
 */
export const getRentedQuantity = (
  objectId,
  rentals = [],
  statuses = ['approved', 'ongoing']
) => {
  let total = 0;
  rentals?.forEach((r) => {
    if (!statuses.includes(r.status)) return;
    r.rental_items?.forEach((item) => {
      if (Number(item.object_id) === Number(objectId)) {
        total += Number(item.quantity) || 1;
      }
    });
  });
  return total;
};

/** Libellé du badge : "LOUÉ" ou "LOUÉ 3/10" si l'objet a plusieurs unités */
export const rentedLabel = (rentedQty, totalQty) =>
  Number(totalQty) > 1
    ? `LOUÉ ${Math.min(rentedQty, totalQty)}/${totalQty}`
    : 'LOUÉ';
