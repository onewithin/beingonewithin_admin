import { ChartColumnBig, SquareUserRound, Settings, Headphones, CalendarCheck, LockKeyhole, FileQuestionMark, CreditCard, ArrowLeftRight } from "lucide-react";

export const sidebarLinks = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: ChartColumnBig,
    },
    {
        label: "Onboarding control",
        href: "/dashboard/onboarding_control",
        icon: FileQuestionMark,
    },
    {
        label: "User Management",
        href: "/dashboard/users",
        icon: SquareUserRound,
    },
    {
        label: "Manage Meditation",
        href: "/dashboard/meditation",
        icon: Headphones,
    },
    {
        label: "Thought of the Day",
        href: "/dashboard/thoughts",
        icon: CalendarCheck,
    },
    {
        label: "Subscription Plans",
        href: "/dashboard/plans",
        icon: CreditCard,
    },
    {
        label: "Transactions",
        href: "/dashboard/transactions",
        icon: ArrowLeftRight,
    },
    {
        label: "Policy & Terms",
        href: "/dashboard/policy_and_terms",
        icon: LockKeyhole,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];
