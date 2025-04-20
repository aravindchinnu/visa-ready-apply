
interface ResumeData {
  text: string;
  fileName: string;
}

export const generateSummary = async (resumeData: ResumeData): Promise<string> => {
  if (!resumeData || !resumeData.text) {
    throw new Error("Invalid resume data: text is required");
  }
  
  try {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText: resumeData.text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error:", response.status, errorData);
      throw new Error(`Failed to generate summary: ${response.status} ${errorData.error || ''}`);
    }

    const data = await response.json();
    
    if (!data || !data.summary) {
      console.error("Unexpected API response:", data);
      throw new Error("Invalid response from summary generation API");
    }
    
    return data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};
