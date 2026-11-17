export function parseJsonExt(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function flattenAnswers(ext, prefix = '') {
  return Object.entries(ext || {}).flatMap(([key, value]) => {
    const field = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value) && key !== 'members') return flattenAnswers(value, field);
    const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
    return [{ field, value: text }];
  }).sort((a, b) => a.field.localeCompare(b.field));
}

export const districtOf = (location) => location?.parent?.parent?.name ?? '';

export const householdOf = (individual) => individual?.memberships?.edges?.[0]?.node?.group;

export function setTextFilter(onChangeFilters, id, value, toFilter) {
  onChangeFilters([value ? { id, value, filter: toFilter(value) } : { id, value: null }]);
}
