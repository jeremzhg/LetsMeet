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
        type: SchemaType.ARRAY,
        description: "Array of evaluations for the provided corporations",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            corporationID: { type: SchemaType.STRING, description: "The ID of the evaluated corporation" },
            corporationEmail: { type: SchemaType.STRING, description: "The email of the evaluated corporation" },
            score: { type: SchemaType.NUMBER, description: "Compatibility score 0-100" },
            reasoning: { type: SchemaType.STRING, description: "Short explanation for the score. Maximum of 10 words" },
            reasoning_corp: { type: SchemaType.STRING, description: "Short explanation on what the corporation's likely perspective is. Maximum of 10 words" },
          },
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

  const chunkSize = 10;
  for (let i = 0; i < targetCorporations.length; i += chunkSize) {
    const chunk = targetCorporations.slice(i, i + chunkSize);
    console.log(`\nAnalyzing fit for chunk ${i / chunkSize + 1} (${chunk.length} corporations)...`);

    const corporationsText = chunk.map((corp: any) => {
      const pastEvents = corp.partners?.map((p: any) => p.event?.title) || [];
      return `
      ID: ${corp.id}
      Name: ${corp.name}
      EMAIL: ${corp.email}
      About: ${corp.details}
      Past Sponsorships: ${pastEvents.length > 0 ? pastEvents.join(", ") : "None"}
      `;
    }).join("\n---");

    const prompt = `
      You are a Partnership Matching Professional with 30 years of experience, an expert at evaluating brand-event synergy.
      Your goal is to determine if a Corporation is a strategic sponsor for an Event based on 
      audience alignment, industry relevance, and historical activity. No sugarcoating, be as direct as possible.
      Analyze the following details:

      EVENT:
      Title: ${event.title}
      Description: ${event.details}

      CORPORATIONS TO EVALUATE:
      ${corporationsText}

      Analysis Guidelines:
      1. Industry Fit: Does the event category align with the corporation's core business?
      2. Audience Overlap: Do the event details suggest an audience that matches the corporation's likely target market?
      3. Historical Precedent: Is this event similar to specific past sponsorships listed?
      
      Task:
      - Evaluate each corporation provided.
      - Assign a fit score (0-100). High score = specific industry alignment.
      - Low score = generic or irrelevant alignment.
      - Provide a 1-sentence reasoning for the corporation and organization. Maximum of 10 words.
      - Return an evaluation for every corporation provided with its corresponding corporationID and Email.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const jsonText = response.text();
      const evaluations = JSON.parse(jsonText);

      for (const evalResult of evaluations) {
        if (!evalResult.corporationID) continue;
        await upsertMatchScore(event.id, evalResult.corporationID, evalResult.score, evalResult.reasoning,evalResult.reasoning_corp);
      }
    } catch (error) {
      console.error(`Error processing chunk ${i / chunkSize + 1}:`, error);
    }
  }
}

export {matchingService};