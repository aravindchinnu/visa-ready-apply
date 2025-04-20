
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const Resume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file",
        });
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file less than 5MB",
        });
        return;
      }
      
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      // Create a custom upload progress handler
      const uploadProgressCallback = (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total) * 100;
        setUploadProgress(percent);
      };
      
      // Add event listener to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', uploadProgressCallback);
      
      // Upload file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          upsert: true,
          // Remove the onUploadProgress property as it's not supported
        });

      if (uploadError) throw uploadError;

      const mockScore = Math.floor(Math.random() * 41) + 60;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: data?.path,
          ats_score: mockScore
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAtsScore(mockScore);
      setIsUploaded(true);
      
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been uploaded and analyzed.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was a problem uploading your resume.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Management</h1>
          <p className="text-gray-500 mt-2">Upload and manage your resume for automated job applications</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Please upload your resume in PDF format. We'll automatically extract your information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[200px]">
                <input
                  type="file"
                  id="resume-upload"
                  className="block w-full h-full opacity-0 cursor-pointer absolute"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {!file ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">
                      Drag and drop your resume here, or click to browse
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Button 
                        onClick={handleUpload} 
                        disabled={uploading || isUploaded}
                      >
                        {uploading ? "Uploading..." : isUploaded ? "Uploaded" : "Upload Resume"}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setIsUploaded(false);
                      }}>
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-gray-500 text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p>Requirements:</p>
                <ul className="list-disc list-inside">
                  <li>PDF format only</li>
                  <li>Maximum size: 5MB</li>
                  <li>Make sure your contact information is up-to-date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resume Analysis</CardTitle>
              <CardDescription>
                {isUploaded 
                  ? "Here's what we extracted from your resume" 
                  : "Upload your resume to see the analysis"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isUploaded ? (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">ATS Score</h3>
                    <div className="text-4xl font-bold text-blue-600">{atsScore}</div>
                    <p className="text-sm text-gray-500 mt-2">
                      {atsScore && atsScore >= 80 ? "Excellent" : 
                       atsScore && atsScore >= 70 ? "Good" : 
                       "Consider improving your resume"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Skills</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">React</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">TypeScript</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Node.js</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">AWS</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Agile</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Experience</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="border-l-2 border-gray-200 pl-4 py-1">
                        <div className="font-medium">Senior Developer</div>
                        <div className="text-sm text-gray-500">Tech Solutions Inc., 2020-2023</div>
                      </li>
                      <li className="border-l-2 border-gray-200 pl-4 py-1">
                        <div className="font-medium">Web Developer</div>
                        <div className="text-sm text-gray-500">Digital Agency, 2018-2020</div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Education</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="border-l-2 border-gray-200 pl-4 py-1">
                        <div className="font-medium">MSc Computer Science</div>
                        <div className="text-sm text-gray-500">Tech University, 2018</div>
                      </li>
                    </ul>
                  </div>
                  
                  <Button className="w-full" variant="outline">Edit Extracted Information</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-center">
                    Upload your resume to see an analysis of your skills, experience, and qualifications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;
