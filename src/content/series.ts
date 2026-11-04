/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SPEAKOUT · CONTENT FILE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything the site says lives here: settings, events, speakers, topics,
 *  FAQ and section copy. Edit this file, save, and redeploy. You never need to
 *  touch a component.
 *
 *  Placeholders are written in [square brackets]. The site shows them with a
 *  dashed underline so they are easy to spot. To list the ones that are left:
 *
 *      npm run placeholders
 *
 *  Dates and times are New York time. Write them as "YYYY-MM-DDTHH:MM",
 *  for example "2027-03-11T19:00" for 7 pm on 11 March 2027.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ───────────────────────────── 1. Site settings ───────────────────────────── */

export const site = {
  name: "Speakout",
  /**
   * The one-line promise in the hero, split into the lines it is set on.
   * Keep each line short (about 13 characters) so it fits on a phone.
   */
  promise: ["New medicine,", "explained in", "plain words."],
  /** Used for search results and link previews. */
  description:
    "A free evening series in New York City. A researcher gives a short talk on medicine and drug development, with no slides, then takes questions from the audience. No science background needed.",
  city: "New York City",

  /** Full address of the live site, used for link previews and the sitemap. */
  url: "[https://your-domain.com]",

  /** Shown in the hero until an event has a confirmed date. */
  firstEventLabel: "[Month Year]",

  organizer: {
    name: "Michael Peng",
    bio: "[One-line bio]",
  },

  /** General contact address (also used for topic suggestions). */
  contactEmail: "[hello@your-domain.com]",
  /** Where researchers write to offer a talk. Can be the same address. */
  speakerEmail: "[speakers@your-domain.com]",

  /** Leave url empty ("") to hide a link. */
  social: [
    { label: "Instagram", url: "[https://instagram.com/your-handle]" },
    { label: "LinkedIn", url: "[https://linkedin.com/company/your-page]" },
    { label: "Bluesky", url: "[https://bsky.app/profile/your-handle]" },
  ],

  signup: {
    /**
     * Formspree form ID: the part after /f/ in your form endpoint.
     * Create a free form at formspree.io, then paste the ID here, e.g. "xyzzabcd".
     * While this is still a placeholder, the form shows its success state
     * but nothing is saved.
     */
    formspreeFormId: "[FORMSPREE_FORM_ID]",
    /** The one line under the form about how emails are used. */
    privacyLine:
      "We only email you about upcoming evenings, about once a month. We never share your address, and you can unsubscribe at any time.",
  },
};

/* ───────────────────────────────── 2. Speakers ─────────────────────────────────
 *  Only speakers with `confirmed: true` appear anywhere on the site.
 *  Never add a photo or name without the researcher's permission.
 *
 *  Example entry (copy it into the list below and fill it in):
 *
 *  {
 *    id: "jane-doe",                       // short id, used by events below
 *    name: "Jane Doe",
 *    role: "Postdoctoral researcher in pharmacology",
 *    affiliation: "Example University",
 *    bio: "Two or three plain sentences about the person and their work.",
 *    photo: "/speakers/jane-doe.jpg",      // optional; put the file in /public/speakers
 *    links: [{ label: "Lab page", url: "https://example.edu/lab" }],
 *    confirmed: true,
 *  },
 */

export type Speaker = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  photo?: string;
  links?: { label: string; url: string }[];
  confirmed: boolean;
};

export const speakers: Speaker[] = [];

/* ───────────────────────────────── 3. Events ──────────────────────────────────
 *  One entry per evening. Leave a field as null while it is still to be
 *  announced and the site will say "TBA".
 */

export type SeriesEvent = {
  /** Used in the address: /events/first-evening */
  slug: string;
  /** Printed on the label as No. 001, No. 002, … */
  number: number;
  /** Talk title. Leave null until the topic is set. */
  title: string | null;
  /** Short subject area, for example "Metabolism". */
  topic: string | null;
  /** A few sentences about the talk, shown on the event page. */
  summary: string | null;
  /** Start time in New York time, "YYYY-MM-DDTHH:MM". */
  start: string | null;
  /** How long the evening runs, in minutes. */
  durationMinutes: number;
  /** When doors open, if different from the start, "HH:MM". */
  doorsOpen: string | null;
  venue: {
    name: string;
    address: string;
    /** Optional link to a map. */
    mapUrl?: string;
    /** Optional notes: entrance, accessibility, nearest subway. */
    notes?: string;
  } | null;
  /** Must match a speaker id above. Only confirmed speakers are shown. */
  speakerId: string | null;
  /** Link to the RSVP page (Eventbrite, Luma, a form…). null = RSVP not open yet. */
  rsvpUrl: string | null;
};

