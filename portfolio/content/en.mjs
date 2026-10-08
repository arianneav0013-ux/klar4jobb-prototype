// English copy. Keep the structure identical to no.mjs.

export default {
  lang: "en",
  htmlLang: "en",
  hreflang: "en",
  name: "Arianne A. Villaluna",

  nav: {
    home: "Home",
    services: "Services",
    work: "Work",
    about: "About",
    beyond: "Beyond work",
    contact: "Contact",
    "secret-identity": "Secret identity",
  },

  ui: {
    book: "Hire me",
    getToKnow: "Get to know me",
    askMe: "Ask me anything",
    skip: "Skip to content",
    menu: "Menu",
    language: "Language",
    mainNav: "Main",
    footerNote: "Engineer and operations consultant · Oslo, Norway",
    seeServices: "See services",
    seeWork: "See the work",
    readCase: "Read the case",
    allWork: "All case studies",
    moreAboutMe: "My story",
    beyondLink: "Beyond work",
    downloadCv: "Download CV (PDF)",
    requestCv: "Request my CV",
  },

  cta: {
    title: "Let’s work together.",
    text: "Hiring for a role, or stuck where sales, data and delivery meet? Tell me about it. Or just say hi.",
    secondary: "Ask me anything",
  },

  home: {
    title: "Arianne A. Villaluna — Engineer & operations consultant",
    description:
      "Engineer and operations consultant with 7+ years at Huawei and 3M. I help teams fix the space between sales, product data and delivery.",
    hero: {
      eyebrow: "Hi, I’m Arianne <span class=\"wave\" aria-hidden=\"true\">👋</span>",
      h1: "I think in systems.",
      lead:
        "I’m an engineer who connects customers, technical teams and business processes. Seven years at Huawei and 3M taught me where handovers get lost, and how to fix them. Now I’m in Oslo, ready for the next team.",
    },
    stats: [
      { value: "7+", label: "years in operations at Huawei and 3M" },
      { value: "$15M", label: "largest pre-sales-to-delivery project handled" },
      { value: "100%", label: "data integrity across 10,000+ product attributes" },
    ],
    ask: {
      eyebrow: "Ask about me",
      title: "Got a question? Ask away.",
      text: "My assistant knows my experience, my work and a little about life outside it. Ask it anything you’d ask me over coffee.",
      greeting: "Hi! I’m Arianne’s assistant. Ask me about her experience, how she could help your team, or what she’s like outside work.",
      suggestions: [
        "What does Arianne do?",
        "What did she achieve at Huawei?",
        "Can I hire her for my team?",
        "What is she like outside work?",
      ],
      suggestionsLabel: "Suggested questions",
      logLabel: "Conversation",
      inputLabel: "Your question",
      placeholder: "Ask a question about Arianne…",
      send: "Ask",
      thinking: "Thinking…",
      error: "Sorry, I couldn’t answer just now. Please try again, or ask Arianne directly via Secret identity.",
      limit: "That’s a lot of questions! Please take a short break, or ask Arianne directly via Secret identity.",
      note: "AI answers, powered by GPT-6 Luna via Vercel AI Gateway. They can make mistakes, so for anything important <a href=\"{secret}\">ask me directly</a>.",
      noscript: "The assistant needs JavaScript. You can still ask me directly on the Secret identity page.",
    },
    fix: {
      eyebrow: "What I fix",
      title: "The space between sales, product data and delivery.",
      text:
        "Most operational pain lives in the handover: a quote that doesn’t match the order, a catalogue that drifts by market, a new hire who learns by guessing. That’s where I work.",
      items: [
        {
          title: "Sales-to-delivery process design",
          text: "Quote-to-order and order-to-delivery workflows that hold up under pressure.",
        },
        {
          title: "Product data & digital operations",
          text: "PIM/DAM setup, governance and catalogue quality across B2B and B2C channels.",
        },
        {
          title: "Process improvement & onboarding",
          text: "Faster onboarding, clear documentation and team workflows that stick.",
        },
      ],
    },
    work: {
      eyebrow: "Selected work",
      title: "Proof, at scale.",
    },
    strip: {
      label: "Experience",
      items: ["Huawei", "3M", "University of Oslo (MSc, 2026–2028)"],
    },
    personal: {
      title: "Get to know me",
      facts: [
        { emoji: "📍", label: "Based in", value: "Oslo, Norway" },
        { emoji: "🇵🇭", label: "From", value: "The Philippines" },
        { emoji: "⚙️", label: "By training", value: "Electronics engineer" },
        { emoji: "🎤", label: "At heart", value: "An event person" },
        { emoji: "🗣️", label: "Currently learning", value: "Norwegian (B1 → B2)" },
        { emoji: "🌲", label: "On Sundays", value: "Søndagstur, always" },
      ],
    },
  },

  services: {
    title: "Services — Arianne A. Villaluna",
    description:
      "Consulting for SMBs, scale-ups and startups: sales-to-delivery process design, product data and digital operations, onboarding, and early-stage venture support.",
    hero: {
      eyebrow: "Ways to work with me",
      h1: "Clarity where handovers get lost.",
      lead:
        "As a consultant, in a part-time role or on your team: here’s what I bring. Each area comes straight from work I’ve delivered at scale.",
    },
    proofLabel: "Proof",
    items: [
      {
        title: "Sales-to-delivery process design",
        text: "From the first quote to the delivered order, without things falling through the cracks.",
        bullets: [
          "Quote-to-order and order-to-delivery workflows",
          "BOQ/BOM configuration",
          "Handover within SLA",
          "CRM/CPQ hygiene",
        ],
        proof: "<strong>Huawei:</strong> projects up to USD 15M.",
      },
      {
        title: "Product data & digital operations",
        text: "A catalogue your customers and sales team can trust, in every market and channel.",
        bullets: [
          "PIM/DAM setup and governance",
          "Catalogue quality",
          "B2B and B2C publishing",
        ],
        proof: "<strong>3M:</strong> 100% data integrity across 10,000+ attributes.",
      },
      {
        title: "Process improvement & onboarding",
        text: "Shorter ramp-up for new people, and workflows that don’t live in one person’s head.",
        bullets: [
          "Onboarding design",
          "Documentation people actually use",
          "Team workflows",
        ],
        proof:
          "<strong>3M:</strong> a 1-hour onboarding meeting turned into a 15-minute guided video, plus a new-hire framework.",
      },
      {
        title: "Early-stage product & venture support",
        text: "Structure for founders who are moving from idea to first customers.",
        bullets: ["User research", "Prototyping", "Go-to-market structure"],
        proof: "<strong>Track record:</strong> goIT / TCS × Inno-Sci programme, Merita, UiO MSc.",
      },
      {
        title: "Events & community",
        tag: "Add-on",
        text: "Planning and running professional events and community programmes.",
        bullets: ["Professional events", "Community programmes"],
        proof: "<strong>Huawei & 3M:</strong> six years leading engagement teams.",
      },
    ],
    process: {
      eyebrow: "How an engagement works",
      title: "Four steps. No surprises.",
      steps: [
        {
          title: "Conversation",
          text: "A 30-minute call to understand where things get stuck and whether I’m the right fit.",
        },
        {
          title: "Map",
          text: "I walk through the process with the people who run it and pinpoint the handovers that break.",
        },
        {
          title: "Fix",
          text: "We design and put in place the changes together: workflows, data rules, templates, tooling.",
        },
        {
          title: "Hand over",
          text: "Documentation and training so the improvement keeps working after I step back.",
        },
      ],
    },
    fit: {
      title: "Who I work with",
      items: [
        "SMBs and scale-ups whose processes haven’t kept up with growth",
        "Startups that need operational structure before they scale",
        "Teams in the startup and incubator ecosystem around Oslo",
      ],
    },
  },

  work: {
    title: "Work — Arianne A. Villaluna",
    description:
      "Three case studies from Huawei and 3M: design-to-delivery at scale, multi-market product data, and a 15-minute onboarding.",
    hero: {
      eyebrow: "Selected work",
      h1: "Three problems, solved at scale.",
      lead: "Each case follows the same shape: the problem, how I approached it, and what changed.",
    },
    labels: { problem: "Problem", approach: "Approach", outcome: "Outcome" },
    cases: [
      {
        id: "design-to-delivery",
        tag: "Huawei · Telecom",
        title: "From design to delivery at scale",
        summary:
          "Turning high-level network designs into exact configurations and BOQs for rollouts of up to 300+ sites.",
        meta: "Product Configuration Engineer · Mar 2015 – Aug 2020",
        problem:
          "Nationwide network rollouts and modernisation projects start as high-level designs. Before anything ships, every site needs an exact configuration and bill of quantities, and every change has to flow through to contracts, orders and delivery. Errors at that stage turn into cost and delay in the field.",
        approach: [
          "Translated high-level designs into configurations and BOQs for 1 to 300+ sites per project",
          "Kept configurations and contracts aligned through around 80 contract amendments a year",
          "Coordinated order-to-delivery for two years (CCM-CC) so handovers met SLA",
          "Led a team of three and ran internal trainings",
        ],
        outcome:
          "Projects valued at USD 300K–8M configured and delivered, with pre-sales-to-delivery ownership up to USD 15M, and contributions to four winning multi-year bids.",
        figures: [
          { value: "300+", label: "sites in a single configuration" },
          { value: "~150", label: "configurations a year" },
          { value: "4", label: "winning multi-year bids" },
        ],
      },
      {
        id: "one-catalogue",
        tag: "3M · Product data",
        title: "One catalogue, many markets",
        summary:
          "Leading the Australia/New Zealand catalogue on 3M.com with 100% data integrity across 10,000+ attributes.",
        meta: "Digitization Senior Analyst · Aug 2020 – Aug 2022",
        problem:
          "A global product catalogue has to read correctly in every market, for business and consumer buyers alike. With thousands of attributes per project, small inconsistencies multiply fast and end up in front of customers.",
        approach: [
          "Led the AU/NZ catalogue on 3M.com",
          "Managed product data in GPIM (SAP Hybris) and assets in DAM (Celum, Adobe)",
          "Handled 200+ JIRA requests a year from teams across the business",
          "Applied consistent localisation and governance before publishing",
        ],
        outcome:
          "100% data integrity across 10,000+ attributes and 400+ SKUs per project, published to both B2B and B2C channels.",
        figures: [
          { value: "10,000+", label: "attributes per project" },
          { value: "400+", label: "SKUs per project" },
          { value: "200+", label: "requests handled a year" },
        ],
      },
      {
        id: "onboarding",
        tag: "3M · Process improvement",
        title: "Onboarding in 15 minutes",
        summary: "Turning a one-hour onboarding meeting into a 15-minute guided video and a new-hire framework.",
        meta: "Digitization Senior Analyst · 3M",
        problem:
          "Getting new team members up to speed relied on a one-hour live meeting. It took experienced people away from their work, and the result depended on who ran it.",
        approach: [
          "Replaced the live meeting with a 15-minute guided video",
          "Built a new-hire framework so every starter follows the same path",
          "Documented the underlying workflows",
          "Wrote a research paper on digital onboarding",
        ],
        outcome:
          "Onboarding time cut from one hour to 15 minutes. It was one of two process improvements I introduced at 3M that are still in use.",
        figures: [
          { value: "60 → 15", label: "minutes to onboard" },
          { value: "2", label: "process improvements still in use" },
        ],
      },
    ],
  },

  about: {
    title: "About — Arianne A. Villaluna",
    description:
      "Career story: from electronics engineering in the Philippines to Huawei, 3M, Norway and an MSc at the University of Oslo.",
    hero: {
      eyebrow: "About",
      h1: "Engineer by training. Systems thinker by habit.",
      lead:
        "I’ve spent more than seven years at the point where customers, technical teams and business processes meet: first in telecom at Huawei, then in digital product operations at 3M. Today I’m based in Oslo, studying entrepreneurship and innovation at UiO.",
    },
    portraitAlt: "Portrait of Arianne A. Villaluna",
    storyTitle: "The story so far",
    chapters: [
      {
        when: "Philippines",
        title: "Electronics & Communications Engineering",
        where: "Bachelor of Science",
        bullets: [
          "Recognised as equivalent to a Norwegian bachelor’s degree by HK-dir",
          "Organisation of the Year and Journalist of the Year awards",
          "Later returned as Guest Instructor: Fundamentals of Transport Solutions (2020)",
        ],
      },
      {
        when: "Mar 2015 – Aug 2020",
        title: "Huawei",
        where: "Product Configuration Engineer",
        bullets: [
          "Configurations and BOQs for 1–300+ sites, valued USD 300K–8M",
          "Pre-sales-to-delivery up to USD 15M",
          "~150 configurations and ~80 contract amendments a year",
          "Contributed to 4 winning multi-year bids",
          "2 years of order-to-delivery coordination (CCM-CC)",
          "Led a team of 3 and ran internal trainings",
        ],
      },
      {
        when: "Aug 2020 – Aug 2022",
        title: "3M",
        where: "Digitization Senior Analyst",
        bullets: [
          "AU/NZ catalogue lead on 3M.com",
          "GPIM (SAP Hybris) and DAM (Celum, Adobe)",
          "200+ JIRA requests a year",
          "100% data integrity, 10,000+ attributes, 400+ SKUs per project",
          "2 process improvements still in use",
          "GSC PH Digital Hackathon 2021: People’s Choice Award",
        ],
      },
      {
        when: "2022",
        title: "Norway",
        where: "A new chapter in Oslo",
        bullets: [
          "Relocated from the Philippines",
          "Master’s-level elective at OsloMet (grade A)",
          "Learning Norwegian, now at B1 and working toward B2",
        ],
      },
      {
        when: "2026 – 2028",
        title: "University of Oslo",
        where: "MSc Entrepreneurship & Innovation Management",
        bullets: ["Department of Informatics", "Focus on venture creation"],
      },
    ],
    credentials: {
      title: "Credentials",
      items: [
        "Salesforce Certified AI Associate",
        "3M Certified Scrum Team Member",
        "Asana Workflow Specialist",
        "CCNA Bootcamp",
        "English C1",
        "Norwegian B1 (working toward B2)",
      ],
    },
    words: {
      title: "In three words",
      items: ["Systems-minded", "Warm", "Reliable"],
    },
    cv: {
      title: "The full picture",
      text: "Prefer the classic format? My CV has every role, tool and date.",
    },
  },

  beyond: {
    title: "Beyond work — Arianne A. Villaluna",
    description:
      "Events, social media, layout design, entrepreneurship and the Norway journey: the other side of Arianne A. Villaluna.",
    hero: {
      eyebrow: "Beyond work · Utenfor jobben",
      h1: "The other side of the work.",
      lead:
        "Events, design, a startup and a move across the world. The same instincts show up here: bring people together and make things clear.",
    },
    blocks: [
      {
        emoji: "🎤",
        title: "Events",
        text: "I’ve been the person who makes the event happen for most of my career.",
        bullets: [
          "Chief Engagement Officer, Huawei (2016–2020)",
          "Engagement Team Lead, 3M (2020–2022)",
          "Volunteer: PMI Norway 25th Anniversary conference support, FEIT, Kalayaan Norge",
        ],
      },
      {
        emoji: "📱",
        title: "Social media",
        text: "Telling a community’s story, in posts, photos and video.",
        bullets: [
          "Social Media Manager, Kalayaan Norge",
          "Photo and video coverage with Abyss Creatives",
        ],
      },
      {
        emoji: "💡",
        title: "Entrepreneurship",
        text:
          "Merita is a product for immigrant job seekers in Norway, developed in the Insj UiO incubator. It grew out of Klar4Jobb, an earlier prototype of a job-readiness companion.",
        bullets: [],
      },
      {
        emoji: "🌲",
        title: "The Norway journey",
        text:
          "I moved from the Philippines to Norway in 2022. I’m learning Norwegian (B1, working toward B2), and Sunday means one thing: søndagstur.",
        bullets: [],
      },
    ],
    gallery: {
      title: "Layout & visual design",
      text: "Wedding layouts and presentation design. A small selection, because good structure is a design skill too.",
      placeholder: "Design sample coming soon",
      items: ["Wedding layout", "Wedding layout", "Presentation", "Presentation", "Event material", "Event material"],
    },
  },

  contact: {
    title: "Contact — Arianne A. Villaluna",
    description: "Book a conversation with Arianne A. Villaluna, or reach out by email or LinkedIn.",
    hero: {
      eyebrow: "Contact",
      h1: "Let’s work together.",
      lead: "Pick a time for a 30-minute chat. It’s usually enough to see whether I’m the right fit for your team or project.",
    },
    booking: {
      frameTitle: "Booking calendar",
      fallbackTitle: "Online booking is coming soon",
      fallbackText: "Until then, send me a short note about your challenge and I’ll suggest a few times.",
      fallbackButton: "Email to book",
    },
    details: {
      title: "Other ways to reach me",
      email: "Email",
      linkedin: "LinkedIn",
      cv: "CV",
      location: "Based in",
      locationValue: "Oslo, Norway",
      emailSubject: "Booking a conversation",
      cvSubject: "CV request",
    },
    signoff: "Er du nysgjerrig? La oss ta en prat.",
    signoffNote: "Curious? Let’s talk.",
  },
  secret: {
    title: "Secret identity — Arianne A. Villaluna",
    description:
      "By day, Arianne fixes handovers. Meet the rest of her, ask her anything, or start working together.",
    hero: {
      eyebrow: "Secret identity",
      h1: "By day, I fix handovers. Here’s the rest of me.",
      lead:
        "Behind the process maps and BOQs there’s an event organiser, a layout designer and a newcomer to Norway who loves a long Sunday walk. Say hello. I read every message myself.",
    },
    factsTitle: "Off the clock",
    facts: [
      { emoji: "🎤", title: "The event person", text: "Six years leading engagement teams at Huawei and 3M, and still volunteering at events around Oslo." },
      { emoji: "🎨", title: "The layout designer", text: "Wedding layouts and presentation design. I can’t leave a misaligned margin alone." },
      { emoji: "📸", title: "The storyteller", text: "Social media for Kalayaan Norge, plus photo and video coverage with Abyss Creatives." },
      { emoji: "💡", title: "The builder", text: "Working on Merita, a product for immigrant job seekers, in the Insj UiO incubator." },
      { emoji: "🇳🇴", title: "The newcomer", text: "From the Philippines to Oslo in 2022. Norwegian at B1 and climbing." },
      { emoji: "🌲", title: "The Sunday walker", text: "Søndagstur, every week, whatever the weather." },
    ],
    form: {
      eyebrow: "Ask me anything",
      title: "Curious? Let’s talk.",
      intro:
        "A question about my work, a role you’re hiring for, a project you want to start, or just a hello. I’ll reply within two working days.",
      name: "Your name",
      email: "Your email",
      topic: "What’s this about?",
      topics: ["Just curious", "I have a question", "Let’s work together", "I’m hiring for a role", "Something else"],
      message: "Your message",
      placeholder: "Tell me a little about what you have in mind…",
      privacy: "I only use your details to reply to you.",
      submit: "Send message",
      sending: "Sending…",
      sent: "Thank you! Your message is on its way. I’ll get back to you within two working days.",
      error: "Something went wrong. Please try again, or email me directly.",
      subject: "Hello from your website",
    },
  },
};
