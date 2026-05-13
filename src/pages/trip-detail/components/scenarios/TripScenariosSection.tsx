import { useState } from 'react';

import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';
import type { Activity } from '@/lib/types/database.types';
import { TripScenarioList } from './TripScenarioList';
import { CreateScenarioModal } from './CreateScenarioModal';
import { ScenarioPreviewModal } from './ScenarioPreviewModal';

interface TripScenariosSectionProps {
  scenarios: TripScenario[];
  sortedDates: string[];
  /** Manual scenario creation (any member during planning, stricter later). */
  canCreate: boolean;
  /** Owner / editor / moderator only — AI generation & higher quotas. */
  canGenerateAiScenario: boolean;
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
  constraintsHintLevel?: 'weak' | 'ok';
  aiScenarioCount?: number;
  maxAiScenariosPerTrip: number;
}

export function TripScenariosSection({
  scenarios,
  sortedDates,
  canCreate,
  canGenerateAiScenario,
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
  constraintsHintLevel = 'ok',
  aiScenarioCount = 0,
  maxAiScenariosPerTrip,
}: TripScenariosSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewScenarioId, setPreviewScenarioId] = useState<string | null>(null);
  const previewScenario = previewScenarioId
    ? scenarios.find((s) => s.id === previewScenarioId)
    : null;
  const [isGenerating, setIsGenerating] = useState(false);

  const showScenarioActions = canCreate || canGenerateAiScenario;

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('tripDetail.scenariosSectionTitle')}
        </h3>
        {showScenarioActions && (
          <div className="flex items-center gap-2">
            {canGenerateAiScenario ? (
              <button
                type="button"
                disabled={isGenerating || aiScenarioCount >= maxAiScenariosPerTrip}
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
            ) : null}
            {canCreate ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
              >
                {t('tripDetail.addScenario')}
              </button>
            ) : null}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('tripDetail.scenariosSectionDescription')}
      </p>

      {canGenerateAiScenario ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('tripDetail.aiQuotaUsage', {
            used: aiScenarioCount,
            max: maxAiScenariosPerTrip,
          })}
        </p>
      ) : null}

      {constraintsHintLevel === 'weak' && showScenarioActions && (
        <div
          className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          <p className="font-medium">{t('tripDetail.aiConstraintsHintTitle')}</p>
          <p className="mt-1 opacity-90">{t('tripDetail.aiConstraintsHintBody')}</p>
        </div>
      )}

      {isGenerating && (
        <div
          className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/60"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {t('tripDetail.aiGeneratingProgress')}
          </p>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            aria-hidden
          >
            <div className="h-full w-2/5 animate-pulse rounded-full bg-orange-500" />
          </div>
        </div>
      )}

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
