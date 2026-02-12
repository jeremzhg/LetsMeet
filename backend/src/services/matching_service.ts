import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const MODEL_NAME = "gemini-2.5-flash"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function matchingService() {
  // TODO: real implementation once made, change this to fetch from db

  /*
  const event = await prisma.events.findUnique({ where: { eventID: '123' } });
  const corporations = await prisma.corporation.findMany({ include: { pastEvents: true } });
  */

  //mock data
  const event = {
    title: "BINUS AI Hackathon 2026",
    details: "A 48-hour coding competition focused on Generative AI and sustainability solutions. Seeking technical mentors and API sponsors. Estimated attendance: 300 students.",
    date: "2026-10-10"
  };

  const corporations = [
    {
      id: "corp_1",
      name: "Sigma Cloud",
      details: "Leading provider of cloud infrastructure and AI APIs for BINUS Students.",
      pastEvents: ["HackMIT 2024", "Global Game Jam"]
    },
    {
      id: "corp_2",
      name: "Geprek Binus",
      details: "Geprek Binus is a restaurant that sells geprek chicken. It is located in binus university",
      pastEvents: []
    }
  ];


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


  for (const corp of corporations) {
    console.log(`\nAnalyzing fit for: ${corp.name}...`);

    const prompt = `
      You are a Partnership Matching AI, an expert at evaluating brand-event synergy.
      Your goal is to determine if a Corporation is a strategic sponsor for an Event based on 
      audience alignment, industry relevance, and historical activity.
      Analyze the following details:

      EVENT:
      Title: ${event.title}
      Description: ${event.details}

      CORPORATION:
      Name: ${corp.name}
      About: ${corp.details}
      Past Sponsorships: ${corp.pastEvents.join(", ")}

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
      console.log(data)

      /*
      await prisma.matchScore.upsert({
        where: { eventID_corporationID: { eventID: event.id, corporationID: corp.id }},
        update: { score: data.score, aiReasoning: data.reasoning },
        create: { ... }
      });
      */

    } catch (error) {
      console.error(`Error(${corp.name}):`, error);
    }
  }
}

// export const 
matchingService();