import { reports } from "../data/mockDashboard";

export const reportService = {
  get: async (type: "daily" | "weekly" | "monthly") => reports[type],
};
