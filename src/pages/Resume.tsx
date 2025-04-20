import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { FileUploadArea } from "@/components/resume/FileUploadArea";
import { ResumeAnalysis } from "@/components/resume/ResumeAnalysis";
import { useResumeUpload } from "@/hooks/useResumeUpload";

const Resume = () => {
  const {
    file,
    uploading,
    isUploaded,
    atsScore,
    uploadProgress,
    handleFileChange,
    handleUpload,
    handleReset,
    handleSaveConfirmation,
  } = useResumeUpload();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Resume Management</h1>
          {isUploaded && (
            <Button 
              onClick={handleSaveConfirmation}
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Resume
            </Button>
          )}
        </div>
        <p className="text-gray-500 -mt-4">
          Upload and manage your resume for automated job applications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Please upload your resume in PDF format. We'll automatically extract your information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadArea
                file={file}
                isUploaded={isUploaded}
                uploading={uploading}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onReset={handleReset}
                onVerifySave={handleSaveConfirmation}
              />

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
              <ResumeAnalysis 
                isUploaded={isUploaded} 
                atsScore={atsScore} 
                onSaveConfirmation={handleSaveConfirmation}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resume;
