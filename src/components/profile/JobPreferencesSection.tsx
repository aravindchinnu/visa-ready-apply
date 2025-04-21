
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
  formData: any;
  onChange: (field: string, value: any) => void;
};

export default function JobPreferencesSection({ formData, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Preferences</CardTitle>
        <CardDescription>
          Define your job search criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type</Label>
          <Select
            value={formData.job_type}
            onValueChange={v => onChange('job_type', v)}
          >
            <SelectTrigger id="jobType">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fulltime">Full-Time</SelectItem>
              <SelectItem value="parttime">Part-Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Minimum Salary</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={e => onChange('salary', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workMode">Work Mode</Label>
          <Select
            value={formData.work_mode}
            onValueChange={v => onChange('work_mode', v)}
          >
            <SelectTrigger id="workMode">
              <SelectValue placeholder="Select work mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="relocation">Willing to Relocate</Label>
          <Select
            value={formData.relocation}
            onValueChange={v => onChange('relocation', v)}
          >
            <SelectTrigger id="relocation">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="certain">For Certain Locations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="h1b">Require H1B Sponsorship</Label>
          <Select
            value={formData.h1b}
            onValueChange={v => onChange('h1b', v)}
          >
            <SelectTrigger id="h1b">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
