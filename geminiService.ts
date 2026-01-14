
export interface EnglishQuestion {
  question: string;
  answer: string;
  hint: string;
  type: 'COLOR' | 'DIRECTION' | 'VOCAB';
  color?: string;
}

const QUESTION_BANK: EnglishQuestion[] = [
  { question: "What's this color?", answer: "Red", hint: "Like an apple", type: "COLOR", color: "#ef4444" },
  { question: "What's this color?", answer: "Blue", hint: "Like the sky", type: "COLOR", color: "#3b82f6" },
  { question: "What's this color?", answer: "Green", hint: "Like grass", type: "COLOR", color: "#22c55e" },
  { question: "What's this color?", answer: "Yellow", hint: "Like the sun", type: "COLOR", color: "#eab308" },
  { question: "What's this color?", answer: "Purple", hint: "Like grapes", type: "COLOR", color: "#a855f7" },
  { question: "What's this color?", answer: "Orange", hint: "Like an orange", type: "COLOR", color: "#f97316" },
  { question: "Where do you go to buy food?", answer: "Supermarket", hint: "It starts with S", type: "VOCAB" },
  { question: "Where do you go to mail a letter?", answer: "Post Office", hint: "You need a stamp", type: "VOCAB" },
  { question: "Where do you go to learn?", answer: "School", hint: "You see teachers here", type: "VOCAB" },
  { question: "Which way is this?", answer: "Left", hint: "Opposite of right", type: "DIRECTION" },
  { question: "Which way is this?", answer: "Right", hint: "Opposite of left", type: "DIRECTION" },
  { question: "Which way is this?", answer: "Straight", hint: "Keep going ahead", type: "DIRECTION" },
  { question: "Where do the police work?", answer: "Police Station", hint: "They keep us safe", type: "VOCAB" },
  { question: "Where do you play with friends?", answer: "Park", hint: "There are trees and slides", type: "VOCAB" },
  { question: "Where do the fire trucks stay?", answer: "Fire Station", hint: "It is a red building", type: "VOCAB" },
  { question: "What is 100 in Japanese currency?", answer: "100 Yen", hint: "You buy cheap things here", type: "VOCAB" }
];

export const generateEnglishQuestion = async (): Promise<EnglishQuestion> => {
  // Simulate a small delay for user experience consistency
  await new Promise(resolve => setTimeout(resolve, 500));
  const randomIndex = Math.floor(Math.random() * QUESTION_BANK.length);
  return QUESTION_BANK[randomIndex];
};
