const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Un petit mot de passe pour éviter que n'importe qui lance l'opération
  const secret = event.queryStringParameters.secret;
  if (secret !== 'DEDALE_UPLOAD_2024') {
    return { statusCode: 401, body: 'Non autorisé.' };
  }

  try {
    // On va chercher le PDF que vous venez de mettre sur GitHub
    const pdfUrl = 'https://raw.githubusercontent.com/rochfumery2-ship-it/dedale-boutique/main/assets/manuel-lucidite.pdf';
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return { statusCode: 500, body: 'Impossible de récupérer le PDF depuis GitHub.' };
    }
    const arrayBuffer = await response.arrayBuffer();

    // On le range dans le coffre-fort Blobs
    const store = getStore('produits');
    await store.set('manuel-lucidite.pdf', arrayBuffer, {
      metadata: { contentType: 'application/pdf' },
    });

    return { statusCode: 200, body: 'PDF uploadé avec succès dans Blobs.' };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Erreur lors de l\'upload.' };
  }
};
