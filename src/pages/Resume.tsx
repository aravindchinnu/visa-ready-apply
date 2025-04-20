
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const Resume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file",
        });
        return;
      }
      
      // Check if file size is less than 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file less than 5MB",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview URL
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
    
    try {
      // Simulate API call for resume upload and parsing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been uploaded and parsed.",
      });
      
      setIsUploaded(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your resume.",
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {!file ? (
                  <>
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-500 text-center mb-4">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <label htmlFor="resume-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Select File
                      </Button>
                    </label>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">📄</div>
                    <p className="font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpload} 
                        disabled={uploading || isUploaded}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {uploading ? "Uploading..." : isUploaded ? "Uploaded" : "Upload Resume"}
                      </Button>
                      <label htmlFor="resume-upload">
                        <Button variant="outline" className="cursor-pointer">
                          Change
                        </Button>
                      </label>
                    </div>
                  </>
                )}
              </div>
              
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
                <div className="space-y-4">
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
