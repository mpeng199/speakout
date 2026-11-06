/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SPEAKOUT · CONTENT FILE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything the site says lives here: settings, speakers, events, topics,
 *  FAQ, and the wording of every page, down to the buttons, the menu, the
 *  text read out by screen readers and the link-preview images. Edit this
 *  file, save, and redeploy. You never need to touch a component.
 *
 *    1. Site settings   2. Speakers   3. Events   4. Topics   5. FAQ
 *    6. Wording (everything else, grouped by where it appears)
 *
 *  Placeholders are written in [square brackets], as a whole value or inside a
 *  sentence ("Doors open at [time]"). The site shows each one with a dashed
 *  underline so it is easy to spot; the link-preview images, which can't, say
 *  "To be announced" instead. To list the ones that are left:
 *
 *      npm run placeholders
 *
 *  Text between `backticks` can include ${site.name} or ${site.city}: they
 *  become the series name and city from section 1. Some lines in section 6
 *  have a word in {curly braces}, such as {title}; the site puts the real
 *  value there, so keep the braces and the word inside them as they are.
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
 *  announced and the site will say "TBA" (the exact words are in `tba`, in
 *  section 6).
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

/* ──────────────────────────────── 6. Wording ─────────────────────────────────
 *  Every other word on the site, grouped by where it appears: the menu, the
 *  evening labels, each section of the home page (top to bottom), the event
 *  pages, the "page not found" page, and the browser tab and link previews.
 *  Lines marked "screen readers" are not shown on screen but read aloud to
 *  people who can't see the page, so keep them short and plain.
 */

