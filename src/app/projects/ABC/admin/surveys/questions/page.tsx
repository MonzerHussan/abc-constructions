import { QuestionBankManager } from "@/components/admin/survey/QuestionBankManager";
import { surveyCategories } from "@/lib/data/survey-categories";

export default function AdminSurveyQuestionsPage() {
  const categoryIds = surveyCategories.map((c) => c.id);
  return <QuestionBankManager categories={categoryIds} />;
}