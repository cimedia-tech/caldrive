import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentId, AGENT_CAPABILITIES } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function runAgent(agentId: AgentId, prompt: string, context?: string): Promise<string> {
  const capability = AGENT_CAPABILITIES.find(a => a.id === agentId);
  if (!capability) throw new Error(`Unknown agent: ${agentId}`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const systemPrompt = `You are ${capability.name}, an AI agent for CalDrive.
Role: ${capability.description}
Respond concisely and actionably. Use bullet points for lists. Be direct.`;

  const fullPrompt = context 
    ? `${systemPrompt}\n\nContext:\n${context}\n\nUser request: ${prompt}` 
    : `${systemPrompt}\n\nUser request: ${prompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Agent generation failed:', error);
    return "Error: Agent generation failed.";
  }
}
