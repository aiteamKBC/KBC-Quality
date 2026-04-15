import { useState } from "react";
import type { LearnerTimelineEvent } from "@/types/learners";

interface Props {
  events: LearnerTimelineEvent[];
}

const typeConfig: Record<string, { icon: string; bg: string; text: string; label: string }> = {
  Review: { icon: "ri-clipboard-line", bg: "bg-brand-100", text: "text-brand-600", label: "Review" },
  Attendance: { icon: "ri-calendar-check-line", bg: "bg-amber-100", text: "text-amber-600", label: "Attendance" },
  Start: { icon: "ri-flag-line", bg: "bg-emerald-100", text: "text-emerald-600", label: "Start" },
  Alert: { icon: "ri-alarm-warning-line", bg: "bg-red-100", text: "text-red-500", label: "Alert" },
};

const filterTypes = ["All", "Review", "Attendance", "Start", "Alert"];

export default function LearnerTimeline({ events }: Props) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? events : events.filter((event) => event.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {filterTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === type ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-5 top-0 z-0 w-px bg-slate-200"></div>
        <div className="space-y-1">
          {filtered.map((event, index) => {
            const config = typeConfig[event.type] ?? typeConfig.Review;
            const isFirst = index === 0;

            return (
              <div key={event.id} className={`relative flex gap-4 ${isFirst ? "" : "pt-1"}`}>
                <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                  <i className={`${config.icon} ${config.text} text-sm`}></i>
                </div>

                <div className="mb-4 flex-1 rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300">
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`badge text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>
                        <span className="text-sm font-semibold text-slate-800">{event.title}</span>
                      </div>
                      <span className="text-xs text-slate-400">{event.date}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{event.text}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      <i className="ri-database-2-line mr-1"></i>
                      {event.by}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="ml-10 py-10 text-center text-sm text-slate-400">No {filter.toLowerCase()} events found</div>
          )}
        </div>
      </div>
    </div>
  );
}
