const fs = require('fs');
const file = 'l:/GITS/ERP/Campus-Nexus_back_up_1.4/Campus-Nexus/frontend/src/pages/admin/department-admin/components/dashboard/NextClassCard.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace the broken characters with bullets
code = code.replace(/\ufffd/g, '•');

// inject isUpcomingOnly in ClassInfo
code = code.replace('duration?: string;', 'duration?: string;\n  isUpcomingOnly?: boolean;');

// string replace the badge
const oldBadge = `<span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full animate-pulse-ring">\n                LIVE NOW\n              </span>`;
const newBadge = `<span className={\`px-2 py-0.5 ${"$"}{currentClass.isUpcomingOnly ? 'bg-secondary' : 'bg-primary animate-pulse-ring'} text-primary-foreground text-xs font-semibold rounded-full\`}>\n                {currentClass.isUpcomingOnly ? "UPCOMING" : "LIVE NOW"}\n              </span>`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync(file, code, 'utf8');
