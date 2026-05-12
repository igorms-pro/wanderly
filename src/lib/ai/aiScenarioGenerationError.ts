export type AiScenarioGenerationCode =
  | 'quota_exceeded'
  | 'openai_config'
  | 'openai_auth'
  | 'openai_rate_limit'
  | 'openai_server'
  | 'openai_parse'
  | 'openai_network'
  | 'unknown';

const I18N_BY_CODE: Record<AiScenarioGenerationCode, string> = {
  quota_exceeded: 'tripDetail.aiErrorQuota',
  openai_config: 'tripDetail.aiErrorConfig',
  openai_auth: 'tripDetail.aiErrorAuth',
  openai_rate_limit: 'tripDetail.aiErrorRateLimit',
  openai_server: 'tripDetail.aiErrorServer',
  openai_parse: 'tripDetail.aiErrorParse',
  openai_network: 'tripDetail.aiErrorNetwork',
  unknown: 'tripDetail.aiGenerateErrorGeneric',
};

export class AiScenarioGenerationError extends Error {
  readonly code: AiScenarioGenerationCode;

  constructor(code: AiScenarioGenerationCode, message?: string) {
    super(message ?? code);
    this.name = 'AiScenarioGenerationError';
    this.code = code;
  }

  i18nKey(): string {
    return I18N_BY_CODE[this.code];
  }
}
