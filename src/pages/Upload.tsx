import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  courses, 
  branches, 
  semesters, 
  subjects, 
  years,
  getSubjectKey 
} from "@/lib/data";
import { Upload, FileUp, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);
  const hasBranches = selectedCourseData?.hasBranches ?? false;
  const availableBranches = hasBranches ? branches[selectedCourse] || [] : [];
  
  const subjectKey = getSubjectKey(selectedCourse, selectedBranch || undefined, selectedSemester);
  const availableSubjects = subjects[subjectKey] || [];

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedBranch("");
    setSelectedSubject("");
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    setSelectedSubject("");
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    setSelectedSubject("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload PDF or image files only.");
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedSemester || !selectedSubject || !selectedYear || !file) {
      toast.error("Please fill all required fields and select a file.");
      return;
    }

    setIsUploading(true);
    
    // Simulate upload - in production, this would upload to Supabase Storage
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success("Paper uploaded successfully! It will be reviewed by admin before publishing.");
    
    // Reset form
    setSelectedCourse("");
    setSelectedBranch("");
    setSelectedSemester("");
    setSelectedSubject("");
    setSelectedYear("");
    setFile(null);
    setIsUploading(false);
  };

  const isFormValid = selectedCourse && selectedSemester && selectedSubject && selectedYear && file;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Upload Question Paper
              </h1>
              <p className="mt-3 text-muted-foreground">
                Help juniors by sharing previous year question papers
              </p>
            </div>
          </div>
        </section>

        {/* Upload Form */}
        <section className="py-8">
          <div className="container max-w-2xl">
            {/* Info Banner */}
            <div className="bg-primary/10 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Upload Guidelines</p>
                <ul className="mt-1 text-muted-foreground space-y-1">
                  <li>• Only PDF and image files (JPG, PNG) are accepted</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Papers will be reviewed by admin before publishing</li>
                  <li>• Duplicate papers (same course, semester, subject, year) will be rejected</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FilterSelect
                  label="Course *"
                  placeholder="Select course"
                  options={courses.map((c) => ({ id: c.id, name: c.name }))}
                  value={selectedCourse}
                  onChange={handleCourseChange}
                />

                {hasBranches && (
                  <FilterSelect
                    label="Branch"
                    placeholder="Select branch"
                    options={availableBranches}
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    disabled={!selectedCourse}
                  />
                )}

                <FilterSelect
                  label="Semester *"
                  placeholder="Select semester"
                  options={semesters.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                />

                <FilterSelect
                  label="Subject *"
                  placeholder="Select subject"
                  options={availableSubjects.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  disabled={availableSubjects.length === 0}
                />

                <FilterSelect
                  label="Year *"
                  placeholder="Select year"
                  options={years.map((y) => ({ id: y.id, name: y.name }))}
                  value={selectedYear}
                  onChange={setSelectedYear}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Question Paper File *</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      file
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {file ? (
                      <div className="text-center">
                        <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-primary mt-2">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="font-medium text-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF, JPG, or PNG (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                variant="hero"
                className="w-full"
                disabled={!isFormValid || isUploading}
              >
                {isUploading ? (
                  <>
                    <RefreshCwIcon className="h-5 w-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Paper
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
