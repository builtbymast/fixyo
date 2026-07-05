import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function JobsList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();

  const filteredJobs = jobs?.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage all your work orders and projects</p>
        </div>
        <Button onClick={() => setLocation("/app/jobs/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Job
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No jobs found. Create your first job to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation(`/app/jobs/${job.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.description?.substring(0, 100)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                        {statusLabels[job.status as keyof typeof statusLabels]}
                      </Badge>
                      {job.scheduledDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Job #{job.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
