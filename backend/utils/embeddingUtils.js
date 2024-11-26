const OpenAI = require('openai');
const cosineSimilarity = require('compute-cosine-similarity');
const tiktoken = require('@dqbd/tiktoken');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-large';
const GPT_MODEL = 'gpt-3.5-turbo';

// Generar embeddings para una consulta
async function getQueryEmbedding(query) {
  try {
    const response = await openai.embeddings.create({ 
      model: EMBEDDING_MODEL,
      input: query,
    });
    return response.data[0].embedding; // Ajustado al formato de la versión 4.x.x
  } catch (error) {
    console.error('Error al generar embeddings:', error.message);
    throw new Error('No se pudo generar el embedding.');
  }
}

// Calcular la similitud coseno
function calculateRelatedness(queryEmbedding, targetEmbedding) {
  if (queryEmbedding.length !== targetEmbedding.length) {
    throw new Error("Los embeddings deben tener la misma longitud.");
  }
  return 1 - cosineSimilarity(queryEmbedding, targetEmbedding);
}

// Clasificar cadenas según su similitud con la consulta
async function stringsRankedByRelatedness(query, data, topN = 10) {
  const start = Date.now();
  
  try {
    const queryEmbedding = await getQueryEmbedding(query); // Asume que tienes la función getQueryEmbedding implementada
    
    // Calcular la similitud coseno para cada texto en el dataset
    const stringsAndRelatednesses = data.map((row) => {
      const relatedness = calculateRelatedness(queryEmbedding, row.embedding);
      return { text: row.text, relatedness };
    });
    
    // Ordenar por similitud descendente
    stringsAndRelatednesses.sort((a, b) => b.relatedness - a.relatedness);
    
    // Extraer los textos y similitudes más relevantes
    const topResults = stringsAndRelatednesses.slice(0, topN);
    const texts = topResults.map((item) => item.text);
    const relatednesses = topResults.map((item) => item.relatedness);
    
    const end = Date.now();
    console.log(`Ranking strings by relatedness took ${(end - start) / 1000} seconds.`);
    
    return [ texts, relatednesses ];
  } catch (error) {
    console.error("Error al clasificar cadenas por similitud:", error.message);
    throw new Error("No se pudo clasificar las cadenas.");
  }
}

function numTokens(text, model=GPT_MODEL) {
  const start = Date.now();
  try {
    // Obtener el codificador para el modelo específico
    const encoding = tiktoken.encoding_for_model(model);
    
    // Codificar el texto y calcular la longitud
    const tokenCount = encoding.encode(text).length;
    
    const end = Date.now();
    console.log(`Token counting took ${(end - start) / 1000} seconds.`);
    
    return tokenCount;
  } catch (error) {
    console.error('Error al calcular el número de tokens:', error.message);
    throw new Error('No se pudo calcular el número de tokens.');
  }
}

// Crear mensaje para el modelo GPT
async function queryMessage(query, data, model, tokenBudget) {
  const start = Date.now();
  try {
    // Clasificar cadenas según su similitud con la consulta
    const rankedResults = await stringsRankedByRelatedness(query, data, 4);
    const strings = rankedResults.map(item => item.text);
    const relatednesses = rankedResults.map(item => item.relatedness);

    // Introducción y pregunta
    const introduction =
      'Utiliza los artículos y leyes que te proporciono para responder a las preguntas. Por favor, en la respuesta indica todos los números de ley o decreto relacionados que estás utilizando para responder, además de su nombre. Las leyes estarán separadas por temática.';
    const question = `\n\nQuestion: ${query}`;    
      
    let message = introduction;

    // Construir el mensaje iterando sobre los resultados relacionados
    for (let i = 0; i < strings.length; i++) {
      const nextArticle = `\n\nbase de conocimiento Abogado Virtual Experto:\n"""\n${strings[i]} Porcentaje de parentezco: ${relatednesses[i]}\n """`;

      // Verificar si el mensaje excede el límite de tokens
      if (numTokens(`${message}${nextArticle}${question}`, model) > tokenBudget) {
        break;
      } else {
        message += nextArticle;
      }
    }

    const end = Date.now();
    console.log(`Generating query message took ${(end - start) / 1000} seconds.`);
    return message + question;
  } catch (error) {
    console.error('Error en queryMessage:', error.message);
    throw new Error('No se pudo generar el mensaje para GPT.');
  }
}

// Interactuar con el modelo GPT
async function ask(query, data, typeParam, model=GPT_MODEL, tokenBudget = 4000) {
  try {
    const systemMessages = {
      '1': "Eres un experto en temas de familia, divorcios, pensiones alimenticias, demandas y temas relacionados dentro del sistema legal chileno. Debes responder como un abogado experto, siendo amable, y tus respuestas deben ser concisas, coherentes y cohesivas. No debes exceder las 60 palabras para responder.",
      '2': "Eres un experto en temas de trabajo, leyes laborales, código del trabajo, licencias, vacaciones y temas relacionados dentro del sistema legal chileno. Debes responder como un abogado experto, siendo amable, y tus respuestas deben ser concisas, coherentes y cohesivas. No debes exceder las 60 palabras para responder."
    };

    const systemMessage = systemMessages[typeParam] || 'Eres un abogado experto, pero no te indicaron la temática. Por favor, exige que te la indiquen para dar tu respuesta.';
    const message = await queryMessage(query, data, model, tokenBudget);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message },
      ],
    });

    return response.choices[0].message.content; // Formato actualizado de la respuesta
  } catch (error) {
    console.error('Error al interactuar con el modelo GPT:', error.message);
    throw new Error('No se pudo obtener la respuesta del modelo GPT.');
  }
}

module.exports = {
  getQueryEmbedding,
  ask,
};