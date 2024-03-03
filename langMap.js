const FRENCH_TRANSLATION_TRIGGER_TEXT = ` Un jour, sa mère ayant fait et cuit des galettes, lui dit:
--Va voir comment se porte ta mère-grand; car on m'a dit qu'elle était malade. Porte-lui une galette
et ce petit pot de beurre. Le Petit Chaperon Rouge partit aussitôt pour aller chez sa mère-grand, qui demeurait dans un autre
village. En passant dans un bois, elle rencontra compère le Loup, qui eut bien envie de la manger; mais il
n'osa, à cause de quelques bûcherons qui étaient dans la forêt.`;

const GERMAN_TRANSLATION_TRIGGER_TEXT = `Damit ging es nun aber so zu. Ich war damals, neben meinem Amt
als Arzt der Irrenanstalt, auch noch auf Praxis in der Stadt angewiesen. Nun ist es ein eigen Ding um den 
Verkehr des Arztes mit Kindern von drei bis sechs Jahren. In gesunden Tagen wird der Arzt und der 
Schornsteinfeger gar oft als Erziehungsmittel gebraucht: »Kind, wenn du nicht brav bist, kommt der 
Schornsteinfeger und holt dich!`;

const LANGUAGE_MAP = {
    fr: { name: "French", nativeName: "français", abbr: "fr", testWord: "dictionnaire", translationTriggerText: FRENCH_TRANSLATION_TRIGGER_TEXT, langVoiceIds: ["fr-FR", "fr_FR"], prefferedVoices: ['Microsoft Henri Online (Natural) - French (France)', 'Microsoft Paul - French (France)'] },
    de: { name: "German", nativeName: "Deutsch", abbr: "de", testWord: "wörterbuch", translationTriggerText: GERMAN_TRANSLATION_TRIGGER_TEXT, langVoiceIds: ["de-DE", "de_DE"], prefferedVoices: ['Microsoft Stefan - German (Germany)'] },
};