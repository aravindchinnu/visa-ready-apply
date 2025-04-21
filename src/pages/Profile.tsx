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
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import ProfessionalSummarySection from "@/components/profile/ProfessionalSummarySection";
import JobPreferencesSection from "@/components/profile/JobPreferencesSection";
import ProfileVisibilitySection from "@/components/profile/ProfileVisibilitySection";

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
            <PersonalInfoSection
              formData={formData}
              onChange={handleInputChange}
              location={location}
              setLocation={setLocation}
            />
            <ProfessionalSummarySection
              summary={formData.summary}
              onChange={value => handleInputChange('summary', value)}
            />
          </div>
          <div className="space-y-6">
            <JobPreferencesSection
              formData={formData}
              onChange={handleInputChange}
            />
            <ProfileVisibilitySection
              visibility={formData.visibility}
              onChange={checked => handleInputChange('visibility', checked)}
            />
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
