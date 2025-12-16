import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Search, 
  Upload, 
  FileText, 
  Users, 
  BookOpen, 
  Shield, 
  ArrowRight,
  CheckCircle,
  GraduationCap,
  TrendingUp
} from "lucide-react";

const stats = [
  { label: "Papers Available", value: "5+", icon: FileText },
  { label: "Active Students", value: "1+", icon: Users },
  { label: "Courses Covered", value: "6+", icon: BookOpen },
];

const features = [
  {
    icon: Search,
    title: "Easy Search",
    description: "Find papers by course, semester, subject, and year with our intuitive search filters.",
  },
  {
    icon: Upload,
    title: "Upload & Share",
    description: "Seniors can upload papers to help juniors prepare better for their exams.",
  },
  {
    icon: Shield,
    title: "Verified Papers",
    description: "All uploaded papers go through admin approval to ensure quality and authenticity.",
  },
  {
    icon: GraduationCap,
    title: "All Courses",
    description: "B.Tech, BCA, MCA, Diploma, and more - find papers for all university courses.",
  },
];

const courses = [
  { name: "B.Tech", papers: "2+" },
  { name: "BCA", papers: "1+" },
  { name: "MCA", papers: "2+" },
  { name: "Diploma", papers: "1" },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <TrendingUp className="h-4 w-4" />
              Trusted by 1+ students
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Previous Year Question
              <span className="block text-primary mt-2">Paper Portal</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Your one-stop destination for university previous year question papers. 
              Search, download, and prepare smarter for your exams.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="xl" variant="hero" asChild>
                <Link to="/search">
                  <Search className="h-5 w-5 mr-2" />
                  Find Papers
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/upload">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Paper
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mb-4">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-card/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Why Use PYQ Portal?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                We make it easy for students to access previous year papers and prepare effectively for exams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:gradient-primary transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Explore by Course
              </h2>
              <p className="mt-4 text-muted-foreground">
                Papers available for all major university courses
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {courses.map((course) => (
                <Link
                  key={course.name}
                  to={`/search?course=${course.name.toLowerCase()}`}
                  className="bg-card rounded-xl p-6 text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.name}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{course.papers} papers</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-card/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                How It Works
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "1", title: "Select Course", desc: "Choose your course and branch" },
                  { step: "2", title: "Pick Subject", desc: "Select semester and subject" },
                  { step: "3", title: "Download", desc: "View or download the paper" },
                ].map((item, index) => (
                  <div key={item.step} className="relative text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-primary text-primary-foreground text-xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                    {index < 2 && (
                      <ArrowRight className="hidden md:block absolute top-6 -right-4 h-6 w-6 text-primary/50" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Ready to Start Preparing?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join thousands of students who use PYQ Portal to ace their exams.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Button size="lg" variant="hero" asChild>
                  <Link to="/search">
                    Start Searching
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="/auth?mode=register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
