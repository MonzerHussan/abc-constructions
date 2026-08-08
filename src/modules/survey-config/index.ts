export { SurveyConfigService } from '@/modules/survey-config/services/SurveyConfigService';

export {
  surveyConfigItemSchema,
  surveyConfigSchema,
  createSurveyConfigItemSchema,
  updateSurveyConfigItemSchema,
  reorderSurveyConfigSchema,
} from '@/modules/survey-config/validators/survey-config-schemas';

export type {
  SurveyConfig,
  SurveyConfigItem,
  CreateSurveyConfigItemInput,
  UpdateSurveyConfigItemInput,
  ReorderSurveyConfigInput,
} from '@/modules/survey-config/validators/survey-config-schemas';

import { SurveyConfigService } from '@/modules/survey-config/services/SurveyConfigService';

export const surveyConfigService = new SurveyConfigService();
