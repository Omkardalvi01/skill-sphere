"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import "./dashboard.css"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  TrendingUp,
  Target,
  Zap,
  Award,
  Brain,
  Flame,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Briefcase,
  GraduationCap,
  DollarSign,
  ArrowUpRight,
  Star,
  TrendingDown,
  Building2,
  Code,
  Users,
  ChevronRight,
  BookOpen,
  Rocket,
  Shield,
  Database,
  Cloud,
  Cpu,
  MapPin,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getDashboardData, getSkills, type DashboardData, type Skill } from "@/lib/api"
import { toaster } from "@/lib/toaster"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [dashboardResult, skillsResult] = await Promise.all([
        getDashboardData(),
        getSkills(),
      ])

      if (dashboardResult.data) {
        setDashboardData(dashboardResult.data)
      } else if (dashboardResult.error) {
        console.error("Dashboard API error:", dashboardResult.error)
        setError(dashboardResult.error)
        toaster.create({
          title: "Dashboard Error",
          description: dashboardResult.error,
          type: "error"
        });
      }

      if (skillsResult.data?.skills) {
        setSkills(skillsResult.data.skills)
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
      toaster.create({
        title: "Load Error",
        description: "Failed to load dashboard data.",
        type: "error"
      });
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchDashboardData()
    }
  }, [mounted, fetchDashboardData])

  if (!mounted) return null

  const profileOverview = dashboardData?.profile_overview
  const careerDashboard = dashboardData?.career_dashboard
  const quickStats = dashboardData?.quick_stats
  const profileSummary = careerDashboard?.profile_summary

  // Prepare chart data
  const completenessData = profileOverview?.completeness_breakdown ? [
    { name: "Basic Info", value: profileOverview.completeness_breakdown.basic_info, fill: "hsl(var(--color-primary))" },
    { name: "Skills", value: profileOverview.completeness_breakdown.skills, fill: "hsl(var(--color-secondary))" },
    { name: "Education", value: profileOverview.completeness_breakdown.education, fill: "#10b981" },
    { name: "Experience", value: profileOverview.completeness_breakdown.experience, fill: "#f59e0b" },
    { name: "Preferences", value: profileOverview.completeness_breakdown.preferences, fill: "#8b5cf6" },
    { name: "Resume", value: profileOverview.completeness_breakdown.resume, fill: "#ec4899" },
    { name: "Peer Learning", value: profileOverview.completeness_breakdown.peer_learning, fill: "#06b6d4" },
  ] : []

  // Sort for RadialBarChart to look good (descending order usually looks best)
  const radialData = [...completenessData].sort((a, b) => b.value - a.value).map(item => ({
    ...item,
    fill: item.fill // Ensure fill is passed
  }));

  const careerPathsData = careerDashboard?.recommended_career_paths?.map(path => ({
    name: path.title.length > 20 ? path.title.substring(0, 18) + "..." : path.title,
    fullName: path.title,
    matchScore: path.match_score,
    fill: path.match_score >= 90 ? "#10b981" : path.match_score >= 80 ? "#3b82f6" : "#f59e0b",
  })) || []

  // Prepare Skills Radar Data
  // If we have skills with proficiency, use them. Otherwise, mock some data based on profile summary or just show top skills
  const skillsRadarData = skills.length > 0
    ? skills.slice(0, 6).map(s => ({
      subject: s.skill_name,
      A: s.proficiency || 80, // Default to 80 if no proficiency
      fullMark: 100,
    }))
    : [
      { subject: 'Coding', A: 85, fullMark: 100 },
      { subject: 'Design', A: 65, fullMark: 100 },
      { subject: 'Communication', A: 90, fullMark: 100 },
      { subject: 'Leadership', A: 75, fullMark: 100 },
      { subject: 'Problem Solving', A: 95, fullMark: 100 },
      { subject: 'Teamwork', A: 85, fullMark: 100 },
    ];

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2 text-foreground">
                    {dashboardData?.user_name ? `Welcome, ${dashboardData.user_name.split(" ")[0]}` : user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Career Dashboard"}
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI-powered career insights tailored just for you
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="border-border/40 hover:bg-muted"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    <Sparkles className="w-4 h-4" />
                    Refresh Insights
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </section>

            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="size-16" />
                  <p className="text-muted-foreground">Loading your career insights...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Profile Overview Section */}
                <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Left Column: Stats Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Profile Strength */}
                      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Award className="w-24 h-24 text-primary" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Profile Strength</h3>
                            <div className={`p-2 rounded-lg ${(profileSummary?.profile_strength_score || 0) >= 70 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                              <Award className={`w-5 h-5 ${(profileSummary?.profile_strength_score || 0) >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
                            </div>
                          </div>
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-foreground">{profileSummary?.profile_strength_score || profileOverview?.completeness_percentage || 0}%</span>
                            <span className="text-sm text-muted-foreground mb-1">completeness</span>
                          </div>
                          <div className="w-full bg-muted/50 rounded-full h-2 mb-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${profileSummary?.profile_strength_score || profileOverview?.completeness_percentage || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {profileSummary?.profile_strength_score && profileSummary.profile_strength_score >= 80
                              ? "Excellent! Your profile is very strong."
                              : "Add more details to improve your strength."}
                          </p>
                        </div>
                      </Card>

                      {/* Resume Score */}
                      <Card className="p-6 border-border/40 bg-linear-to-br from-emerald-500/5 to-emerald-500/10 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Resume Score</h3>
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                          </div>
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-foreground">
                              {profileOverview?.resume_score !== null && profileOverview?.resume_score !== undefined
                                ? profileOverview.resume_score
                                : "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profileOverview?.resume_score ? "ATS Optimized & Ready" : "Upload resume to get score"}
                          </p>
                        </div>
                      </Card>

                      {/* Current Level */}
                      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-secondary/10">
                            <GraduationCap className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Current Level</p>
                            <p className="text-xl font-bold text-foreground capitalize mt-1">{profileSummary?.current_level || "Junior"}</p>
                            <p className="text-sm text-muted-foreground mt-1">{profileSummary?.primary_domain || "Software Development"}</p>
                          </div>
                        </div>
                      </Card>

                      {/* Experience */}
                      <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-amber-500/10">
                            <Briefcase className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium">Experience</p>
                            <p className="text-xl font-bold text-foreground mt-1">{quickStats?.years_of_experience || 0} Years</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quickStats?.total_skills || 0} skills • {quickStats?.education_count || 0} education
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Right Column: Radial Chart */}
                    <Card className="col-span-1 p-6 border-border/40 bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px]">
                      <h3 className="text-lg font-semibold mb-4 text-foreground w-full text-left">Completeness Breakdown</h3>
                      <div className="w-full h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="20%"
                            outerRadius="100%"
                            barSize={15}
                            data={radialData}
                            startAngle={90}
                            endAngle={-270}
                          >
                            <RadialBar
                              label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                              background
                              dataKey="value"
                              cornerRadius={10}
                            />
                            <Legend
                              iconSize={10}
                              layout="vertical"
                              verticalAlign="middle"
                              wrapperStyle={{
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '12px'
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--color-card))",
                                border: "1px solid hsl(var(--color-border))",
                                borderRadius: "8px",
                              }}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column (2/3 width) */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Recommended Career Paths - Graph (cards moved to Opportunities page) */}
                    {careerDashboard?.recommended_career_paths && careerDashboard.recommended_career_paths.length > 0 && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                              <Rocket className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Recommended Career Paths</h2>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI-Powered
                          </span>
                        </div>

                        {/* Career Match Chart */}
                        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm mb-6">
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Match Score Analysis</h3>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={careerPathsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: "hsl(var(--color-muted-foreground))" }} />
                                <Tooltip
                                  cursor={{ fill: 'transparent' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                                          <p className="font-bold text-foreground">{data.fullName}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Match Score: <span className="font-bold text-primary">{data.matchScore}%</span>
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="matchScore" radius={[0, 4, 4, 0]} barSize={24}>
                                  {careerPathsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>

                      </section>
                    )}

                    {/* Career Trajectory Timeline */}
                    {careerDashboard?.career_trajectory && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">Your Career Trajectory</h2>
                        </div>

                        <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

                          <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[28px] top-4 bottom-4 w-0.5 bg-border" />

                            <div className="space-y-10">
                              {/* Short Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                  <Clock className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-600">Short Term</span>
                                    <span className="text-xs text-muted-foreground">6-12 months</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard.career_trajectory.short_term_goal}</h4>
                                  <p className="text-sm text-muted-foreground">Focus on building foundational skills and gaining initial experience in your target domain.</p>
                                </div>
                              </div>

                              {/* Medium Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card border-2 border-blue-500 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                  <TrendingUp className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-600">Medium Term</span>
                                    <span className="text-xs text-muted-foreground">1-2 years</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard.career_trajectory.medium_term_goal}</h4>
                                  <p className="text-sm text-muted-foreground">Expand your responsibilities, take on leadership in smaller projects, and specialize further.</p>
                                </div>
                              </div>

                              {/* Long Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card border-2 border-purple-500 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                  <Rocket className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/10 text-purple-600">Long Term</span>
                                    <span className="text-xs text-muted-foreground">3-5 years</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard.career_trajectory.long_term_vision}</h4>
                                  <p className="text-sm text-muted-foreground">Achieve a senior or lead role, driving major initiatives and mentoring others in the field.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </section>
                    )}

                  </div>

                  {/* Right Column (1/3 width) */}
                  <div className="space-y-8">

                    {/* Skills Radar Chart */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-pink-500/10">
                          <Brain className="w-5 h-5 text-pink-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Skills Profile</h2>
                      </div>

                      <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm flex flex-col items-center">
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadarData}>
                              <PolarGrid stroke="hsl(var(--color-border))" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--color-muted-foreground))', fontSize: 12 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="My Skills"
                                dataKey="A"
                                stroke="hsl(var(--color-primary))"
                                strokeWidth={2}
                                fill="hsl(var(--color-primary))"
                                fillOpacity={0.3}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--color-card))",
                                  border: "1px solid hsl(var(--color-border))",
                                  borderRadius: "8px",
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Visual representation of your top skills proficiency
                        </p>
                      </Card>
                    </section>

                    {/* Trending Roles 2026 */}
                    {careerDashboard?.trending_roles_2026 && careerDashboard.trending_roles_2026.length > 0 && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Flame className="w-5 h-5 text-orange-500" />
                          </div>
                          <h2 className="text-xl font-bold text-foreground">Trending Roles</h2>
                        </div>

                        <div className="space-y-4">
                          {careerDashboard.trending_roles_2026.slice(0, 3).map((role, idx) => (
                            <Card
                              key={idx}
                              className="p-4 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {idx === 0 ? <Cpu className="w-5 h-5 text-orange-500" /> :
                                    idx === 1 ? <Cloud className="w-5 h-5 text-orange-500" /> :
                                      <Code className="w-5 h-5 text-orange-500" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground text-sm">{role.title}</h4>
                                  <div className="flex items-center gap-2 mt-1 mb-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${role.demand_level === 'Very High' ? 'bg-red-500/10 text-red-600' :
                                      'bg-orange-500/10 text-orange-600'
                                      }`}>
                                      {role.demand_level} Demand
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{role.why_trending}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                  </div>
                </div>

                {/* Your Next Steps CTAs - full-width section */}
                <section className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Your Next Steps</h3>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="p-6 border border-border/50 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">1</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Build Your Targeted Resume</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create a personalized resume for your designated job role
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" onClick={() => router.push("/resume-builder")}>
                        Start Building <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 border border-border/50 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">2</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Build Your Portfolio</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create 2-3 projects showcasing your best work
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline" onClick={() => router.push("/portfolio")}>
                        Create Portfolio <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 border border-border/50 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">3</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Practice Interviews</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Practice mock interviews before real ones
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline"
                        onClick={() => window.location.href = "https://hacksync-interview.vercel.app/"}
                      >
                        Start Practice <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 border border-border/50 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">4</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">View Opportunities</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Maximize your opportunities of getting the perfect job
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline" onClick={() => router.push("/opportunities")}>
                        Find Jobs <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>
                  </div>
                </section>

                {/* Data Sources Footer */}
                {careerDashboard?.data_sources && (
                  <div className="mt-12 text-center text-sm text-muted-foreground pt-6 border-t border-border/30">
                    <p className="flex items-center justify-center gap-2">
                      <Database className="w-3 h-3" />
                      Insights generated from: {careerDashboard.data_sources.join(" • ")}
                    </p>
                    <p className="mt-2 text-xs opacity-70">
                      Last updated: {dashboardData?.generated_at ? new Date(dashboardData.generated_at).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
