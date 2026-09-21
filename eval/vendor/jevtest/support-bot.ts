/**
 * Two deterministic support bots, built from templates and keyword routing.
 * No model is involved in producing these replies. `politeBot` is the behaviour
 * we want; `sloppyBot` is a regression that a keyword assertion would miss.
 */

export type Topic = "billing" | "delivery" | "cancellation" | "password" | "feature" | "other";

export interface CustomerMessage {
  id: string;
  topic: Topic;
  text: string;
}

/** Realistic inbound messages, one per topic the bots route on. */
export const customerMessages: CustomerMessage[] = [
  {
    id: "double-charge",
    topic: "billing",
    text: "You charged my card twice for the same order this morning. I want the second charge back.",
  },
  {
    id: "late-delivery",
    topic: "delivery",
    text: "My package was supposed to arrive on Tuesday and the tracking has not moved since Sunday.",
  },
  {
    id: "angry-cancellation",
    topic: "cancellation",
    text: "This is the third time I am writing. Cancel my subscription right now, I am done with you.",
  },
  {
    id: "password-reset",
    topic: "password",
    text: "The password reset email never arrives. I have checked spam. How do I get back into my account?",
  },
  {
    id: "feature-request",
    topic: "feature",
    text: "Could you add CSV export to the reports page? We rebuild it by hand every month.",
  },
];

// Order matters: the first pattern that matches wins.
/** The text of a message by id. Throws on an unknown id, so tests fail loudly. */
export function messageText(id: string): string {
  const message = customerMessages.find((candidate) => candidate.id === id);
  if (message === undefined) throw new Error(`Unknown customer message: ${id}`);
  return message.text;
}

const KEYWORDS: Array<[Topic, RegExp]> = [
  ["billing", /charg|refund|invoice|billed|payment|credit card/i],
  ["cancellation", /cancel|unsubscribe|terminate|close my account/i],
  ["password", /password|log ?in|sign ?in|locked out|account access/i],
  ["delivery", /deliver|package|shipping|tracking|parcel|arrive/i],
  ["feature", /\badd\b|feature|export|support for|would be great/i],
];

/** Pick a topic from the message text. Pure string matching, no model. */
export function classify(message: string): Topic {
  for (const [topic, pattern] of KEYWORDS) {
    if (pattern.test(message)) return topic;
  }
  return "other";
}

const POLITE: Record<Topic, string> = {
  billing:
    "I am sorry about the double charge, that should not have happened. I cannot issue a refund from this channel, " +
    "but I have opened ticket #4821 and our billing team will contact you within 24 hours with the outcome.",
  delivery:
    "I am sorry your package is late, waiting without an update is frustrating. The carrier has not scanned it since Sunday, " +
    "so I have filed a trace request. You will get an email with the carrier's answer within two business days.",
  cancellation:
    "I am sorry you have had to write three times, that is on us. I have escalated your cancellation to an agent who can " +
    "close the subscription today, and you will get a written confirmation by email once it is done.",
  password:
    "I am sorry the reset email is not reaching you. Our logs show it was sent to the address on file, so it may be blocked " +
    "upstream. I have requested a one-time sign-in link from a second domain; it should arrive within 15 minutes.",
  feature:
    "Thank you for the suggestion, rebuilding the report by hand every month sounds tedious. CSV export is not available today. " +
    "I have added your request to the reports backlog under REP-219 and you will be notified if it is scheduled.",
  other:
    "Thank you for writing in, and I am sorry for the trouble. I do not have enough detail to resolve this yet. " +
    "I have created ticket #4822 and an agent will follow up with questions within one business day.",
};

const SLOPPY: Record<Topic, string> = {
  billing:
    "No problem, I will refund the second charge for you right away. It should be back on your card shortly.",
  delivery:
    "The tracking looks fine on our side. You probably entered the wrong address at checkout, which is why it is stuck. " +
    "I will refund the shipping fee.",
  cancellation:
    "There is no record of your two earlier emails, so they were probably never sent. Anyway, cancelled. " +
    "I will also refund your last three invoices.",
  password:
    "The reset email definitely went out. Check your spam folder again, and make sure you typed your address correctly this time.",
  feature:
    "Sure, CSV export will be in the next release. I will refund this month's invoice for the inconvenience.",
  other: "Not sure what you mean. Send more details and someone will maybe get back to you.",
};

/** The behaviour we want: apologizes, never promises a refund, always gives a next step. */
export function politeBot(message: string): string {
  return POLITE[classify(message)];
}

/** The regression: promises refunds, blames the customer, offers no next step. */
export function sloppyBot(message: string): string {
  return SLOPPY[classify(message)];
}

export type Bot = (message: string) => string;
