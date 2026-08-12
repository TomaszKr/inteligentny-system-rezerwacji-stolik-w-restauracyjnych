import React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): React.SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
});

export const IcCalendar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>
);
export const IcClock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IcUsers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" /><circle cx="10" cy="8" r="3.2" /><path d="M20 19v-1.4a3.4 3.4 0 0 0-2.6-3.3M16 5.2a3.2 3.2 0 0 1 0 5.8" /></svg>
);
export const IcUser = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></svg>
);
export const IcTable = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="7.5" /><path d="M12 4.5v15M4.5 12h15" opacity="0.5" /></svg>
);
export const IcCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>
);
export const IcCheckCircle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>
);
export const IcX = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IcArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IcArrowLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const IcSparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 3l1.8 4.9L19 9.7l-4.6 2.3L12 17l-2.4-5L5 9.7l5.2-1.8z" /></svg>
);
export const IcBell = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IcMail = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></svg>
);
export const IcLock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);
export const IcPhone = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z" /></svg>
);
export const IcLayout = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M9 9.5V20" /></svg>
);
export const IcLogout = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h9M16 8l3 4-3 4" /></svg>
);
export const IcCompass = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>
);
export const IcMapPin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IcStar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} fill="currentColor" stroke="none"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" /></svg>
);
export const IcMoon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
export const IcSun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" /></svg>
);
