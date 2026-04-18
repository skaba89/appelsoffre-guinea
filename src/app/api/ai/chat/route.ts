import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `Tu es l'assistant IA de TenderFlow Guinea, une plateforme SaaS de veille intelligente des appels d'offres publics et privés en Guinée.

Ton rôle :
- Aider les utilisateurs à analyser les appels d'offres
- Fournir des recommandations GO/NO-GO basées sur les critères d'éligibilité
- Aider à la rédaction des réponses aux appels d'offres
- Analyser les cahiers des charges et identifier les risques
- Suggérer des stratégies de soumission
- Répondre aux questions sur le marché des appels d'offres en Guinée

Contexte entreprise :
- Secteurs surveillés : BTP, IT & Digital, Mines, Santé, Éducation, Transport
- Régions : Conakry, Kankan, Nzérékoré, Kindia, Boké, Labé, Faranah, Mamou
- L'utilisateur est un administrateur tenant (Mamadou Diallo)

Données actuelles :
- 147 appels d'offres actifs
- Taux de réussite : 68%
- 23 opportunités GO en cours
- Pipeline : 2.4M GNF

${context ? `Contexte additionnel : ${context}` : ""}

Réponds toujours en français, de manière professionnelle et concise. Si tu ne connais pas quelque chose, dis-le honnêtement.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse. Veuillez réessayer.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
