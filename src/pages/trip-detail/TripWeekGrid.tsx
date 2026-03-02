import { format, parseISO } from 'date-fns';
import { getWeeksForTrip, WEEKDAY_LABELS } from './itinerary-utils';

interface TripWeekGridProps {
  startDate: string;
  endDate: string;
  activitiesByDate: Record<string, { length: number }>;
  selectedDate: string | null;
  onSelectDay: (date: string | null) => void;
  t: (key: string) => string;
}

export function TripWeekGrid({
  startDate,
  endDate,
  activitiesByDate,
  selectedDate,
  onSelectDay,
  t,
}: TripWeekGridProps) {
  const weeks = getWeeksForTrip(startDate, endDate);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              {WEEKDAY_LABELS.map((label) => (
                <th
                  key={label}
                  className="px-2 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase border-b border-gray-200 dark:border-gray-600"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((row, weekIndex) => (
              <tr
                key={weekIndex}
                className="border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {row.map((dateStr, dayIndex) => {
                  const count = dateStr ? (activitiesByDate[dateStr]?.length ?? 0) : 0;
                  const isSelected = dateStr === selectedDate;
                  const isInTrip = dateStr !== null;

                  return (
                    <td
                      key={dayIndex}
                      className="p-2 align-top border-r border-gray-100 dark:border-gray-700 last:border-r-0"
                    >
                      {isInTrip ? (
                        <button
                          type="button"
                          onClick={() => onSelectDay(isSelected ? null : dateStr)}
                          className={`w-full min-h-[72px] sm:min-h-[80px] rounded-lg text-left p-2 transition ${
                            isSelected
                              ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {format(parseISO(dateStr), 'd')}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {format(parseISO(dateStr), 'MMM')}
                          </span>
                          {count > 0 && (
                            <span className="inline-flex items-center justify-center mt-1 min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {count}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="min-h-[72px] sm:min-h-[80px] rounded-lg p-2 bg-gray-50/50 dark:bg-gray-800/50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
