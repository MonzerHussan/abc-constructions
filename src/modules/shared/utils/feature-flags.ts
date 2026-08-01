const flagEnv = (name: string): boolean => {
  return process.env[`FF_${name}`] === 'true';
};

export const featureFlags = {
  newProcurementFlow: flagEnv('NEW_PROCUREMENT'),
  aiSuggestions: flagEnv('AI_SUGGESTIONS'),
  workflowEngine: flagEnv('WORKFLOW_ENGINE'),
  marketplaceV2: flagEnv('MARKETPLACE_V2'),
  supplierPortal: flagEnv('SUPPLIER_PORTAL'),
  advancedAnalytics: flagEnv('ADVANCED_ANALYTICS'),
};

export function isFeatureEnabled(name: string): boolean {
  return process.env[`FF_${name}`] === 'true';
}
