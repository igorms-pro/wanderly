import type { ActivityFormData } from '../types';
import { ActivityFormAdvancedSection } from './ActivityFormAdvancedSection';
import { ActivityFormAiSuggestions } from './ActivityFormAiSuggestions';
import { ActivityFormBasicSection } from './ActivityFormBasicSection';
import { ActivityFormCostSection } from './ActivityFormCostSection';
import { ActivityFormScheduleSection } from './ActivityFormScheduleSection';
import { ActivityFormTransportSection } from './ActivityFormTransportSection';

interface ActivityFormSectionsProps {
  tripId: string;
  tripDestination: string;
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
  excludeActivityId?: string | null;
}

export function ActivityFormSections({
  tripId,
  tripDestination,
  formData,
  onChange,
  excludeActivityId,
}: ActivityFormSectionsProps) {
  return (
    <>
      <ActivityFormBasicSection formData={formData} onChange={onChange} />
      <ActivityFormScheduleSection formData={formData} onChange={onChange} />
      <ActivityFormAiSuggestions
        tripId={tripId}
        tripDestination={tripDestination}
        formData={formData}
        onChange={onChange}
        excludeActivityId={excludeActivityId}
      />
      <ActivityFormCostSection formData={formData} onChange={onChange} />
      <ActivityFormTransportSection formData={formData} onChange={onChange} />
      <ActivityFormAdvancedSection formData={formData} onChange={onChange} />
    </>
  );
}

export type { ActivityFormData };
