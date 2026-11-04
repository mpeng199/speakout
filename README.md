# Speakout

Website for **Speakout**, a free evening series in New York City where researchers give short talks on medicine and drug development, with no slides, then take questions from the audience.

Built with Next.js (App Router), Tailwind CSS, GSAP (ScrollTrigger, SplitText) and Lenis.

## Editing the content

Everything the site says lives in one file: **`src/content/series.ts`**.

- **Settings**: series name, the hero promise, contact emails, social links, organizer, Formspree form ID.
- **Events**: one entry per evening. Leave a field as `null` while it is TBA and the site says "TBA".
- **Speakers**: only entries with `confirmed: true` appear on the site. Never add a name or photo without the researcher's permission.
- **Topics, FAQ and section copy**.

Placeholders are written in `[square brackets]` and show on the site with a dashed underline. To list what is left:

```bash
npm run placeholders
```

### Adding an event

```ts
{
  slug: "glp1-and-obesity",          // the page address: /events/glp1-and-obesity
  number: 2,                         // printed as No. 002
  title: "From diabetes to obesity: the story of GLP-1",
  topic: "Metabolism",
  summary: "Two or three plain sentences about the talk.",
  start: "2027-03-11T19:00",         // New York time
  durationMinutes: 75,
  doorsOpen: "18:30",
  venue: { name: "Venue name", address: "123 Example St, New York, NY", mapUrl: "https://maps.google.com/?q=..." },
  speakerId: "jane-doe",             // must match a confirmed speaker
  rsvpUrl: "https://lu.ma/...",      // null until RSVP opens
},
```

Each event gets its own page, a share image and, once it has a date, an "Add to calendar" file.

## Mailing list

The signup form posts to [Formspree](https://formspree.io). Create a form there and paste its ID into `site.signup.formspreeFormId`. Until then, the form shows its success state with a note that nothing was saved.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Notes on the build

- **Fonts** are self-hosted, trimmed builds of Mona Sans and Source Serif 4 with `font-display: swap` (see `src/fonts/README.md`).
- **The amber light** is a small WebGL shader (`src/components/visuals`). It starts after the first scroll, touch or pointer move (or after a few seconds), so it never slows the first load. A soft vector glow shows until then. With reduced motion, or on devices without a GPU, a pre-rendered frame of the light (`public/amber/light.webp`) is shown instead.
- **Motion** loads after the page is interactive (`src/components/motion`). All content is in the HTML and readable without JavaScript. With `prefers-reduced-motion`, smooth scrolling, reveals, parallax, magnetic buttons and the pinned sequence are all switched off.
- **Upcoming vs past events** are worked out from the current date and refreshed every hour, so the page stays static.

## Before launch

Fill these in `src/content/series.ts` (run `npm run placeholders` to see what is left):

- [ ] `site.url`: the live address, used for link previews, the sitemap and calendar files
- [ ] `site.firstEventLabel`: the month and year of the first evening, shown in the hero until an event has a date
- [ ] `site.organizer.bio`: one line about the organizer
- [ ] `site.contactEmail` and `site.speakerEmail`
- [ ] `site.social`: real links, or `""` to hide one
- [ ] `site.signup.formspreeFormId`: from your Formspree form
- [ ] The first event: `title`, `topic`, `summary`, `start`, `doorsOpen`, `venue`, `speakerId`, `rsvpUrl`
- [ ] Speakers: add each one with `confirmed: true` only after they agree

Also review the wording that makes a promise on your behalf: the privacy line under the signup form ("about once a month"), the FAQ answers, and the researcher terms ("We find it, book it and set it up", "We handle promotion, RSVPs and the evening itself").

## Deploying a preview

Vercel builds this as a standard Next.js app. No environment variables are needed.

**From your machine (simplest, preview only):**

```bash
npx vercel@latest login
npx vercel@latest deploy
```

Run it from a checkout of this branch. `vercel deploy` without `--prod` creates a preview deployment and prints its URL. Nothing goes to production.

**From the Vercel dashboard (Git, deploys on every push):** Add New → Project → import `mpeng199/speakout`. Vercel treats the repository's default branch as production, so make `main` the default branch first if you only want previews from feature branches.

**From Claude:** the Claude Vercel connector needs permission to create projects. Reconnect it at claude.ai/customize/connectors and grant access to the whole team. The connector used in the first build session was refused with "You don't have permission to create a project".

After deploying, check the live URL with [PageSpeed Insights](https://pagespeed.web.dev/). Preview deployments may sit behind Vercel Authentication; turn that off for the preview, or share a protection-bypass link, if other people need to open it.
