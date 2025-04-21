
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  summary: string;
  onChange: (value: string) => void;
};

export default function ProfessionalSummarySection({ summary, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
        <CardDescription>
          A brief summary of your professional background and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            rows={5}
            value={summary}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
