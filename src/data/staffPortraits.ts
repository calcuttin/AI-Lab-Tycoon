/** One hundred original faces. The first nine keep their legacy ordering permanently. */
export const staffPortraitIds = [
  "staff-01", "staff-02", "staff-03", "staff-04", "staff-05", "staff-06", "staff-07", "staff-08", "staff-09", "staff-10",
  "staff-11", "staff-12", "staff-13", "staff-14", "staff-15", "staff-16", "staff-17", "staff-18", "staff-19", "staff-20",
  "staff-21", "staff-22", "staff-23", "staff-24", "staff-25", "staff-26", "staff-27", "staff-28", "staff-29", "staff-30",
  "staff-31", "staff-32", "staff-33", "staff-34", "staff-35", "staff-36", "staff-37", "staff-38", "staff-39", "staff-40",
  "staff-41", "staff-42", "staff-43", "staff-44", "staff-45", "staff-46", "staff-47", "staff-48", "staff-49", "staff-50",
  "staff-51", "staff-52", "staff-53", "staff-54", "staff-55", "staff-56", "staff-57", "staff-58", "staff-59", "staff-60",
  "staff-61", "staff-62", "staff-63", "staff-64", "staff-65", "staff-66", "staff-67", "staff-68", "staff-69", "staff-70",
  "staff-71", "staff-72", "staff-73", "staff-74", "staff-75", "staff-76", "staff-77", "staff-78", "staff-79", "staff-80",
  "staff-81", "staff-82", "staff-83", "staff-84", "staff-85", "staff-86", "staff-87", "staff-88", "staff-89", "staff-90",
  "staff-91", "staff-92", "staff-93", "staff-94", "staff-95", "staff-96", "staff-97", "staff-98", "staff-99", "staff-100",
] as const;

// Freeze the original fallback pool: expanding recruiting must never recast older saves.
const legacyPortraitIds = staffPortraitIds.slice(0, 9);
export type StaffPortraitId = typeof staffPortraitIds[number];

export function getStaffPortraitId(id: string, saved?: string): StaffPortraitId {
  if (saved && staffPortraitIds.includes(saved as StaffPortraitId)) return saved as StaffPortraitId;
  // Older saves need no migration: employee ID alone supplies a stable fallback.
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) hash = Math.imul(hash ^ id.charCodeAt(i), 16777619) >>> 0;
  return legacyPortraitIds[hash % legacyPortraitIds.length];
}

export function chooseStaffPortraitId(staff: readonly { id: string; portraitId?: string }[]): StaffPortraitId {
  const counts = new Map<StaffPortraitId, number>(staffPortraitIds.map((id) => [id, 0]));
  for (const person of staff) {
    const id = getStaffPortraitId(person.id, person.portraitId);
    counts.set(id, counts.get(id)! + 1);
  }
  const minimum = Math.min(...counts.values());
  const available = staffPortraitIds.filter((id) => counts.get(id) === minimum);
  return available[Math.floor(Math.random() * available.length)];
}
