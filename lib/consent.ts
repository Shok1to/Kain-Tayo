// The exact consent wording the visitor sees.
// Every time this text changes, change WORDING_VERSION too, so each saved
// consent can be matched to the text the person actually saw.
// Replace each [bracket] with the owner's details before launch.

export const WORDING_VERSION = "2026-11-draft-2";

export const CONSENT_TEXT = {
  privacyBeforeLink:
    "I agree that [Company Name] may collect, use and store the personal and business information I enter in this form in order to [purpose, e.g. set up my signup and contact me about it]. I have read the ",
  privacyLinkText: "Privacy Policy",
  privacyAfterLink: ".",
  emailLabel:
    "Yes, I would like to receive emails from [Company Name] about [types of messages, e.g. news, offers and updates].",
  senderLine:
    "Sent by [Company Name], [mailing address], [phone number or website]. You can withdraw your consent at any time by using the unsubscribe link in any email or by contacting [privacy email]. ",
  howWeUseBeforeLink: "Read ",
  howWeUseLinkText: "how we use your information",
  howWeUseAfterLink: ".",
} as const;
