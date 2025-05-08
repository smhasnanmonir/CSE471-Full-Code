/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  X,
  ExternalLink,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Code,
  Heart,
  Sparkles,
  Crown,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Portfolio } from "@/types/portfolio";
import PortfolioEngagement from "./PortfolioEngagement";
import axios from "axios"; // Import axios for API calls

interface PortfolioViewProps {
  portfolio: Portfolio;
  onClose: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  onClose,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isPremiumTemplate = portfolio.template_id.startsWith("premium-");

  // Fetch template styles from the backend
  const [templateStyles, setTemplateStyles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchTemplateStyles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/template-styles"
        );
        const stylesMap: Record<string, any> = {};

        console.log("From backend", response);

        // Map backend data to the required structure
        response.data.forEach((styleData: any) => {
          stylesMap[styleData.slug] = {
            iconColor: styleData.styles.iconColor,
            badgeClass: styleData.styles.badgeClass,
            dividerClass: styleData.styles.dividerClass,
            headingClass: styleData.styles.headingClass,
            sectionClass: styleData.styles.sectionClass,
          };
        });

        setTemplateStyles(stylesMap);
      } catch (error) {
        console.error("Error fetching template styles:", error);
      }
    };

    fetchTemplateStyles();
  }, []);

  // Get the current template style or default to minimal
  const currentTemplate = portfolio.template_id as keyof typeof templateStyles;
  const style = templateStyles[currentTemplate] || templateStyles["minimal"];

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 1,
      filename: `${portfolio.title.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };

  const getHeaderStyle = () => {
    if (currentTemplate === "premium-creative") {
      return "bg-gradient-to-r from-pink-200 to-orange-200";
    } else if (currentTemplate === "premium-modern") {
      return "bg-gradient-to-r from-indigo-100 to-purple-100";
    } else if (currentTemplate === "premium-executive") {
      return "bg-gradient-to-r from-gray-100 to-slate-200";
    } else if (currentTemplate === "creative") {
      return "bg-gradient-to-r from-yellow-100 to-orange-100";
    }
    return "bg-white";
  };

  const getDecorations = () => {
    if (
      currentTemplate === "creative" ||
      currentTemplate === "premium-creative"
    ) {
      return (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200 rounded-full -ml-8 -mb-8 opacity-30"></div>
        </>
      );
    } else if (currentTemplate === "premium-modern") {
      return (
        <>
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-200 rounded-full -mr-20 -mt-20 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full -ml-16 -mb-16 opacity-20"></div>
          <div className="absolute top-1/3 left-0 w-16 h-16 bg-indigo-300 rounded-full -ml-8 opacity-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-20 h-20 bg-purple-300 rounded-full -mr-10 opacity-10 animate-pulse"></div>
        </>
      );
    } else if (currentTemplate === "premium-executive") {
      return (
        <>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-gray-200 to-slate-200 opacity-50"></div>
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-b from-gray-200 to-transparent opacity-30"></div>
        </>
      );
    }
    return null;
  };

  const getPremiumDecorations = () => {
    if (!isPremiumTemplate) return null;
    return (
      <div className="absolute top-4 right-4 text-yellow-500 opacity-90">
        <Crown className="h-8 w-8" />
      </div>
    );
  };

  const getPremiumSectionClass = (section: string) => {
    if (!isPremiumTemplate) return "";
    if (currentTemplate === "premium-modern") {
      return "transition-all duration-300 hover:translate-x-1 hover:shadow-md";
    } else if (currentTemplate === "premium-creative") {
      return "transition-all duration-300 hover:scale-[1.01] hover:shadow-lg";
    } else if (currentTemplate === "premium-executive") {
      return "transition-all duration-200 hover:bg-gray-50";
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card
        className={`w-full max-w-4xl max-h-[90vh] overflow-auto ${
          isPremiumTemplate ? "shadow-2xl" : "shadow-lg"
        }`}
      >
        <CardHeader
          className={`flex flex-row items-center justify-between sticky top-0 z-10 border-b ${getHeaderStyle()}`}
        >
          <CardTitle className="flex items-center gap-2">
            {portfolio.title}
            {isPremiumTemplate && (
              <Sparkles className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent
          ref={contentRef}
          id="portfolio-content"
          className={`p-6 relative ${
            isPremiumTemplate
              ? "bg-gradient-to-r from-gray-100 to-slate-200"
              : "bg-white"
          }`}
        >
          {getDecorations()}
          {getPremiumDecorations()}
          <div className="space-y-8 relative z-10">
            <div
              className={`flex flex-col md:flex-row gap-6 items-start ${
                currentTemplate === "premium-creative"
                  ? "bg-white/50 p-4 rounded-lg shadow-sm"
                  : currentTemplate === "premium-modern"
                  ? "bg-white/70 p-4 rounded-lg shadow-md backdrop-blur-sm"
                  : currentTemplate === "premium-executive"
                  ? "border-b-2 border-gray-200 pb-6"
                  : ""
              }`}
            >
              {portfolio.content.personalInfo.profilePicture && (
                <div
                  className={`overflow-hidden flex-shrink-0 border ${
                    currentTemplate === "premium-modern"
                      ? "w-32 h-32 rounded-full ring-4 ring-offset-2 ring-indigo-300"
                      : currentTemplate === "premium-creative"
                      ? "w-32 h-32 rounded-full ring-4 ring-offset-2 ring-pink-300"
                      : currentTemplate === "premium-executive"
                      ? "w-40 h-40 rounded-none border-gray-300 shadow-md"
                      : "w-28 h-28 rounded-full"
                  }`}
                >
                  <img
                    src={portfolio.content.personalInfo.profilePicture}
                    alt={portfolio.content.personalInfo.fullName}
                    className={`w-full h-full object-cover ${
                      currentTemplate === "premium-executive"
                        ? "grayscale hover:grayscale-0 transition-all duration-500"
                        : ""
                    }`}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/100?text=Profile")
                    }
                  />
                </div>
              )}
              <div className="flex-1">
                <h2
                  className={
                    style?.headingClass ||
                    "text-2xl font-bold mb-2 text-gray-800"
                  }
                >
                  {portfolio.content.personalInfo.fullName}
                </h2>
                <p
                  className={`text-gray-600 ${
                    currentTemplate === "premium-executive" ? "font-serif" : ""
                  }`}
                >
                  {portfolio.content.personalInfo.email}
                </p>
                {portfolio.content.personalInfo.bio && (
                  <p
                    className={`mt-3 text-gray-700 ${
                      currentTemplate === "premium-executive"
                        ? "font-serif italic"
                        : currentTemplate === "premium-modern"
                        ? "leading-relaxed"
                        : ""
                    }`}
                  >
                    {portfolio.content.personalInfo.bio}
                  </p>
                )}
              </div>
            </div>
            {portfolio.content.education && (
              <div className={getPremiumSectionClass("education")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <GraduationCap
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Education
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <p
                  className={`whitespace-pre-line ${
                    currentTemplate === "premium-executive" ? "font-serif" : ""
                  }`}
                >
                  {portfolio.content.education}
                </p>
              </div>
            )}
            {portfolio.content.workExperience && (
              <div className={getPremiumSectionClass("work")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <Briefcase
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Work Experience
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <p
                  className={`whitespace-pre-line ${
                    currentTemplate === "premium-executive" ? "font-serif" : ""
                  }`}
                >
                  {portfolio.content.workExperience}
                </p>
              </div>
            )}
            {portfolio.content.projects &&
              portfolio.content.projects.length > 0 && (
                <div className={getPremiumSectionClass("projects")}>
                  <h3
                    className={
                      style?.sectionClass ||
                      "text-lg font-semibold text-gray-800"
                    }
                  >
                    <Code
                      className={`inline-block mr-2 h-5 w-5 ${
                        style?.iconColor || "text-gray-700"
                      }`}
                    />
                    Projects
                  </h3>
                  <div
                    className={
                      style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                    }
                  ></div>
                  <div className="space-y-4">
                    {portfolio.content.projects.map((project, index) => (
                      <div
                        key={index}
                        className={`border rounded-md p-4 ${
                          currentTemplate === "premium-modern"
                            ? "bg-white/60 shadow-sm hover:shadow-md transition-all duration-300"
                            : currentTemplate === "premium-creative"
                            ? "bg-white/70 shadow-sm hover:bg-white/90 transition-all duration-300"
                            : currentTemplate === "premium-executive"
                            ? "bg-white border-gray-300 hover:border-gray-400 transition-all duration-200"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4
                            className={`font-medium text-lg ${
                              currentTemplate === "premium-executive"
                                ? "font-serif"
                                : ""
                            }`}
                          >
                            {project.name}
                          </h4>
                          <div className="flex gap-2">
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${
                                  style?.iconColor || "text-gray-700"
                                } hover:opacity-80 transition-opacity`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${
                                  style?.iconColor || "text-gray-700"
                                } hover:opacity-80 transition-opacity`}
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-gray-700 my-2 ${
                            currentTemplate === "premium-executive"
                              ? "font-serif"
                              : ""
                          }`}
                        >
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies?.map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className={
                                style?.badgeClass || "bg-gray-200 text-gray-700"
                              }
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {portfolio.content.awards && (
              <div className={getPremiumSectionClass("awards")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <Award
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Awards & Achievements
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <p
                  className={`whitespace-pre-line ${
                    currentTemplate === "premium-executive" ? "font-serif" : ""
                  }`}
                >
                  {portfolio.content.awards}
                </p>
              </div>
            )}
            {portfolio.content.languages.length > 0 && (
              <div className={getPremiumSectionClass("languages")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <Languages
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Languages
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <ul
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    currentTemplate === "premium-modern" ||
                    currentTemplate === "premium-creative"
                      ? "mt-4"
                      : ""
                  }`}
                >
                  {portfolio.content.languages.map((language, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center ${
                        currentTemplate === "premium-modern"
                          ? "bg-white/60 p-2 rounded shadow-sm hover:shadow-md transition-all duration-300"
                          : currentTemplate === "premium-creative"
                          ? "bg-white/60 p-2 rounded shadow-sm hover:bg-white/90 transition-all duration-300"
                          : currentTemplate === "premium-executive"
                          ? "bg-white p-2 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                          : ""
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          currentTemplate === "premium-executive"
                            ? "font-serif"
                            : ""
                        }`}
                      >
                        {language.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          style?.badgeClass || "bg-gray-200 text-gray-700"
                        }
                      >
                        {language.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {portfolio.content.computerSkills.length > 0 && (
              <div className={getPremiumSectionClass("skills")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <Code
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Computer Skills
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <ul
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    currentTemplate === "premium-modern" ||
                    currentTemplate === "premium-creative"
                      ? "mt-4"
                      : ""
                  }`}
                >
                  {portfolio.content.computerSkills.map((skill, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center ${
                        currentTemplate === "premium-modern"
                          ? "bg-white/60 p-2 rounded shadow-sm hover:shadow-md transition-all duration-300"
                          : currentTemplate === "premium-creative"
                          ? "bg-white/60 p-2 rounded shadow-sm hover:bg-white/90 transition-all duration-300"
                          : currentTemplate === "premium-executive"
                          ? "bg-white p-2 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                          : ""
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          currentTemplate === "premium-executive"
                            ? "font-serif"
                            : ""
                        }`}
                      >
                        {skill.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          style?.badgeClass || "bg-gray-200 text-gray-700"
                        }
                      >
                        {skill.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {portfolio.content.volunteering && (
              <div className={getPremiumSectionClass("volunteering")}>
                <h3
                  className={
                    style?.sectionClass || "text-lg font-semibold text-gray-800"
                  }
                >
                  <Heart
                    className={`inline-block mr-2 h-5 w-5 ${
                      style?.iconColor || "text-gray-700"
                    }`}
                  />
                  Volunteering
                </h3>
                <div
                  className={
                    style?.dividerClass || "w-full h-px bg-gray-300 my-2"
                  }
                ></div>
                <p
                  className={`whitespace-pre-line ${
                    currentTemplate === "premium-executive" ? "font-serif" : ""
                  }`}
                >
                  {portfolio.content.volunteering}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <div className="px-6">
          <PortfolioEngagement portfolio={portfolio} />
        </div>
        <CardFooter
          className={`border-t p-4 flex justify-between ${
            currentTemplate === "premium-modern"
              ? "bg-gradient-to-r from-indigo-50 to-purple-50"
              : currentTemplate === "premium-creative"
              ? "bg-gradient-to-r from-pink-50 to-orange-50"
              : currentTemplate === "premium-executive"
              ? "bg-gradient-to-r from-gray-50 to-slate-100"
              : ""
          }`}
        >
          <div className="text-sm text-gray-500">
            Created: {new Date(portfolio.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className={
                isPremiumTemplate && currentTemplate === "premium-modern"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : isPremiumTemplate && currentTemplate === "premium-creative"
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                  : isPremiumTemplate && currentTemplate === "premium-executive"
                  ? "bg-gray-800 hover:bg-gray-900"
                  : ""
              }
            >
              Download PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioView;
