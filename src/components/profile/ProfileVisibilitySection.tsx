
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Props = {
  visibility: boolean;
  onChange: (value: boolean) => void;
};

export default function ProfileVisibilitySection({ visibility, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Visibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="visibility">Public Profile</Label>
          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
            <input
              type="checkbox"
              id="visibility"
              className="peer h-0 w-0 opacity-0"
              checked={visibility}
              onChange={e => onChange(e.target.checked)}
            />
            <span className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all ${visibility ? 'left-[22px] peer-checked:[&+.track]:bg-blue-600' : ''}`}></span>
            <span className={`track absolute inset-0 rounded-full transition-all ${visibility ? 'bg-blue-600' : ''}`}></span>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          When enabled, employers may find your profile through our platform.
        </p>
      </CardContent>
    </Card>
  );
}
