import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { courses, branches, semesters, years, courseHasBranches } from "@/lib/data";
import { uploadPaper } from "@/hooks/usePapers";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileUp, CheckCircle, Info, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function UploadPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const hasBranches = courseHasBranches(selectedCourse);
  const availableBranches = hasBranches ? branches[selectedCourse] || [] : [];

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedBranch("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload PDF or image files only.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to upload papers.");
      navigate("/auth");
      return;
    }

    if (!selectedCourse || !selectedSemester || !subject.trim() || !selectedYear || !file) {
      toast.error("Please fill all required fields and select a file.");
      return;
    }

    setIsUploading(true);
    
    try {
      await uploadPaper(file, {
        course: selectedCourse,
        branch: selectedBranch || undefined,
        semester: selectedSemester,
        subject: subject.trim(),
        year: selectedYear,
        uploaderName: profile?.full_name || user.email || "Anonymous",
      });
      
      toast.success("Paper uploaded successfully!");
      
      // Reset form
      setSelectedCourse("");
      setSelectedBranch("");
      setSelectedSemester("");
      setSubject("");
      setSelectedYear("");
      setFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = selectedCourse && selectedSemester && subject.trim() && selectedYear && file;

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to upload question papers. 
              Create an account or sign in to continue.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=register">Create Account</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <li>• Enter the exact subject name as it appears on the paper</li>
                  <li>• Papers are published immediately for other students</li>
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
                    onChange={setSelectedBranch}
                    disabled={!selectedCourse}
                  />
                )}

                <FilterSelect
                  label="Semester *"
                  placeholder="Select semester"
                  options={semesters.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                />

                <FilterSelect
                  label="Year *"
                  placeholder="Select year"
                  options={years.map((y) => ({ id: y.id, name: y.name }))}
                  value={selectedYear}
                  onChange={setSelectedYear}
                />
              </div>

              {/* Subject Input - Free text */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject Name *
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures & Algorithms, Database Management Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the subject name exactly as it appears on the question paper
                </p>
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
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
