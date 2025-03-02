interface ElectronAPI {
  startRecording: () => Promise<{ success: boolean }>;
  stopRecording: () => Promise<{ success: boolean }>;
  saveInterview: (data: any) => Promise<{ success: boolean, id: number }>;
  getInterviews: () => Promise<{ success: boolean, interviews: any[] }>;
}

interface Window {
  electronAPI: ElectronAPI;
} 