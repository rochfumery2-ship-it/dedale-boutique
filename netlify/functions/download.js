const Stripe = require('stripe');
const { getStore } = require('@netlify/blobs');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
exports.handler = async (event) => {
  const sessionId = event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: 'Lien invalide.' };
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { statusCode: 403, body: 'Paiement non confirmé.' };
    }
    const store = getStore('produits');
    const pdf = await store.get('manuel-lucidite.pdf', { type: 'arrayBuffer' });
    if (!pdf) {
      return { statusCode: 404, body: 'Fichier introuvable.' };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Le-Manuel-de-la-Lucidite.pdf"',
      },
      body: Buffer.from(pdf).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Erreur technique.' };
  }
};
