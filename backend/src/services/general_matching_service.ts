import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { getAllCorpsWithPastEvents, getCorpWithPastEventsById } from "../repositories/prisma_corporation_repository";
import { getAllOrgsWithPastEvents, getOrgWithPastEventsById } from "../repositories/prisma_organization_repository";
import { upsertGeneralMatchScore } from "../repositories/prisma_matchscore_repository";

dotenv.config();

const MODEL_NAME = "gemini-2.5-flash"; 
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

type MatchEvaluation = {
  corporationID: string;
  organizationID: string;
  score: number;
  reasoning: string;
};

async function generalMatchingService(
  targetID: string,
  sourceType: "organization" | "corporation",
  counterpartID?: string
) {
  let baseOrganization: {
    id: string;
    name: string;
    details: string;
    events: { title: string; details: string }[];
  } | null = null;

  let targetCorporations: {
    id: string;
    name: string;
    email: string;
    details: string;
    category: string;
    partners: { event: { title: string; details: string } | null }[];
  }[] = [];

  if (sourceType === "organization") {
    const org = await getOrgWithPastEventsById(targetID);
    if (!org) {
      throw new Error("Organization not found");
    }

    baseOrganization = {
      id: org.id,
      name: org.name,
      details: org.details,
      events: org.events.map((event) => ({
        title: event.title,
        details: event.details,
      })),
    };

    if (counterpartID) {
      const corp = await getCorpWithPastEventsById(counterpartID);
      if (corp) {
        targetCorporations.push(corp);
      }
    } else {
      targetCorporations = await getAllCorpsWithPastEvents();
    }
  } else {
    const corp = await getCorpWithPastEventsById(targetID);
    if (!corp) {
      throw new Error("Corporation not found");
    }

    targetCorporations = [corp];

    if (counterpartID) {
      const org = await getOrgWithPastEventsById(counterpartID);
      if (!org) {
        throw new Error("Organization not found");
      }

      baseOrganization = {
        id: org.id,
        name: org.name,
        details: org.details,
        events: org.events.map((event) => ({
          title: event.title,
          details: event.details,
        })),
      };
    }
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        description: "Array of corporation-organization evaluations",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            corporationID: { type: SchemaType.STRING, description: "The ID of the evaluated corporation" },
            organizationID: { type: SchemaType.STRING, description: "The ID of the evaluated organization" },
            score: { type: SchemaType.NUMBER, description: "Compatibility score 0-100" },
            reasoning: { type: SchemaType.STRING, description: "Brief reason for match score, max 15 words" },
          },
        },
      },
    },
  });

  const chunkSize = 10;

  if (sourceType === "corporation" && !baseOrganization) {
    let targetOrganizations = await getAllOrgsWithPastEvents();
    if (counterpartID) {
      const specificOrg = await getOrgWithPastEventsById(counterpartID);
      targetOrganizations = specificOrg ? [specificOrg] : [];
    }

    for (const organization of targetOrganizations) {
      if (!organization) {
        continue;
      }

      const organizationPastEvents = organization.events
        .map((event) => `${event.title} (${event.details.slice(0, 140)})`)
        .join(", ");

      const corp = targetCorporations[0];
      const corporationPastEvents = (corp.partners || [])
        .map((partner) => partner.event?.title)
        .filter((eventTitle): eventTitle is string => Boolean(eventTitle))
        .join(", ");

      const prompt = `
        You are a sponsorship matching expert.
        Evaluate compatibility between this organization and this corporation.

        ORGANIZATION:
        ID: ${organization.id}
        Name: ${organization.name}
        Details: ${organization.details}
        Completed Events: ${organizationPastEvents || "None"}

        CORPORATION:
        ID: ${corp.id}
        Name: ${corp.name}
        Email: ${corp.email}
        Category: ${corp.category}
        Details: ${corp.details}
        Past Sponsorships: ${corporationPastEvents || "None"}

        Rules:
        - Return ONLY a JSON array with 1 object.
        - Use the exact IDs provided.
        - Score range: 0-100.
        - Include reasoning with maximum 15 words.
      `;

      const result = await model.generateContent(prompt);
      const evaluations = JSON.parse(result.response.text()) as MatchEvaluation[];

      for (const evaluation of evaluations) {
        if (!evaluation.corporationID || !evaluation.organizationID) {
          continue;
        }

        await upsertGeneralMatchScore(
          evaluation.corporationID,
          evaluation.organizationID,
          evaluation.score,
          evaluation.reasoning || "No reasoning provided"
        );
      }
    }

    return;
  }

  for (let i = 0; i < targetCorporations.length; i += chunkSize) {
    const chunk = targetCorporations.slice(i, i + chunkSize);
    console.log(`\nAnalyzing organization fit for chunk ${i / chunkSize + 1} (${chunk.length} corporations)...`);

    const corporationsText = chunk.map((corp) => {
      const pastEvents = corp.partners?.map((partner) => partner.event?.title).filter((eventTitle): eventTitle is string => Boolean(eventTitle)) || [];
      return `
      ID: ${corp.id}
      Name: ${corp.name}
      EMAIL: ${corp.email}
      Category: ${corp.category}
      About: ${corp.details}
      Past Sponsorships: ${pastEvents.length > 0 ? pastEvents.join(", ") : "None"}
      `;
    }).join("\n---");

    const prompt = `
      You are a Partnership Matching Professional with 30 years of experience.
      Your goal is to determine if a Corporation is a strategic partner for an Organization.
      Use organization details and corporation historical sponsorship profile.
      Analyze the following details:

      ORGANIZATION:
      ID: ${baseOrganization?.id}
      Name: ${baseOrganization?.name}
      Details: ${baseOrganization?.details}
      Completed Events: ${(baseOrganization?.events || []).map((event) => event.title).join(", ") || "None"}

      CORPORATIONS TO EVALUATE:
      ${corporationsText}

      Analysis Guidelines:
      1. Industry Fit: Does organization activity align with corporation category?
      2. Audience Overlap: Do org details imply audience match with corporation?
      3. Historical Precedent: Are org events similar to corp past sponsorships?
      
      Task:
      - Evaluate each corporation provided.
      - Assign a fit score (0-100).
      - Include a concise reasoning with maximum 15 words.
      - Return an evaluation for every corporation with corporationID and organizationID.
      - Return only a JSON array.
    `;

    try {
      const result = await model.generateContent(prompt);
      const evaluations = JSON.parse(result.response.text()) as MatchEvaluation[];

      for (const evaluation of evaluations) {
        if (!evaluation.corporationID || !evaluation.organizationID) {
          continue;
        }

        await upsertGeneralMatchScore(
          evaluation.corporationID,
          evaluation.organizationID,
          evaluation.score,
          evaluation.reasoning || "No reasoning provided"
        );
      }
    } catch (error) {
      console.error(`Error processing chunk ${i / chunkSize + 1}:`, error);
    }
  }
}

export { generalMatchingService };