export const events: SeriesEvent[] = [
  {
    slug: "first-evening",
    number: 1,
    title: null,
    topic: null,
    summary: null,
    start: null,
    durationMinutes: 75,
    doorsOpen: null,
    venue: null,
    speakerId: null,
    rsvpUrl: null,
  },
];

/* ───────────────────────────────── 4. Topics ──────────────────────────────────
 *  Example questions shown in the Topics section. They are labelled as
 *  examples on the site.
 */

export const topics: { area: string; question: string }[] = [
  {
    area: "Drug development",
    question: "What does a new drug go through before it reaches your pharmacy?",
  },
  {
    area: "Metabolism",
    question: "How did a diabetes drug become a treatment for obesity?",
  },
  {
    area: "Genetics",
    question: "Why does the same medicine work for one person and not another?",
  },
  {
    area: "Vaccines",
    question: "How does an mRNA vaccine teach the body to fight a virus?",
  },
  {
    area: "Infection",
    question: "Why are antibiotics losing their power, and what comes next?",
  },
  {
    area: "Clinical trials",
    question: "Who takes part in a clinical trial, and what actually happens?",
  },
];

/* ─────────────────────────────────── 5. FAQ ─────────────────────────────────── */

export const faq: { question: string; answer: string }[] = [
  {
    question: "Is it free?",
    answer:
      "Yes. Every evening is free and open to anyone. Seats can be limited, so we ask you to RSVP when an event opens.",
  },
  {
    question: "Where is it?",
    answer:
      "In New York City. The venue can change from one evening to the next, and each event page lists the address and how to get there.",
  },
  {
    question: "Do I need a science background?",
    answer:
      "No. Talks are made for people with no science training, and no question is too basic. If you’re curious about how medicine works, you’re in the right place.",
  },
  {
    question: "How do I RSVP?",
    answer:
      "Each event has an RSVP button once registration opens. If it isn’t open yet, join the mailing list and we’ll email you when it is.",
  },
  {
    question: "Can I suggest a topic?",
    answer: `Yes, please do. Email ${site.contactEmail} with a question you’d like answered, and we’ll look for a researcher who can answer it.`,
  },
];

/* ─────────────────────────────── 6. Section copy ────────────────────────────── */

export const copy = {
  hero: {
    eyebrow: "Free evening talks on medicine",
    sub: "Each evening, a researcher talks for 10 to 15 minutes, without slides. Then the room asks the questions.",
    cta: "Get on the list",
    secondary: "How an evening works",
  },

  about: {
    label: "What it is",
    statements: [
      { label: "The series", text: "Speakout is a free evening series in New York City." },
      {
        label: "The talks",
        text: "Researchers explain new work in medicine and drug development, and what it could mean for your life.",
      },
      {
        label: "The audience",
        text: "You don’t need a science background. Bring your curiosity and your questions.",
      },
    ],
  },

  evening: {
    label: "How an evening works",
    steps: [
      {
        title: "Arrive",
        text: "Doors open a little before the talk. Find a seat, settle in and meet the people around you.",
        facts: ["Free", "All welcome"],
      },
      {
        title: "The talk",
        text: "A researcher talks for 10 to 15 minutes about one idea in medicine. There are no slides. It’s just a person explaining their work.",
        facts: ["10–15 min", "No slides"],
      },
      {
        title: "The conversation",
        text: "Then the floor opens. Ask anything, from the basics to the big questions. The researcher answers and the room joins in.",
        facts: ["Open Q&A", "No question too basic"],
      },
    ],
  },

  topics: {
    label: "Example topics",
    title: "One question per evening",
    intro:
      "These are examples of the questions an evening might take on. Each speaker brings their own.",
  },

  events: {
    label: "Upcoming",
    title: "Upcoming evenings",
    note: "More dates are on the way. Join the mailing list to hear about them first.",
  },

  speakers: {
    label: "Speakers",
    title: "Speakers",
    empty: "Speakers announced soon.",
    emptyNote: "We list researchers here once they’ve confirmed.",
  },

  researchers: {
    label: "For researchers",
    title: "Give a talk",
    pitch:
      "Explain your work to a room of curious New Yorkers. It’s short, there are no slides to prepare, and we take care of everything else.",
    terms: [
      { term: "Talk", detail: "10 to 15 minutes, on one idea" },
      { term: "Slides", detail: "None. Just you and the room" },
      { term: "Venue", detail: "We find it, book it and set it up" },
      { term: "Logistics", detail: "We handle promotion, RSVPs and the evening itself" },
      { term: "Schedule", detail: "Flexible. We work around your calendar" },
    ],
    cta: "Offer a talk",
  },

  faq: {
    label: "FAQ",
    title: "Questions",
  },

  signup: {
    title: "Get on the list",
    intro: "Hear about the next evening before anyone else.",
    button: "Sign up",
    success: "You’re on the list.",
    successNote: "We’ll email you when the next evening is announced.",
  },
};
