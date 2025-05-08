/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeParsePortfolioContent } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CopyIcon,
  ArrowLeft,
  Globe,
  Mail,
  GraduationCap,
  Briefcase,
  Award,
  HeartHandshake,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  template_id: string;
  content: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const SharePortfolio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      if (!id) {
        throw new Error("Portfolio ID not found");
      }

      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data.is_public) {
        throw new Error("This portfolio is not publicly available");
      }

      const parsedContent = safeParsePortfolioContent(data.content);
      setPortfolio({
        ...data,
        content: parsedContent,
      });
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const copyPublicLink = () => {
    if (!portfolio) return;

    const link = `${window.location.origin}/portfolio/view/${portfolio.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "Portfolio link copied to clipboard",
      });

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-gray-500">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Portfolio Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!portfolio) return null;

  const {
    personalInfo,
    education,
    workExperience,
    awards,
    volunteering,
    languages,
    computerSkills,
    projects,
  } = portfolio.content;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={copyPublicLink}
                  className="flex items-center gap-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  {linkCopied ? "Copied!" : "Share"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy public link to share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-primary/10 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{portfolio.title}</CardTitle>
                <p className="text-gray-600 mt-2">
                  {portfolio.description || "No description provided"}
                </p>
              </div>
              {portfolio.is_public && (
                <Badge variant="outline" className="bg-green-50">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Personal Info Section */}
            <section className="mb-10">
              <div className="flex items-start gap-6">
                {personalInfo.profilePicture && (
                  <img
                    src={personalInfo.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/96")
                    }
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {personalInfo.fullName}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{personalInfo.email}</span>
                  </div>
                  {personalInfo.bio && (
                    <p className="mt-3 text-gray-700">{personalInfo.bio}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Education Section */}
            {education && (
              <section className="mb-10">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h3>
                <div className="prose max-w-none">
                  {education.split("\n").map((paragraph: string, i: number) => (
                    <p key={i} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Work Experience Section */}
            {workExperience && (
              <section className="mb-10">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </h3>
                <div className="prose max-w-none">
                  {workExperience
                    .split("\n")
                    .map((paragraph: string, i: number) => (
                      <p key={i} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </section>
            )}

            {/* Skills Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Languages */}
              {languages && languages.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4">Languages</h3>
                  <div className="space-y-2">
                    {languages.map((lang: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <span>{lang.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {lang.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Computer Skills */}
              {computerSkills && computerSkills.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4">Skills</h3>
                  <div className="space-y-2">
                    {computerSkills.map((skill: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <span>{skill.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {skill.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Projects */}
            {projects && projects.length > 0 && (
              <section className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Projects</h3>
                <div className="space-y-6">
                  {projects.map((project: any, i: number) => (
                    <Card key={i} className="border">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {project.description}
                        </p>
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.map(
                                (tech: string, j: number) => (
                                  <Badge key={j} variant="secondary">
                                    {tech}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                        <div className="flex gap-4">
                          {project.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Project
                              </a>
                            </Button>
                          )}
                          {project.repoUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Code
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Awards & Volunteering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Awards */}
              {awards && (
                <section>
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5" />
                    Awards
                  </h3>
                  <div className="prose max-w-none">
                    {awards.split("\n").map((paragraph: string, i: number) => (
                      <p key={i} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              )}

              {/* Volunteering */}
              {volunteering && (
                <section>
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <HeartHandshake className="h-5 w-5" />
                    Volunteering
                  </h3>
                  <div className="prose max-w-none">
                    {volunteering
                      .split("\n")
                      .map((paragraph: string, i: number) => (
                        <p key={i} className="mb-3">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </section>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharePortfolio;
