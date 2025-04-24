// lib/ragUtils.ts
import { readFileSync } from 'fs';
import path from 'path';

interface DadJoke {
  id: number;
  joke: string;
}

// Cache jokes to avoid re-reading from disk
let jokesCache: DadJoke[] = [];

/**
 * Load dad jokes from the JSON file
 * Only reads from disk once, subsequent calls use the cache
 */
const loadJokes = (): DadJoke[] => {
  // Return cached jokes if available
  if (jokesCache.length > 0) {
    return jokesCache;
  }
  
  try {
    console.time('Loading jokes from file');
    const filePath = path.join(process.cwd(), 'data', 'dadjokes.json');
    const fileContent = readFileSync(filePath, 'utf8');
    jokesCache = JSON.parse(fileContent);
    console.timeEnd('Loading jokes from file');
    console.log(`Loaded ${jokesCache.length} jokes from file`);
    return jokesCache;
  } catch (error) {
    console.error('Error loading dad jokes:', error);
    return [];
  }
};

/**
 * Calculate similarity between two texts based on shared words
 * Gives higher weight to longer words and considers word position
 */
const calculateSimilarity = (query: string, jokeText: string): number => {
  const q = query.toLowerCase();
  const j = jokeText.toLowerCase();
  
  // Split into words and remove common words shorter than 4 characters
  const qWords = q.split(/\s+/).filter(word => word.length >= 4);
  const jWords = j.split(/\s+/);
  
  let score = 0;
  
  // Simple presence check
  for (const word of qWords) {
    if (j.includes(word)) {
      // Give more weight to longer words
      score += Math.min(1, word.length / 5);
    }
  }
  
  // Check for topic similarity (does the joke contain similar concepts?)
  const topics = ['work', 'food', 'animal', 'sport', 'school', 'music', 
                 'doctor', 'dog', 'cat', 'fish', 'time', 'money', 'math'];
  
  for (const topic of topics) {
    if (q.includes(topic) && j.includes(topic)) {
      score += 1; // Bonus for matching topics
    }
  }
  
  // Normalize to a 0-1 range
  return Math.min(1, score / Math.max(1, qWords.length));
};

/**
 * Find jokes relevant to the query
 */
export const retrieveRelevantJokes = (query: string, count: number = 3): DadJoke[] => {
  console.time('Joke retrieval');
  const jokes = loadJokes();
  
  // Skip processing if no jokes available
  if (jokes.length === 0) {
    console.timeEnd('Joke retrieval');
    return [];
  }
  
  // Calculate similarity scores
  const scoredJokes = jokes.map(joke => ({
    ...joke,
    score: calculateSimilarity(query, joke.joke)
  }));
  
  // Sort by score (highest first) and take top results
  const results = scoredJokes
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .filter(joke => joke.score > 0.1) // Only include jokes with some relevance
    .map(({ id, joke }) => ({ id, joke }));
  
  console.timeEnd('Joke retrieval');
  console.log(`Found ${results.length} relevant jokes for query: "${query}"`);
  
  // Log the results for debugging
  if (results.length > 0) {
    console.log('Top joke matches:');
    results.forEach((joke, i) => {
      console.log(`${i+1}. "${joke.joke}" (id: ${joke.id})`);
    });
  }
  
  return results;
};

/**
 * Direct joke retrieval - returns a single joke that matches the query
 */
export const getRandomRelevantJoke = (query: string): string | null => {
  const jokes = retrieveRelevantJokes(query, 3);
  
  if (jokes.length === 0) {
    return null;
  }
  
  // Pick a random joke from the top matches
  const selectedJoke = jokes[Math.floor(Math.random() * jokes.length)];
  return selectedJoke.joke;
};

/**
 * Determine if a query is explicitly asking for a joke
 */
export const isJokeRequest = (query: string): boolean => {
  const jokeIndicators = [
    'joke', 'funny', 'laugh', 'humor', 'pun', 'dad joke',
    'tell me a joke', 'another joke', 'more jokes'
  ];
  
  const negativeIndicators = ['don\'t', 'dont', 'not', 'no joke'];
  
  const q = query.toLowerCase();
  
  // Check if any negative indicators are present
  for (const neg of negativeIndicators) {
    if (q.includes(neg)) {
      return false;
    }
  }
  
  // Check if any joke indicators are present
  for (const indicator of jokeIndicators) {
    if (q.includes(indicator)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Enhance a prompt with relevant jokes
 */
export const enhancePromptWithJokes = (prompt: string): string => {
  // Don't modify the prompt if it's not joke-related
  if (!isJokeRequest(prompt)) {
    return prompt;
  }
  
  const relevantJokes = retrieveRelevantJokes(prompt);
  
  if (relevantJokes.length === 0) {
    return prompt;
  }
  
  // Format jokes for inclusion in the prompt
  const jokesText = relevantJokes
    .map(joke => `- "${joke.joke}"`)
    .join('\n');
  
  // Create an instruction that explicitly tells the model to use one of these jokes
  return `${prompt}\n Choose one of these dad jokes from below to respond. Do not make up a new joke, repond in a very funny way.\n${jokesText}`;
};

/**
 * Direct joke response - bypasses the LLM for simple joke requests
 * Returns null if this isn't a simple joke request or if no jokes match
 */
export const getDirectJokeResponse = (prompt: string): string | null => {
  // Only use direct response for very clear joke requests
  const directJokePatterns = [
    /^(tell|give) me a joke$/i,
    /^another( joke)?$/i,
    /^(one|1) more( joke)?$/i,
    /^joke$/i,
    /^dad joke$/i
  ];
  
  const isDirectRequest = directJokePatterns.some(pattern => pattern.test(prompt.trim()));
  
  if (!isDirectRequest) {
    return null;
  }
  
  const joke = getRandomRelevantJoke(prompt);
  
  if (!joke) {
    return null;
  }
  
  return `Here's a dad joke for you: ${joke}`;
};

// Initialize the jokes cache on module load
loadJokes();