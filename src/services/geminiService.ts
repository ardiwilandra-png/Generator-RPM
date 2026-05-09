import { RPMData, RPMResult } from "../types";

export async function generateRPM(data: RPMData): Promise<RPMResult> {
  try {
    const response = await fetch("/api/generate-rpm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      let errorMessage = "Gagal menghubungi server.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server Error (${response.status}): Silakan periksa konfigurasi API Key di Vercel.`;
      }
      throw new Error(errorMessage);
    }

    return await response.json() as RPMResult;
  } catch (error) {
    console.error("Error generating RPM:", error);
    throw new Error("Gagal menghasilkan RPM. Silakan coba lagi.");
  }
}
