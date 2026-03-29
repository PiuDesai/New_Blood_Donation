/** Canonical home path per role (donor/patient use /role/dashboard). */
export function dashboardPath(role) {
  const r = String(role || "").toLowerCase();
  if (r === "donor") return "/donor/dashboard";
  if (r === "patient") return "/patient/dashboard";
  if (r === "admin") return "/admin";
  if (r === "bloodbank") return "/bloodbank";
  return "/role-selection";
}
