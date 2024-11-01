import moment from 'moment';

export const formatDate = (date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${date.getDate()}/${date.getMonth() + 1} (${days[date.getDay()]})`;
};

export const isTimeDisabled = (timeStart, selectedDate) => {
  if (!selectedDate) return false;
  
  const [hours, minutes] = timeStart.split(':').map(Number);
  const selectedDateTime = new Date(selectedDate.date);
  selectedDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  return selectedDateTime <= now;
};

export const groupTimeSlots = (slots) => {
  const morning = slots.filter(slot => {
    const hour = parseInt(slot.timeStart.split(':')[0]);
    return hour >= 6 && hour < 12;
  });
  const afternoon = slots.filter(slot => {
    const hour = parseInt(slot.timeStart.split(':')[0]);
    return hour >= 12 && hour < 18;
  });
  const evening = slots.filter(slot => {
    const hour = parseInt(slot.timeStart.split(':')[0]);
    return hour >= 18 || hour < 6;
  });
  return { morning, afternoon, evening };
};

export const getAvailableDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    { 
      date: today, 
      label: `Hôm nay, ${formatDate(today)}`, 
      tag: today.getDay() === 0 || today.getDay() === 6 ? 'Cuối tuần' : 'Ngày thường' 
    },
    { 
      date: tomorrow, 
      label: `Ngày mai, ${formatDate(tomorrow)}`, 
      tag: tomorrow.getDay() === 0 || tomorrow.getDay() === 6 ? 'Cuối tuần' : 'Ngày thường' 
    }
  ];
}; 