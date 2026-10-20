/** Prepend a record unless the collection already contains the same server ID. */
export function prependUniqueById(items, item) {
  const id = item?.id ?? item?._id;
  if (id == null) return [item, ...items];
  return items.some((existing) => (existing?.id ?? existing?._id) === id)
    ? items
    : [item, ...items];
}
