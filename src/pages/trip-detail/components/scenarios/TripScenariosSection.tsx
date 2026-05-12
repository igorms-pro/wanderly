import { useState } from 'react';

import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';
import type { Activity } from '@/lib/types/database.types';
import { TripScenarioList } from './TripScenarioList';
import { CreateScenarioModal } from './CreateScenarioModal';
import { ScenarioPreviewModal } from './ScenarioPreviewModal';

interface TripScenariosSectionProps {
  scenarios: TripScenario[];
  sortedDates: string[];
  canCreate: boolean;
  canManage: boolean;
  canVoteScenario: boolean;
  votingScenarioId: string | null;
  winningScenarioIds: string[];
  getScenarioVoteCounts: (itineraryId: string) => { upvotes: number; downvotes: number };
  getUserScenarioVote: (itineraryId: string) => 'up' | 'down' | null;
  onScenarioVote: (itineraryId: string, choice: 'up' | 'down') => void;
  onGenerateAiScenario: () => Promise<void>;
  onCreateScenario: (title: string | null, days: { date: string; dayIndex?: number }[]) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onUseScenarioAsBase: (scenarioItineraryId: string) => Promise<void>;
  onAddScenarioActivityToItinerary: (date: string, activity: Activity) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function TripScenariosSection({
  scenarios,
  sortedDates,
  canCreate,
  canManage,
  canVoteScenario,
  votingScenarioId,
  winningScenarioIds,
  getScenarioVoteCounts,
  getUserScenarioVote,
  onScenarioVote,
  onGenerateAiScenario,
  onCreateScenario,
  onDeleteScenario,
  onUseScenarioAsBase,
  onAddScenarioActivityToItinerary,
  t,
}: TripScenariosSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewScenarioId, setPreviewScenarioId] = useState<string | null>(null);
  const previewScenario = previewScenarioId
    ? scenarios.find((s) => s.id === previewScenarioId)
    : null;
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('tripDetail.scenariosSectionTitle')}
        </h3>
        {canCreate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                try {
                  await onGenerateAiScenario();
                } finally {
                  setIsGenerating(false);
                }
              }}
              className="inline-flex items-center rounded-md bg-gray-900 dark:bg-gray-100 px-3 py-1.5 text-xs font-medium text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-60"
            >
              {isGenerating
                ? t('tripDetail.generatingScenario')
                : t('tripDetail.generateAiScenario')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
            >
              {t('tripDetail.addScenario')}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('tripDetail.scenariosSectionDescription')}
      </p>

      <TripScenarioList
        scenarios={scenarios}
        canManage={canManage}
        canVoteScenario={canVoteScenario}
        votingScenarioId={votingScenarioId}
        winningScenarioIds={winningScenarioIds}
        getScenarioVoteCounts={getScenarioVoteCounts}
        getUserScenarioVote={getUserScenarioVote}
        onScenarioVote={onScenarioVote}
        onDelete={onDeleteScenario}
        onPreview={(scenarioId) => setPreviewScenarioId(scenarioId)}
        t={t}
      />

      <CreateScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dates={sortedDates}
        onCreate={onCreateScenario}
        t={t}
      />

      {previewScenario && (
        <ScenarioPreviewModal
          scenario={previewScenario}
          isOpen={!!previewScenarioId}
          canManage={canManage}
          onClose={() => setPreviewScenarioId(null)}
          onUseAsBase={onUseScenarioAsBase}
          onAddToItinerary={onAddScenarioActivityToItinerary}
          t={t}
        />
      )}
    </section>
  );
}
