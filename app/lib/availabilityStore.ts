type AvailabilityData = {
  siteId: string;
  editToken: string;
  businessName: string;
  selectedDays: string[];
  dayTimes: Record<string, { start: string; end: string }>;

  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };

  logoDataUrl?: string;
  bookingUrl?: string;
};

const store = new Map<string, AvailabilityData>();

export function saveAvailability(data: AvailabilityData) {
  store.set(data.siteId, data);
}

export function getAvailability(siteId: string) {
  return store.get(siteId);
}

export function updateAvailability(
  siteId: string,
  data: AvailabilityData
) {
  const existing = store.get(siteId);

  store.set(siteId, {
    ...existing,
    ...data,
    siteId,
    contact: {
      ...existing?.contact,
      ...data.contact,
    },
  });
}