type AvailabilityData = {
  siteId: string;
  editToken: string;
  businessName: string;
  selectedDays: string[];
  dayTimes: Record<string, { start: string; end: string }>;
};

const store = new Map<string, AvailabilityData>();

export function saveAvailability(data: AvailabilityData) {
  store.set(data.siteId, data);
}

export function getAvailability(siteId: string) {
  return store.get(siteId);
}

export function updateAvailability(siteId: string, data: AvailabilityData) {
  store.set(siteId, data);
}