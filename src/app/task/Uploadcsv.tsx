"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertTriangle, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Select from "@/components/Select";

type UploadCsvProps = {
  groups: Array<{ id: number; name: string }>;
};

type UploadStatus = "idle" | "loading" | "success" | "error";

export default function UploadCsv({ groups }: UploadCsvProps) {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupValue = Number(e.target.value);
    setSelectedGroup(groupValue?.toString());
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Invalid File Type", {
          description: "Please upload a CSV file.",
        });
        setSelectedFile(null);
        return;
      }

      const MAX_FILE_SIZE = 15 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File Size Exceeded", {
          description: "Maximum file size is 10MB.",
        });
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile || !selectedGroup) {
      toast.error("Upload Error", {
        description: "Please select a group and upload a CSV file.",
      });
      setUploadStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("groupId", selectedGroup.toString());

    try {
      setUploadStatus("loading");
      setErrorMessage("");

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadStatus("success");

        // Reset form
        setSelectedFile(null);
        setSelectedGroup("");
        const fileInput = document.getElementById(
          "csvFile"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // Success toast
        toast.success("Upload Successful", {
          description: `${result.importedCount || 0} tasks imported.`,
          duration: 3000,
        });
      } else {
        setUploadStatus("error");
        setErrorMessage(result.message || "Failed to upload the file.");
        toast.error("Upload Failed", {
          description: result.message || "Failed to upload the file.",
        });
      }
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while uploading the file."
      );
      toast.error("Unexpected Error", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while uploading the file.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg relative">
      <div
        className="absolute right-0 top-0 text-end mt-2 mr-2 cursor-pointer hover:text-black"
        onClick={() => router.back()}
      >
        <X />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            title="group_id"
            label="Group"
            options={groups}
            selectedOption={selectedGroup}
            handleOptionChange={handleGroupChange}
            isReport={false}
          />
        </div>

        <div>
          <label
            htmlFor="csvFile"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload CSV File
          </label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {errorMessage && (
          <div className="flex items-center text-red-600 space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={
            !selectedFile || !selectedGroup || uploadStatus === "loading"
          }
          className={`
            w-full flex justify-center items-center space-x-2 p-2 rounded-md 
            ${uploadStatus === "loading" ? "bg-blue-400" : "bg-blue-500"}
            text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-blue-600 transition-colors
          `}
        >
          {uploadStatus === "loading" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : uploadStatus === "success" ? (
            <>
              <Check className="w-5 h-5" />
              <span>Upload Complete</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload CSV</span>
            </>
          )}
        </button>
      </form>
      <span className="text-xs">
        <span className="text-red-500">*</span>Max size 15MB
      </span>
    </div>
  );
}