export const copy = {
  /** The bar at the top of every page, and the menu it opens on phones. */
  nav: {
    /** The first stop for keyboard users: jumps past the menu to the page. */
    skipLink: "Skip to content",
    /** Screen readers: the series name in the top left, which goes home. */
    home: `${site.name}, home`,
    /** Screen readers: the name of the row of section links. */
    label: "Main",
    /** The section links, in order. Change only the words in quotes. */
    links: {
      about: "About",
      format: "Format",
      topics: "Topics",
      events: "Events",
      speakers: "Speakers",
      faq: "FAQ",
    },
    /** The button that jumps to the mailing list. */
    cta: "Get on the list",
    /** The button that opens the menu on phones (also its name for screen readers). */
    menu: "Menu",
    close: "Close",
  },

  /** Screen readers: said after any link that opens in a new tab. */
  newTab: "(opens in a new tab)",

  /**
   * The pharmacy-style label each evening is printed on: in the hero, on the
   * event cards, on the event pages and in the link-preview images.
   */
  label: {
    /** Printed before the evening's number: No. 001. */
    number: "No.",
    /** The rows: When, Where, Speaker and Admission everywhere, plus Time on event pages. */
    when: "When",
    time: "Time",
    where: "Where",
    speaker: "Speaker",
    admission: "Admission",
    /** What the Admission row says, on every label and share image. */
    free: "Free. Everyone welcome.",
    /** The line under the rows, in the hero and on event pages. */
    footer: "No slides. No science background needed.",
  },

  /** The note after an upcoming date on the labels: "· tonight", "· in 5 days". */
  relativeDay: {
    now: "happening now",
    tonight: "tonight",
    tomorrow: "tomorrow",
    inDays: "in {days} days",
  },

  /** Names for an evening that has no title yet. {number} becomes "No. 002". */
  untitled: {
    first: "First evening",
    next: "Next evening",
    numbered: "Evening {number}",
  },

  /** What the site says while a detail is still to be announced. */
  tba: {
    /** On its own: the small tag on event cards. */
    short: "TBA",
    /**
     * A label row with nothing to show yet: the speaker, or the hero's When before any date.
     * The share images also use it in place of a [placeholder], which they can't underline.
     */
    long: "To be announced",
    date: "Date TBA",
    time: "Time TBA",
    venue: `Venue TBA, ${site.city}`,
  },

  hero: {
    /** Screen readers: the name of this first section. */
    name: "Introduction",
    eyebrow: "Free evening talks on medicine",
    sub: "Each evening, a researcher talks for 10 to 15 minutes, without slides. Then the room asks the questions.",
    cta: "Get on the list",
    secondary: "How an evening works",
    /** On the label until an evening has a date: "First event: March 2027" (the month is site.firstEventLabel). */
    firstEvent: "First event:",
    /** At the bottom of the label, when it links to an evening's page. */
    details: "Details →",
  },

  about: {
    label: "What it is",
    statements: [
      { label: "The series", text: `${site.name} is a free evening series in ${site.city}.` },
      {
        label: "The talks",
        text: "Researchers explain new work in medicine and drug development, and what it could mean for your life.",
      },
      {
        label: "The audience",
        text: "You don’t need a science background. Bring your curiosity and your questions.",
      },
    ],
    /** Before the organizer's name (section 1) at the end of the section. */
    runBy: "Run by",
  },

  evening: {
    label: "How an evening works",
    /** Screen readers: the name of the list of steps, and of each step's tags. */
    stepsName: "The three parts of an evening",
    factsName: "Details",
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
    /** Also what screen readers call the list of topics. */
    label: "Example topics",
    title: "One question per evening",
    intro:
      "These are examples of the questions an evening might take on. Each speaker brings their own.",
    /** The line under the list. "Suggest a topic" links to an email to contactEmail (section 1). */
    ask: "Have a question you’d like answered?",
    suggest: "Suggest a topic",
    /** Used instead while contactEmail is still a placeholder. */
    suggestAt: "Suggest a topic at",
    /** Subject line of that email. */
    emailSubject: `A topic for ${site.name}`,
  },

  events: {
    label: "Upcoming",
    title: "Upcoming evenings",
    /** Screen readers: the name of the list of upcoming evenings. */
    listName: "Upcoming events",
    note: "More dates are on the way. Join the mailing list to hear about them first.",
    cta: "Get on the list ↓",
    /** Shown when no upcoming evening is listed. */
    none: "The next evening will be announced soon.",
    pastTitle: "Past evenings",
    /** The button on an event card once RSVP is open. */
    rsvp: "RSVP",
    /** Screen readers: said after "RSVP". */
    rsvpMore: "for {title} (opens in a new tab)",
    /** In place of the button until RSVP opens. */
    rsvpSoon: "RSVP opens soon",
    details: "Event details →",
  },

  speakers: {
    title: "Speakers",
    empty: "Speakers announced soon.",
    emptyNote: "We list researchers here once they’ve confirmed.",
    researcherLink: "Are you a researcher? Give a talk →",
    /** Screen readers: describes a speaker's photo. */
    portrait: "Portrait of {name}",
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
    /** The header and the line at the bottom of the label with the terms. */
    termsLeft: "For researchers",
    termsRight: "Details",
    termsFooter: "Tell us a little about your work and which months suit you.",
    /** The button opens an email to speakerEmail (section 1) with this subject line. */
    cta: "Offer a talk",
    emailSubject: `Giving a talk at ${site.name}`,
    /** Before the address, next to the button. */
    orWriteTo: "or write to",
  },

  faq: {
    label: "FAQ",
    title: "Questions",
    /** The line under the questions, before contactEmail (section 1). */
    more: "Something else?",
    writeTo: "Write to",
  },

  /** The mailing list form, at the bottom of every page. */
  signup: {
    label: "Mailing list",
    title: "Get on the list",
    intro: "Hear about the next evening before anyone else.",
    emailLabel: "Email address",
    /** The example shown in the empty box. */
    emailPlaceholder: "name@example.com",
    button: "Sign up",
    /** On the button while the address is being sent. */
    sending: "Signing up…",
    /** Error messages under the box. */
    invalid: "Please enter a full email address, like name@example.com.",
    failed: "That didn’t go through. Please try again in a moment.",
    offline: "We couldn’t reach the signup service. Check your connection and try again.",
    /** The card that replaces the form once someone has signed up. */
    confirmed: "Confirmed",
    success: "You’re on the list.",
    successNote: "We’ll email you when the next evening is announced.",
    /** Subject line of the email you get for each new signup. */
    emailSubject: "New mailing list signup",
  },

  /** Under the mailing list form, at the bottom of every page. */
  footer: {
    contact: "Contact",
    follow: "Follow",
    /** Before the organizer's name and bio (section 1). */
    runBy: "Run by",
    copyright: `© ${site.name}. Free evening talks on medicine in ${site.city}.`,
    colophon: "Set in Mona Sans and Source Serif 4. The light is drawn live in your browser.",
    backToTop: "Back to top ↑",
  },

  /** Each evening's own page, /events/… */
  eventPage: {
    /** Screen readers: the name of the trail at the top (Speakout / Events / No. 001). */
    breadcrumb: "Breadcrumb",
    breadcrumbEvents: "Events",
    /** The tag above the title. */
    status: { tba: "TBA", past: "Past event", upcoming: "Upcoming" },
    /** Under the title, until the evening has a summary (section 3). */
    introTba:
      "The date, venue, speaker and topic for this evening will be announced soon. Join the mailing list and we’ll tell you as soon as they’re set.",
    intro: "A researcher talks for 10 to 15 minutes, without slides. Then the room asks questions.",
    /** The main button: RSVP once it is open, otherwise a link to the mailing list. */
    rsvp: "RSVP",
    notify: "Get notified when RSVP opens",
    notifyPast: "Hear about the next one",
    /** The share button, and what it says after copying the link. */
    share: "Share this evening",
    shareCopied: "Link copied",
    shareFailed: "Copy the address bar link",
    /** Under the buttons, once the evening has a date. Screen readers say the "More" part after the link. */
    calendar: "Add to calendar:",
    calendarGoogle: "Google",
    calendarGoogleMore: "Calendar (opens in a new tab)",
    calendarOther: "Apple, Outlook",
    calendarOtherMore: "and other calendars (.ics file)",
    /** The description inside a calendar entry, until the evening has a summary. */
    calendarDescription: "A free evening talk on medicine, followed by questions from the room.",
    /** Shown if someone opens the calendar file of an evening that has no date. */
    calendarNoDate: "This event does not have a date yet.",
    /** The label's title, and its Time row once doors have a time: "7 pm, doors 6:30 pm". */
    labelTitle: "Details",
    timeWithDoors: "{time}, doors {doors}",
    talkLabel: "The talk",
    talkTba: "Topic to be announced.",
    talkTbaText:
      "Each evening takes on one question about medicine or drug development, explained for people with no science background.",
    talkTbaLink: "See example topics →",
    speakerLabel: "Speaker",
    speakerTba: "To be announced.",
    speakerTbaText: "We name speakers once they’ve confirmed.",
    /** The three steps come from `evening` above; once there is a date, each gets its time. */
    runsLabel: "How the evening runs",
    runsDoors: "Doors {time}",
    runsUntil: "Until {time}",
    venueLabel: "Getting there",
    venueTba: "Venue to be announced.",
    venueTbaText: `The address, entrance and nearest subway will be listed here once the venue is confirmed. Every evening is in ${site.city}.`,
    venueMap: "Open in maps ↗",
    /**
     * Search results and link previews, until the evening has a summary.
     * {when} becomes metaWhen once there is a date, metaWhenTba before.
     */
    metaDescription: `{title} at ${site.name}, a free evening talk on medicine in ${site.city}. {when}`,
    metaWhen: "{date}, {time}.",
    metaWhenTba: "Date, venue and speaker to be announced.",
  },

  /** The page people see when an address doesn't exist. */
  notFound: {
    /** The browser tab and search results. */
    title: "Page not found",
    description: `This page doesn’t exist. ${site.name} is a free evening series of talks on medicine in ${site.city}.`,
    eyebrow: "Error 404",
    heading: "Page not found.",
    text: "The page you were looking for has moved or never existed. The next evening is on the home page.",
    button: "Back to the home page",
  },

  /** The browser tab and search results (the description is in section 1). */
  meta: {
    title: `${site.name} · Free evening talks on medicine in New York`,
    /** The name when someone saves the site to their phone's home screen. */
    appName: `${site.name}: free evening talks on medicine`,
  },

  /**
   * The link-preview images: the picture a chat app or social site shows for a link. The home
   * page's image shows the same label as the hero; an event's image shows that evening's.
   */
  shareImage: {
    eyebrow: `${site.name} · Free evening talks on medicine · NYC`,
    /** Screen readers: describes the image of the home page, and of an event page. */
    homeAlt: `${site.name}: ${site.promise.join(" ")} Free evening talks on medicine in ${site.city}.`,
    eventAlt: `An evening at ${site.name}, free talks on medicine in ${site.city}`,
    /** An event image's label title, until the evening has a date. */
    detailsSoon: "Details soon",
  },
};
