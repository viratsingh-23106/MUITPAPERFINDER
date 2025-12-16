import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSelect } from "@/components/FilterSelect";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courses, branches, semesters, courseHasBranches } from "@/lib/data";
import { usePapers } from "@/hooks/usePapers";
import { Search, Filter, FileText, RefreshCw, Loader2 } from "lucide-react";

export default function SearchPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [debouncedSubject, setDebouncedSubject] = useState("");

  // Debounce subject search
  const handleSubjectChange = (value: string) => {
    setSubjectSearch(value);
    // Simple debounce
    setTimeout(() => setDebouncedSubject(value), 300);
  };

  const hasBranches = courseHasBranches(selectedCourse);
  const availableBranches = hasBranches ? branches[selectedCourse] || [] : [];

  // Fetch papers with filters
  const { papers, loading, error, refetch } = usePapers({
    course: selectedCourse || undefined,
    branch: selectedBranch || undefined,
    semester: selectedSemester || undefined,
    subject: debouncedSubject || undefined,
  });

  const handleReset = () => {
    setSelectedCourse("");
    setSelectedBranch("");
    setSelectedSemester("");
    setSubjectSearch("");
    setDebouncedSubject("");
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setSelectedBranch("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Find Question Papers
              </h1>
              <p className="mt-3 text-muted-foreground">
                Search previous year papers by course, semester, and subject
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container">
            <div className="bg-card rounded-xl p-6 shadow-card">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by subject name..."
                  value={subjectSearch}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="pl-10 h-12 text-base bg-background"
                />
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FilterSelect
                  label="Course"
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
                  label="Semester"
                  placeholder="Select semester"
                  options={semesters.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                />
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{papers.length} papers found</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={refetch}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container">
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading papers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={refetch}>
                  Try Again
                </Button>
              </div>
            ) : papers.length > 0 ? (
              <div className="grid gap-4">
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No papers found</h3>
                <p className="text-muted-foreground mt-2">
                  {subjectSearch || selectedCourse || selectedSemester 
                    ? "Try adjusting your filters or search query"
                    : "Be the first to upload a paper!"
                  }
                </p>
                <Button variant="outline" className="mt-4" onClick={handleReset}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
