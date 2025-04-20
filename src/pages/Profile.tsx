import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import LocationInput from "@/components/LocationInput";
import { generateSummary } from "@/utils/resumeUtils";

const Profile = () => {
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("resume", file);

      // Simulate file upload and text extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const summary = await generateSummary({
        text: "Sample resume text for demonstration",
        fileName: file.name
      });

      // Update the professional summary textarea
      const summaryElement = document.getElementById("summary") as HTMLTextAreaElement;
      if (summaryElement) {
        summaryElement.value = summary;
      }

      toast({
        title: "Resume processed",
        description: "Professional summary has been generated from your resume.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "There was a problem processing your resume.",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personal Profile</h1>
          <p className="text-gray-500 mt-2">
            Manage your personal information for job applications
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  This information will be included in your job applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <LocationInput value={location} onChange={setLocation} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input id="linkedin" defaultValue="linkedin.com/in/johndoe" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Website</Label>
                  <Input id="portfolio" defaultValue="johndoe.dev" />
                </div>
              </CardContent>
            </Card>
            
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
                    defaultValue="Experienced software developer with 5+ years of expertise in web application development. Proficient in React, TypeScript, and Node.js. Strong problem-solving abilities and experience working in agile environments."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
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
                  <Select defaultValue="fulltime">
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
                  <Input id="salary" type="number" defaultValue="80000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select defaultValue="hybrid">
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
                  <Select defaultValue="yes">
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
                  <Select defaultValue="yes">
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
                      defaultChecked
                    />
                    <span className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:left-[22px] peer-checked:bg-white peer-checked:[&+.track]:bg-blue-600"></span>
                    <span className="track absolute inset-0 rounded-full transition-all"></span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  When enabled, employers may find your profile through our platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
