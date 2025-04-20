
import { useState, ChangeEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const verifyUpload = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .list(path.split('/')[0]);

      if (error) throw error;
      
      const fileExists = data.some(file => file.name === path.split('/')[1]);
      return fileExists;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  const handleSaveConfirmation = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a resume file first.",
      });
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please sign in to save your resume.",
      });
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const isUploaded = await verifyUpload(filePath);

    if (isUploaded) {
      toast({
        title: "Resume saved successfully",
        description: "Your resume has been verified and saved in the database.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Save verification failed",
        description: "There was an issue saving your resume. Please try uploading again.",
      });
    }
  };

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
      
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          upsert: true,
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

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setIsUploaded(false);
  };

  return {
    file,
    preview,
    uploading,
    isUploaded,
    atsScore,
    uploadProgress,
    handleFileChange,
    handleUpload,
    handleReset,
    handleSaveConfirmation,
  };
};
