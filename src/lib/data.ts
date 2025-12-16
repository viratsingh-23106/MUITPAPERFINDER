// Course and academic data for the portal (static options only)

export const courses = [
  { id: "btech", name: "B.Tech" },
  { id: "bca", name: "BCA" },
  { id: "mca", name: "MCA" },
  { id: "diploma", name: "Diploma" },
  { id: "bsc", name: "B.Sc" },
  { id: "msc", name: "M.Sc" },
] as const;

export const branches: Record<string, { id: string; name: string }[]> = {
  btech: [
    { id: "cse", name: "Computer Science Engineering" },
    { id: "ece", name: "Electronics & Communication" },
    { id: "me", name: "Mechanical Engineering" },
    { id: "ce", name: "Civil Engineering" },
    { id: "ee", name: "Electrical Engineering" },
    { id: "it", name: "Information Technology" },
  ],
  diploma: [
    { id: "cse", name: "Computer Science" },
    { id: "ece", name: "Electronics" },
    { id: "me", name: "Mechanical" },
    { id: "ce", name: "Civil" },
    { id: "ee", name: "Electrical" },
  ],
  bsc: [
    { id: "cs", name: "Computer Science" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "mathematics", name: "Mathematics" },
  ],
  msc: [
    { id: "cs", name: "Computer Science" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "mathematics", name: "Mathematics" },
  ],
};

export const semesters = [
  { id: "1", name: "1st Semester" },
  { id: "2", name: "2nd Semester" },
  { id: "3", name: "3rd Semester" },
  { id: "4", name: "4th Semester" },
  { id: "5", name: "5th Semester" },
  { id: "6", name: "6th Semester" },
  { id: "7", name: "7th Semester" },
  { id: "8", name: "8th Semester" },
] as const;

export const years = [
  { id: "2024", name: "2024" },
  { id: "2023", name: "2023" },
  { id: "2022", name: "2022" },
  { id: "2021", name: "2021" },
  { id: "2020", name: "2020" },
  { id: "2019", name: "2019" },
] as const;

// Helper to check if course has branches
export function courseHasBranches(courseId: string): boolean {
  return ["btech", "diploma", "bsc", "msc"].includes(courseId);
}

// Get course name by id
export function getCourseName(courseId: string): string {
  return courses.find(c => c.id === courseId)?.name || courseId.toUpperCase();
}

// Get branch name by id
export function getBranchName(courseId: string, branchId: string): string {
  return branches[courseId]?.find(b => b.id === branchId)?.name || branchId.toUpperCase();
}

// Get semester name by id  
export function getSemesterName(semId: string): string {
  return semesters.find(s => s.id === semId)?.name || `Sem ${semId}`;
}
