/**
 * Generates one-hour booking slots between startHour and endHour for a given date.
 * Default operating hours: 06:00 to 22:00.
 * Standard duration: 60 minutes.
 */
export const generateTimeSlots = (dateStr, startHour = 6, endHour = 22) => {
  const slots = [];
  const baseDate = new Date(dateStr);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  for (let hour = startHour; hour < endHour; hour++) {
    const minute = 0;
    const slotStart = new Date(year, month, day, hour, minute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 60 minutes duration

    const formatTime = (d) => {
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      displayTime: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
      startHourMinute: formatTime(slotStart),
    });
  }

  return slots;
};
