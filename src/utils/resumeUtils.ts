
interface ResumeData {
  text: string;
  fileName: string;
}

export const generateSummary = async (resumeData: ResumeData): Promise<string> => {
  try {
    const response = await fetch("/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText: resumeData.text }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};
