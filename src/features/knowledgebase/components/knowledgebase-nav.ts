import {
    LayoutGrid,
    Building2,
    Target,
    Layers,
    Wrench,
    BookOpen,
    ClipboardList,
    FileText,
    BookMarked,
    Newspaper,
    Bookmark,
    History,
    Download,
    FilePlus2,
    Workflow,
} from "lucide-react";
import type { KnowledgebaseNavSection } from "./Sidebar";

export const knowledgebaseNavSections: KnowledgebaseNavSection[] = [
    {
        title: "Browse Library",
        items: [
            { label: "All Collections", href: "/knowledgebase", icon: LayoutGrid },
            { label: "Foundation Collection", href: "/knowledgebase/foundation", icon: Building2 },
            { label: "Strategy Collection", href: "/knowledgebase/strategy", icon: Target},
            { label: "Platform Collection", href: "/knowledgebase/platform", icon: Layers },
            { label: "Operations Collection", href: "/knowledgebase/operations", icon: Wrench },
            { label: "Manuals Collection", href: "/knowledgebase/manuals", icon: BookOpen },
            { label: "Playbooks Collection", href: "/knowledgebase/playbooks", icon: ClipboardList },
            { label: "Templates Collection", href: "/knowledgebase/templates", icon: FileText },
            { label: "Reference Collection", href: "/knowledgebase/reference", icon: BookMarked },
            { label: "Publication Collection", href: "/knowledgebase/publication", icon: Newspaper },
        ],
    },
    {
        title: "Quick Access",
        items: [
            { label: "My Bookmarks", href: "/knowledgebase/bookmarks", icon: Bookmark },
            { label: "Recently Viewed", href: "/knowledgebase/recent", icon: History },
            { label: "My Downloads", href: "/knowledgebase/downloads", icon: Download },
            { label: "My Contributions", href: "/knowledgebase/contributions", icon: FilePlus2 },
        ],
    },
    {
        title: "Knowledge Flow (TKS)",
        items: [
            { label: "View Knowledge Flow", href: "/knowledgebase/knowledge-flow", icon: Workflow, chevron: true },
        ],
    },
];
