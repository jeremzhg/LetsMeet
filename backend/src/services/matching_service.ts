import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { findEventById } from "../repositories/prisma_event_repository";
import { getAllCorpsWithPastEvents, getCorpWithPastEventsById } from "../repositories/prisma_corporation_repository";
import { upsertMatchScore } from "../repositories/prisma_matchscore_repository";

dotenv.config();

const MODEL_NAME = "gemini-2.5-flash"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function matchingService(eventID: string, corporationID?: string) {
  const event = await findEventById(eventID);
  if (!event) {
    throw new Error("Event not found");
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.NUMBER, description: "Compatibility score 0-100" },
          reasoning: { type: SchemaType.STRING, description: "Short explanation for the score. Maximum of 10 words" },
        },
      },
    },
  });

  let targetCorporations = [];
  if (corporationID) {
    const corp = await getCorpWithPastEventsById(corporationID);
    if (corp) targetCorporations.push(corp);
  } else {
    targetCorporations = await getAllCorpsWithPastEvents();
  }

  for (const corp of targetCorporations) {
    console.log(`\nAnalyzing fit for: ${corp.name}...`);

    const pastEvents = corp.partners.map((p: any) => p.event.title);

    const prompt = `
      You are a Partnership Matching Professional with 30 years of experience, an expert at evaluating brand-event synergy.
      Your goal is to determine if a Corporation is a strategic sponsor for an Event based on 
      audience alignment, industry relevance, and historical activity. No sugarcoating, be as direct as possible.
      Analyze the following details:

      EVENT:
      Title: ${event.title}
      Description: ${event.details}

      CORPORATION:
      Name: ${corp.name}
      About: ${corp.details}
      Past Sponsorships: ${pastEvents.length > 0 ? pastEvents.join(", ") : "None"}

      Analysis Guidelines:
      1. Industry Fit: Does the event category align with the corporation's core business?
      2. Audience Overlap: Do the event details suggest an audience that matches the corporation's likely target market?
      3. Historical Precedent: Is this event similar to specific past sponsorships listed?
      Task:
      - Assign a fit score (0-100). High score = specific industry alignment.
      - Low score = generic or irrelevant alignment.
      - Provide a 1-sentence reasoning. Maximum of 10 words.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const jsonText = response.text();
      const data = JSON.parse(jsonText);
      console.log(`Score: ${data.score}, Reasoning: ${data.reasoning}`);

      await upsertMatchScore(event.id, corp.id, data.score, data.reasoning);

    } catch (error) {
      console.error(`Error(${corp.name}):`, error);
    }
  }
}

export {matchingService};