import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterSelect } from "@/components/FilterSelect";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  courses, 
  branches, 
  semesters, 
  subjects, 
  samplePapers,
  getSubjectKey 
} from "@/lib/data";
import { Search, Filter, FileText, RefreshCw } from "lucide-react";

export default function SearchPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);
  const hasBranches = selectedCourseData?.hasBranches ?? false;
  const availableBranches = hasBranches ? branches[selectedCourse] || [] : [];
  
  const subjectKey = getSubjectKey(selectedCourse, selectedBranch || undefined, selectedSemester);
  const availableSubjects = subjects[subjectKey] || [];

  // Filter papers based on selection
  const filteredPapers = useMemo(() => {
    return samplePapers.filter((paper) => {
      if (paper.status !== "approved") return false;
      if (selectedCourse && paper.course !== selectedCourse) return false;
      if (selectedBranch && paper.branch !== selectedBranch) return false;
      if (selectedSemester && paper.semester !== selectedSemester) return false;
      if (selectedSubject && paper.subject !== selectedSubject) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          paper.subjectName.toLowerCase().includes(query) ||
          paper.course.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedCourse, selectedBranch, selectedSemester, selectedSubject, searchQuery]);

  const handleReset = () => {
    setSelectedCourse("");
    setSelectedBranch("");
    setSelectedSemester("");
    setSelectedSubject("");
    setSearchQuery("");
  };

  // Reset dependent fields when parent changes
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-background"
                />
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    onChange={handleBranchChange}
                    disabled={!selectedCourse}
                  />
                )}

                <FilterSelect
                  label="Semester"
                  placeholder="Select semester"
                  options={semesters.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                />

                <FilterSelect
                  label="Subject"
                  placeholder="Select subject"
                  options={availableSubjects.map((s) => ({ id: s.id, name: s.name }))}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  disabled={availableSubjects.length === 0}
                />
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredPapers.length} papers found</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8">
          <div className="container">
            {filteredPapers.length > 0 ? (
              <div className="grid gap-4">
                {filteredPapers.map((paper) => (
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
                  Try adjusting your filters or search query
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
