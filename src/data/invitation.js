/**
 * INVITATION DATA
 * -------------------------------------------------------------------------
 * The couple's content, separated from presentation. A template decides how
 * this looks and which animations play; this file is just the information a
 * couple would supply through a form.
 *
 * Swap these values (or load them from an API/form) to produce a different
 * invitation without touching any component.
 *
 * @type {import('../types.js').InvitationData}
 */
import { formatLong, formatShort, formatTime } from "./dateFormat.js";

export const invitation = {
  couple: "Karen & Bert",
  firstNames: ["Karen", "Bert"],
  sealMonogram: "K&B",
  tagline: "are getting married",

  // Photo revealed under the scratch medallion ("" => placeholder).
  photo: "",

  // ---- THE DATE — edit this ONE value; everything else is derived ----
  dateISO: "2027-04-17T16:00:00",
  // `date`, `dateShort` and `time` are computed from dateISO so they can never
  // drift out of sync. Consumers still read event.date / .dateShort / .time.
  get date() {
    return formatLong(this.dateISO);
  },
  get dateShort() {
    return formatShort(this.dateISO);
  },
  get time() {
    return formatTime(this.dateISO);
  },

  // Venue
  venue: "Richmonde Hotel Iloilo",
  venueCity: "Iloilo City",
  address:
    "Megaworld Boulevard corner Enterprise Road Iloilo Business Park, Mandurriao, Iloilo City, 5000 Iloilo",
  mapUrl:
    "https://www.google.com/maps/dir//Richmonde+Hotel+Iloilo,+Megaworld+Boulevard+corner+Enterprise+Road+Iloilo+Business+Park,+Mandurriao,+Iloilo+City,+5000+Iloilo/@14.3528379,120.9761594,15z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x33aee5311ee34add:0xe7d6865d4a149d89!2m2!1d122.5456848!2d10.7154283?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D",

  story: [
    {
      year: "2018",
      title: "How we met",
      text: "A rainy afternoon, one shared umbrella, and a coffee shop that was about to close. We talked until they turned the lights off.",
    },
    {
      year: "2021",
      title: "The adventure",
      text: "We packed two backpacks and spent a summer chasing sunsets across the coast. Somewhere along the way, home stopped being a place and became a person.",
    },
    {
      year: "2025",
      title: "The proposal",
      text: "Back where it all began, under the same old awning, Bert got down on one knee. It was still raining. Karen still said yes.",
    },
  ],

  // `icon` is a key into the icon map (see components/icons.js); `accent` is
  // the marker color. Both are plain strings so the data stays serializable.
  timeline: [
    {
      time: "3:30 PM",
      title: "Guests Arrive",
      text: "Find your seat in the garden as the strings play.",
      icon: "users",
      accent: "#c98a86",
    },
    {
      time: "4:00 PM",
      title: "Ceremony",
      text: "The moment we have been waiting for.",
      icon: "rings",
      accent: "#a9625d",
    },
    {
      time: "4:45 PM",
      title: "Cocktail Hour",
      text: "Signature drinks and golden-hour photos.",
      icon: "cocktail",
      accent: "#c9a86a",
    },
    {
      time: "6:00 PM",
      title: "Reception & Dinner",
      text: "A seated dinner under the string lights.",
      icon: "dinner",
      accent: "#8a9a7b",
    },
    {
      time: "8:00 PM",
      title: "First Dance",
      text: "Followed by dancing until late.",
      icon: "music",
      accent: "#b07ca0",
    },
    {
      time: "11:00 PM",
      title: "Send-Off",
      text: "A sparkler farewell to end the night.",
      icon: "sparkles",
      accent: "#c9a86a",
    },
  ],

  dressCode: {
    title: "Garden Formal",
    text: "Think soft linens, flowing dresses, and earthy tones. The ceremony is on grass, so we gently suggest block heels or flats.",
    palette: ["#c98a86", "#dcc7a0", "#8a9a7b", "#e7d2ce", "#a9625d"],
  },
};
