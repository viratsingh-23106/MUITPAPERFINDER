// Course and academic data for the portal

export const courses = [
  { id: "btech", name: "B.Tech", hasBranches: true },
  { id: "bca", name: "BCA", hasBranches: false },
  { id: "mca", name: "MCA", hasBranches: false },
  { id: "diploma", name: "Diploma", hasBranches: true },
  { id: "bsc", name: "B.Sc", hasBranches: true },
  { id: "msc", name: "M.Sc", hasBranches: true },
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

// Sample subjects - in real app, these would come from database based on course/branch/semester
export const subjects: Record<string, { id: string; name: string; code: string }[]> = {
  "bca-3": [
    { id: "dsa", name: "Data Structures & Algorithms", code: "BCA301" },
    { id: "dbms", name: "Database Management Systems", code: "BCA302" },
    { id: "os", name: "Operating Systems", code: "BCA303" },
    { id: "cn", name: "Computer Networks", code: "BCA304" },
    { id: "oops", name: "Object Oriented Programming", code: "BCA305" },
  ],
  "bca-4": [
    { id: "java", name: "Java Programming", code: "BCA401" },
    { id: "web", name: "Web Technologies", code: "BCA402" },
    { id: "se", name: "Software Engineering", code: "BCA403" },
    { id: "maths", name: "Discrete Mathematics", code: "BCA404" },
  ],
  "btech-cse-3": [
    { id: "dsa", name: "Data Structures & Algorithms", code: "CSE301" },
    { id: "dbms", name: "Database Management Systems", code: "CSE302" },
    { id: "coa", name: "Computer Organization", code: "CSE303" },
    { id: "discrete", name: "Discrete Mathematics", code: "CSE304" },
  ],
  "btech-cse-4": [
    { id: "os", name: "Operating Systems", code: "CSE401" },
    { id: "algo", name: "Design & Analysis of Algorithms", code: "CSE402" },
    { id: "toc", name: "Theory of Computation", code: "CSE403" },
    { id: "cn", name: "Computer Networks", code: "CSE404" },
  ],
  "mca-1": [
    { id: "cpp", name: "C++ Programming", code: "MCA101" },
    { id: "maths", name: "Mathematical Foundations", code: "MCA102" },
    { id: "os", name: "Operating Systems", code: "MCA103" },
  ],
  "mca-2": [
    { id: "dsa", name: "Data Structures", code: "MCA201" },
    { id: "dbms", name: "Database Systems", code: "MCA202" },
    { id: "java", name: "Java Programming", code: "MCA203" },
  ],
};

export const years = [
  { id: "2024", name: "2024" },
  { id: "2023", name: "2023" },
  { id: "2022", name: "2022" },
  { id: "2021", name: "2021" },
  { id: "2020", name: "2020" },
  { id: "2019", name: "2019" },
] as const;

// Sample papers for demonstration
export interface Paper {
  id: string;
  course: string;
  branch?: string;
  semester: string;
  subject: string;
  subjectName: string;
  year: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  fileUrl: string;
  status: "approved" | "pending" | "rejected";
}

export const samplePapers: Paper[] = [
  {
    id: "1",
    course: "bca",
    semester: "3",
    subject: "dsa",
    subjectName: "Data Structures & Algorithms",
    year: "2023",
    uploadedBy: "Rahul Kumar",
    uploadedAt: "2024-01-15",
    downloads: 156,
    fileUrl: "#",
    status: "approved",
  },
  {
    id: "2",
    course: "bca",
    semester: "3",
    subject: "dsa",
    subjectName: "Data Structures & Algorithms",
    year: "2022",
    uploadedBy: "Priya Singh",
    uploadedAt: "2024-01-10",
    downloads: 234,
    fileUrl: "#",
    status: "approved",
  },
  {
    id: "3",
    course: "bca",
    semester: "3",
    subject: "dbms",
    subjectName: "Database Management Systems",
    year: "2023",
    uploadedBy: "Amit Sharma",
    uploadedAt: "2024-01-20",
    downloads: 189,
    fileUrl: "#",
    status: "approved",
  },
  {
    id: "4",
    course: "btech",
    branch: "cse",
    semester: "4",
    subject: "os",
    subjectName: "Operating Systems",
    year: "2023",
    uploadedBy: "Sneha Gupta",
    uploadedAt: "2024-02-01",
    downloads: 312,
    fileUrl: "#",
    status: "approved",
  },
  {
    id: "5",
    course: "mca",
    semester: "2",
    subject: "dsa",
    subjectName: "Data Structures",
    year: "2023",
    uploadedBy: "Vikram Patel",
    uploadedAt: "2024-02-05",
    downloads: 98,
    fileUrl: "#",
    status: "pending",
  },
];

export function getSubjectKey(course: string, branch: string | undefined, semester: string): string {
  if (branch) {
    return `${course}-${branch}-${semester}`;
  }
  return `${course}-${semester}`;
}
