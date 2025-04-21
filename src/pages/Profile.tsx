
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import LocationInput from "@/components/LocationInput";
import { generateSummary } from "@/utils/resumeUtils";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio: string | null;
  summary: string | null;
  job_type: string | null;
  salary: number | null;
  work_mode: string | null;
  relocation: string | null;
  h1b: string | null;
  visibility: boolean | null;
}

const Profile = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [formData, setFormData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    job_type: "fulltime",
    salary: 80000,
    work_mode: "hybrid",
    relocation: "yes",
    h1b: "yes",
    visibility: true,
    location: ""
  });
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            linkedin: data.linkedin || "",
            portfolio: data.portfolio || "",
            summary: data.summary || "",
            job_type: data.job_type || "fulltime",
            // Fix here - ensure salary is parsed as a number
            salary: data.salary || 80000,
            work_mode: data.work_mode || "hybrid",
            relocation: data.relocation || "yes",
            h1b: data.h1b || "yes",
            visibility: data.visibility !== false,
            location: data.location || ""
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, [toast]);
  
  const handleInputChange = (field: keyof ProfileData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("resume", file);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const summary = await generateSummary({
        text: "Sample resume text for demonstration",
        fileName: file.name
      });

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive", 
          title: "Authentication required",
          description: "Please sign in to save your profile.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          location: location,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          summary: formData.summary,
          job_type: formData.job_type,
          // Fix here - ensure salary is a number
          salary: typeof formData.salary === 'string' ? parseInt(formData.salary) : formData.salary,
          work_mode: formData.work_mode,
          relocation: formData.relocation,
          h1b: formData.h1b,
          visibility: formData.visibility,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-lg">Loading profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

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
                    <Input 
                      id="firstName" 
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <LocationInput value={location} onChange={setLocation} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input 
                    id="linkedin" 
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Website</Label>
                  <Input 
                    id="portfolio" 
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  />
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
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
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
                  <Select 
                    value={formData.job_type}
                    onValueChange={(value) => handleInputChange('job_type', value)}
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
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select 
                    value={formData.work_mode}
                    onValueChange={(value) => handleInputChange('work_mode', value)}
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
                    onValueChange={(value) => handleInputChange('relocation', value)}
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
                    onValueChange={(value) => handleInputChange('h1b', value)}
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
                      checked={formData.visibility}
                      onChange={(e) => handleInputChange('visibility', e.target.checked)}
                    />
                    <span className={`absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all ${formData.visibility ? 'left-[22px] peer-checked:[&+.track]:bg-blue-600' : ''}`}></span>
                    <span className={`track absolute inset-0 rounded-full transition-all ${formData.visibility ? 'bg-blue-600' : ''}`}></span>
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
