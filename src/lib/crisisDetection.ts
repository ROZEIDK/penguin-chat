// Crisis keywords that trigger the bot intervention
const CRISIS_KEYWORDS = [
  'kill myself',
  'suicide',
  'suicidal',
  'end my life',
  'want to die',
  'better off dead',
  'harm myself',
  'hurt myself',
  'self harm',
  'self-harm',
  'cut myself',
  'overdose',
  'no reason to live',
  'nothing to live for',
  'can\'t go on',
  'give up on life',
];

export const detectCrisisContent = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

export const CRISIS_BOT_USERNAME = 'Crisis Support Bot 🆘';
