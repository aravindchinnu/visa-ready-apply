
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const [botEnabled, setBotEnabled] = useState(true);
  const [h1bOnly, setH1bOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Settings saved",
        description: "Your job bot settings have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "There was a problem updating your settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Job Bot Settings</h1>
          <p className="text-gray-500 mt-2">Configure how your automated job application bot works</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
            <CardDescription>Enable or disable the job application bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bot-status">Bot Active</Label>
              <Switch id="bot-status" checked={botEnabled} onCheckedChange={setBotEnabled} />
            </div>
            <p className="text-sm text-gray-500">
              {botEnabled 
                ? "Your job bot is currently active and will automatically apply to matching jobs." 
                : "Your job bot is currently disabled. Enable it to start automated applications."}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>H1B Visa Sponsorship</CardTitle>
            <CardDescription>Configure H1B sponsorship requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="h1b-only">Apply only to H1B sponsoring companies</Label>
              <Switch id="h1b-only" checked={h1bOnly} onCheckedChange={setH1bOnly} />
            </div>
            <p className="text-sm text-gray-500">
              When enabled, the bot will only apply to companies that sponsor H1B visas.
            </p>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="font-medium">H1B Database Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-h1b">Minimum H1B Applications</Label>
                  <Select defaultValue="10">
                    <SelectTrigger id="min-h1b">
                      <SelectValue placeholder="Select minimum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">At least 5</SelectItem>
                      <SelectItem value="10">At least 10</SelectItem>
                      <SelectItem value="25">At least 25</SelectItem>
                      <SelectItem value="50">At least 50</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Minimum number of previous H1B applications by the company
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="h1b-years">Data Recency</Label>
                  <Select defaultValue="3">
                    <SelectTrigger id="h1b-years">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last year only</SelectItem>
                      <SelectItem value="3">Last 3 years</SelectItem>
                      <SelectItem value="5">Last 5 years</SelectItem>
                      <SelectItem value="all">All available data</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How recent the H1B sponsorship data should be
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Search Criteria</CardTitle>
            <CardDescription>Define what jobs the bot should look for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-titles">Job Titles</Label>
              <Input 
                id="job-titles" 
                placeholder="e.g., Software Engineer, Frontend Developer, React Developer" 
                defaultValue="Software Developer, Frontend Engineer, React Developer"
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of job titles to search for
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excluded-terms">Excluded Terms</Label>
              <Input 
                id="excluded-terms" 
                placeholder="e.g., Senior, Lead, Manager" 
                defaultValue="Senior, Principal, Director, Manager"
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of terms to exclude from job search
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locations">Locations</Label>
              <Input 
                id="locations" 
                placeholder="e.g., San Francisco, Remote, New York" 
                defaultValue="San Francisco, New York, Seattle, Remote"
              />
              <p className="text-xs text-gray-500">
                Comma-separated list of locations to search in
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="experience-range">Years of Experience</Label>
                <span className="text-sm text-gray-500">1-5 years</span>
              </div>
              <Slider 
                id="experience-range"
                defaultValue={[1, 5]} 
                max={15} 
                min={0} 
                step={1} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-salary">Minimum Salary</Label>
                <Input id="min-salary" type="number" defaultValue="80000" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job-sources">Job Sources</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="job-sources">
                    <SelectValue placeholder="Select sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="glassdoor">Glassdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Limits</CardTitle>
            <CardDescription>Control how many applications the bot will submit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-limit">Daily Limit</Label>
                <Input id="daily-limit" type="number" defaultValue="10" />
                <p className="text-xs text-gray-500">
                  Maximum applications per day
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weekly-limit">Weekly Limit</Label>
                <Input id="weekly-limit" type="number" defaultValue="50" />
                <p className="text-xs text-gray-500">
                  Maximum applications per week
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total-limit">Total Limit</Label>
                <Input id="total-limit" type="number" defaultValue="200" />
                <p className="text-xs text-gray-500">
                  Maximum total applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you'll be notified about applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest">Daily Application Digest</Label>
              <Switch id="daily-digest" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="interview-alerts">Interview Request Alerts</Label>
              <Switch id="interview-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
