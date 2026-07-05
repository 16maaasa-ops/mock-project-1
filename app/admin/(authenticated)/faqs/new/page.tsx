import { createFaq } from "@/lib/actions/faqs";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewFaqPage() {
  return (
    <form action={createFaq} className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        FAQを追加
      </h2>
      <Textarea label="質問" name="question" rows={3} required />
      <Textarea label="回答" name="answer" rows={5} required />
      <Button type="submit">追加する</Button>
    </form>
  );
}
