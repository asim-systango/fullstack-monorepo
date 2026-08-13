/** Matches backend staff password: name without spaces + @123 */
export function staffPasswordFromRestaurantName(restaurantName: string): string {
  const compact = restaurantName.trim().replace(/\s+/g, '');
  if (!compact) return 'Restaurant@123';
  const prefix = compact.charAt(0).toUpperCase() + compact.slice(1).toLowerCase();
  return `${prefix}@123`;
}
