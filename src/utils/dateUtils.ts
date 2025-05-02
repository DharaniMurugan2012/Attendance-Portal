
import { format } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, 'MMM dd, yyyy');
};

export const formatTime = (timeStr: string): string => {
  const date = new Date(`2000-01-01T${timeStr}`);
  return format(date, 'hh:mm a');
};

export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm:ss');
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    case 'half-day':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
