export type ShowIfCondition = {
  questionCode: string;
  op: "eq" | "neq" | "in" | "notIn" | "includes" | "notIncludes" | "empty" | "notEmpty";
  value?: string | string[];
};

export type ShowIfRule =
  | ShowIfCondition
  | { operator: "and" | "or"; conditions: ShowIfRule[] };

export type SurveyAnswers = Record<string, unknown>;

function normalizeAnswer(value: unknown): string | string[] | null {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value.map(String);
  return String(value);
}

function evalCondition(condition: ShowIfCondition, answers: SurveyAnswers): boolean {
  const raw = answers[condition.questionCode];
  const answer = normalizeAnswer(raw);

  switch (condition.op) {
    case "empty":
      return answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0);
    case "notEmpty":
      return !(answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0));
    case "eq":
      return answer === condition.value;
    case "neq":
      return answer !== condition.value;
    case "in": {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value ?? ""];
      if (Array.isArray(answer)) return answer.some((a) => values.includes(a));
      return values.includes(answer ?? "");
    }
    case "notIn": {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value ?? ""];
      if (Array.isArray(answer)) return !answer.some((a) => values.includes(a));
      return !values.includes(answer ?? "");
    }
    case "includes": {
      const needle = String(condition.value ?? "");
      if (Array.isArray(answer)) return answer.includes(needle);
      return answer === needle;
    }
    case "notIncludes": {
      const needle = String(condition.value ?? "");
      if (Array.isArray(answer)) return !answer.includes(needle);
      return answer !== needle;
    }
    default:
      return true;
  }
}

export function evaluateShowIf(rule: ShowIfRule | null | undefined, answers: SurveyAnswers): boolean {
  if (!rule) return true;
  if ("operator" in rule && "conditions" in rule) {
    const results = rule.conditions.map((c) => evaluateShowIf(c, answers));
    return rule.operator === "and" ? results.every(Boolean) : results.some(Boolean);
  }
  return evalCondition(rule as ShowIfCondition, answers);
}
