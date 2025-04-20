
import { Button } from "@/components/ui/button";

interface ResumeAnalysisProps {
  isUploaded: boolean;
  atsScore: number | null;
}

export const ResumeAnalysis = ({ isUploaded, atsScore }: ResumeAnalysisProps) => {
  if (!isUploaded) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-center">
          Upload your resume to see an analysis of your skills, experience, and qualifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">ATS Score</h3>
        <div className="text-4xl font-bold text-blue-600">{atsScore}</div>
        <p className="text-sm text-gray-500 mt-2">
          {atsScore && atsScore >= 80
            ? "Excellent"
            : atsScore && atsScore >= 70
            ? "Good"
            : "Consider improving your resume"}
        </p>
      </div>

      <div>
        <h3 className="font-medium text-sm text-gray-500">Skills</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            React
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            TypeScript
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Node.js
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            AWS
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Agile
          </span>
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

      <Button className="w-full" variant="outline">
        Edit Extracted Information
      </Button>
    </div>
  );
};
