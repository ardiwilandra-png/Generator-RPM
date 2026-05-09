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
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghubungi server.");
    }

    return await response.json() as RPMResult;
  } catch (error) {
    console.error("Error generating RPM:", error);
    throw new Error("Gagal menghasilkan RPM. Silakan coba lagi.");
  }
}
