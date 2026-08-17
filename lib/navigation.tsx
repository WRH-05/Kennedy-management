import {
  Users,
  Archive,
  ReceiptCent,
  GraduationCap,
  Layers,
  Briefcase,
  ClipboardList,
  CalendarDays,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  iconComponent: LucideIcon
  iconClassName: string
  allowedRoles: string[]
}

export const ALL_NAVIGATION_CARDS: NavItem[] = [
  {
    title: "Manage Students",
    description: "View and manage student records",
    href: "/manager/students",
    icon: <Users className="h-5 w-5 text-blue-500" />,
    iconComponent: Users,
    iconClassName: "text-blue-500",
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Manage Teachers",
    description: "View and manage teacher profiles",
    href: "/manager/teachers",
    icon: <Briefcase className="h-5 w-5 text-green-500" />,
    iconComponent: Briefcase,
    iconClassName: "text-green-500",
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Activity & Financial Logs",
    description: "Review audit history of registrations, payments and actions",
    href: "/manager/logs",
    icon: <ClipboardList className="h-5 w-5 text-amber-500" />,
    iconComponent: ClipboardList,
    iconClassName: "text-amber-500",
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Class Instances",
    description: "Edit active class schedules and instances",
    href: "/manager/course-instances",
    icon: <CalendarDays className="h-5 w-5 text-red-500" />,
    iconComponent: CalendarDays,
    iconClassName: "text-red-500",
    allowedRoles: ["owner", "manager", "receptionist"],
  },
  {
    title: "Manage Archives",
    description: "Check past historical records",
    href: "/manager/archive",
    icon: <Archive className="h-5 w-5 text-amber-800" />,
    iconComponent: Archive,
    iconClassName: "text-amber-800",
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Payouts",
    description: "Process student refunds and teacher payments",
    href: "/manager/payouts",
    icon: <ReceiptCent className="h-5 w-5 text-emerald-600" />,
    iconComponent: ReceiptCent,
    iconClassName: "text-emerald-600",
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Courses",
    description: "Create and process new courses",
    href: "/manager/courses",
    icon: <GraduationCap className="h-5 w-5 text-indigo-600" />,
    iconComponent: GraduationCap,
    iconClassName: "text-indigo-600",
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Manage Levels",
    description: "Configure and process new grade levels",
    href: "/manager/gradeLevels",
    icon: <Layers className="h-5 w-5 text-teal-600" />,
    iconComponent: Layers,
    iconClassName: "text-teal-600",
    allowedRoles: ["owner", "manager"],
  },
  {
    title: "Analytics & Stats",
    description: "School financial health and class performance",
    href: "/manager/stats",
    icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
    iconComponent: BarChart3,
    iconClassName: "text-purple-600",
    allowedRoles: ["owner", "manager"],
  },
]

export function getAuthorizedNavigation(role?: string | null): NavItem[] {
  if (!role) return []
  return ALL_NAVIGATION_CARDS.filter((card) => card.allowedRoles.includes(role))
}

/**
 * Maps the current pathname to the href of the active navigation item.
 * Handles exact matches, sub-path matches under /manager/*, and
 * detail-route prefixes (/student/, /teacher/, /course-instance/, /course/, /grade-level/).
 */
export function getActiveNavHref(pathname: string): string | undefined {
  // Exact match
  const exactMatch = ALL_NAVIGATION_CARDS.find((card) => card.href === pathname)
  if (exactMatch) return exactMatch.href

  // Sub-path match: e.g. /manager/students/something matches /manager/students
  const subMatch = ALL_NAVIGATION_CARDS.find(
    (card) => pathname.startsWith(card.href + "/")
  )
  if (subMatch) return subMatch.href

  // Detail-route prefix map: map detail routes back to their list nav item
  const detailPrefixMap: Record<string, string> = {
    "/student/": "/manager/students",
    "/teacher/": "/manager/teachers",
    "/course-instance/": "/manager/course-instances",
    "/course/": "/manager/courses",
    "/grade-level/": "/manager/gradeLevels",
  }

  for (const [prefix, navHref] of Object.entries(detailPrefixMap)) {
    if (pathname.startsWith(prefix)) return navHref
  }

  return undefined
}
