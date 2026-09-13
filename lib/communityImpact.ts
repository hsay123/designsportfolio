export type CommunityType =
  | "hackathon"
  | "workshop"
  | "talk"
  | "meetup"
  | "volunteering";

export type CommunityRole =
  | "attendee"
  | "speaker"
  | "organizer"
  | "volunteer";

export interface CommunityImpactEntry {
  id: string;
  title: string;
  type: CommunityType;
  role: CommunityRole;
  organizer: string;
  location: string;
  date: string; // ISO, drives year tabs + ordering
  description: string; // 1–3 sentences
  images: string[]; // paths to photos; [] = hand-drawn paper placeholder
  tags?: string[];
  link?: string;
}

/* Seeded placeholder entries — swap with real events + photos later. */
export const communityImpact: CommunityImpactEntry[] = [
  {
    id: "stellar-ragnarok-hackathon-2025",
    title: "Stellar Ragnarok Hackathon",
    type: "hackathon",
    role: "attendee",
    organizer: "Stellar Foundation",
    location: "Virtual · Global",
    date: "2025-08-15",
    description:
      "Built a value-transfer concept in a weekend using the Stellar toolkit and smart contracts. Came away with a much better sense of how programmable money actually ships.",
    images: [],
    tags: ["Winner", "DeFi", "40h"],
    link: "https://stellar.org/challenges/ragnarok-fall-2025",
  },
  {
    id: "midnight-fellowship-2026",
    title: "Midnight Fellowship — ZK & privacy by design",
    type: "workshop",
    role: "speaker",
    organizer: "Midnight (Input Output)",
    location: "Hyderabad, India",
    date: "2026-03-02",
    description:
      "Walked a room through prototyping privacy-first web3 ideas in Compact, then paired up to build micro-apps. The Q&A ran long — my favorite kind of talk.",
    images: [],
    tags: ["ZK", "Workshop"],
  },
  {
    id: "gdg-hackathon-2025",
    title: "GDG Hackathon — IPX Market",
    type: "hackathon",
    role: "attendee",
    organizer: "GDG",
    location: "Hyderabad, India",
    date: "2025-09-02",
    description:
      "Turned an AI-dataset marketplace idea into a working prototype over a weekend. Another first-place finish, another reason to keep vibing with AI.",
    images: [],
    tags: ["Winner", "AI", "36h"],
  },
  {
    id: "ssoc-2026",
    title: "SSOC — Social Summer of Code",
    type: "volunteering",
    role: "volunteer",
    organizer: "Social Summer of Code",
    location: "Remote",
    date: "2026-05-20",
    description:
      "Mentored new open-source contributors through their first merged PRs — fixing issues, writing docs, and making the repo feel less intimidating.",
    images: [],
    tags: ["Open Source", "Mentoring"],
  },
  {
    id: "hacktoberfest-2024",
    title: "Hacktoberfest",
    type: "volunteering",
    role: "volunteer",
    organizer: "DigitalOcean",
    location: "Remote",
    date: "2024-10-01",
    description: "Slow weekends spent triaging issues and reviewing PRs.",
    images: [],
  },
  {
    id: "sticker-designer-meetup-2025",
    title: "Designer Sticker Meetup",
    type: "meetup",
    role: "organizer",
    organizer: "Design community",
    location: "Hyderabad, India",
    date: "2025-11-14",
    description:
      "A tiny meetup I helped organize where designers swapped ideas (and sticker sheets) over a shared Figma board. Low pressure, high signal.",
    images: [],
    tags: ["Community"],
  },
];
