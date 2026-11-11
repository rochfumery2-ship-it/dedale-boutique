const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sessionId = event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: 'Lien invalide.' };
  }

  try {
    // 1. On vérifie que le paiement est bien confirmé auprès de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { statusCode: 403, body: 'Paiement non confirmé.' };
    }

    // 2. On récupère le PDF directement depuis GitHub
    const pdfUrl = 'https://raw.githubusercontent.com/rochfumery2-ship-it/dedale-boutique/main/assets/manuel-lucidite.pdf';
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return { statusCode: 500, body: 'Fichier introuvable.' };
    }
    const arrayBuffer = await response.arrayBuffer();

    // 3. On renvoie le fichier au navigateur pour qu'il le télécharge
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Le-Manuel-de-la-Lucidite.pdf"',
        'Cache-Control': 'no-store',
      },
      body: Buffer.from(arrayBuffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Erreur technique.' };
  }
};
