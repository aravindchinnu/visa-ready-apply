
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadAreaProps {
  file: File | null;
  isUploaded: boolean;
  uploading: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReset: () => void;
  onVerifySave: () => void;
}

export const FileUploadArea = ({
  file,
  isUploaded,
  uploading,
  onFileChange,
  onUpload,
  onReset,
  onVerifySave,
}: FileUploadAreaProps) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[200px]">
      <input
        type="file"
        id="resume-upload"
        className="block w-full h-full opacity-0 cursor-pointer absolute"
        accept=".pdf"
        onChange={onFileChange}
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
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2 justify-center">
              <Button onClick={onUpload} disabled={uploading || isUploaded}>
                {uploading ? "Uploading..." : isUploaded ? "Uploaded" : "Upload Resume"}
              </Button>
              <Button variant="outline" onClick={onReset}>
                Change
              </Button>
            </div>
            {isUploaded && (
              <Button onClick={onVerifySave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Verify Save Status
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
