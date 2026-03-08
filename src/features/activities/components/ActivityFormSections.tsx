import type { ActivityFormData } from '../types';
import { ActivityFormAdvancedSection } from './ActivityFormAdvancedSection';
import { ActivityFormBasicSection } from './ActivityFormBasicSection';
import { ActivityFormCostSection } from './ActivityFormCostSection';
import { ActivityFormScheduleSection } from './ActivityFormScheduleSection';
import { ActivityFormTransportSection } from './ActivityFormTransportSection';

interface ActivityFormSectionsProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityFormSections({ formData, onChange }: ActivityFormSectionsProps) {
  return (
    <>
      <ActivityFormBasicSection formData={formData} onChange={onChange} />
      <ActivityFormScheduleSection formData={formData} onChange={onChange} />
      <ActivityFormCostSection formData={formData} onChange={onChange} />
      <ActivityFormTransportSection formData={formData} onChange={onChange} />
      <ActivityFormAdvancedSection formData={formData} onChange={onChange} />
    </>
  );
}

export type { ActivityFormData };
