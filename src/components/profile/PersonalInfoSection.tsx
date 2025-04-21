
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LocationInput from "@/components/LocationInput";

type Props = {
  formData: any;
  onChange: (field: string, value: any) => void;
  location: string;
  setLocation: (v: string) => void;
};

export default function PersonalInfoSection({ formData, onChange, location, setLocation }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>This information will be included in your job applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.first_name}
              onChange={e => onChange('first_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.last_name}
              onChange={e => onChange('last_name', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => onChange('phone', e.target.value)}
            />
          </div>
          <LocationInput value={location} onChange={setLocation} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={e => onChange('linkedin', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio/Website</Label>
          <Input
            id="portfolio"
            value={formData.portfolio}
            onChange={e => onChange('portfolio', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
