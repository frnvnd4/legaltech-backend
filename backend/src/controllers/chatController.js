const Chat = require('../models/Chat');
const path = require('path');
const fs = require('fs');
const { ask } = require('../../utils/embeddingUtils');
const readline = require('readline');

async function loadJSONL(filepath) {
  const data = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity, // Soporte para diferentes saltos de línea
  });

  for await (const line of rl) {
    try {
      data.push(JSON.parse(line)); // Parsear y agregar cada línea
    } catch (error) {
      console.error(`Error al parsear línea: ${line}`, error.message);
    }
  }

  return data; // Devolver todos los objetos JSON en un array
}

// Obtener el chat de un ticket
exports.getChatByTicketId = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const chat = await Chat.findOne({ ticket_id: ticketId });

    if (!chat) {
      return res.status(404).json({ message: 'Historial no encontrado para este ticket' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
  } 
};

exports.askLegalBot = async (req, res) => {
  const query = req.body.query || req.query.query; // Soporta query desde body o query params
  const type = req.body.type || req.query.type; // Soporta type desde body o query params
  const userId = req.user?.userId; // Usuario autenticado (opcional para pruebas)
  const chat_id = req.body.chat_id || req.query.chat_id || null

  if (!query || !type) {
    const missingParam = !query ? 'query' : 'type';
    return res.status(400).json({ error: `Parámetros incompletos: faltó ${missingParam}` });
  }

  try {
    // Rutas de archivos de embeddings
    const embeddingsFiles = {
      '1': path.join(__dirname, '../../embeddings', 'Embeddings_familia.json'),
      '2': path.join(__dirname, '../../embeddings', 'Embeddings_trabajo.json'),
    };

    if (!embeddingsFiles[type]) {
      return res.status(400).json({ error: `Tipo inválido: ${type}` });
    }

    // Verificar si existe el archivo de embeddings
    const embeddingsPath = embeddingsFiles[type];
    if (!fs.existsSync(embeddingsPath)) {
      return res.status(500).json({ error: 'El archivo de embeddings no se encontró en la ruta especificada.' });
    }

    // Cargar datos de embeddings
    const embeddingsData = await loadJSONL(embeddingsPath); //AQUI INTEGRA EL JSONL

    // Buscar o crear el historial del chat
    let chat = await Chat.findById(chat_id);

    if (!chat && userId) {
      // Crear un nuevo chat solo si el usuario está autenticado
      chat = new Chat({
        user_id: userId,
        messages: [],
      });
    }

    try {
      // Obtener la respuesta del chatbot
      const response = await ask(query, embeddingsData, type);

      if (chat) {
        // Si existe un historial del chat, agregar los mensajes
        chat.messages.push(
          { sender: 'user', content: query, timestamp: new Date() },
          { sender: 'bot', content: response, timestamp: new Date() }
        );
        await chat.save(); // Guardar el historial actualizado
      }

      res.status(200).json({ response, chat: chat || 'Historial no guardado porque el usuario no está autenticado.' });
    } catch (askError) {
      console.error('Error en la función ask:', askError);

      // Manejo específico de errores en la función `ask`
      if (askError.response) {
        return res.status(askError.response.status).json({
          error: 'Error al comunicarse con la API de OpenAI',
          details: askError.response.data?.message || 'Error desconocido en la API',
        });
      }

      if (askError instanceof SyntaxError) {
        return res.status(400).json({
          error: 'Error en los datos o formato de consulta',
          details: askError.message,
        });
      }

      return res.status(500).json({
        error: 'Error inesperado en la función ask',
        details: askError.message,
      });
    }
  } catch (error) {
    console.error('Error general en askLegalBot:', error);

    // Captura de errores generales fuera de `ask`
    if (error instanceof SyntaxError) {
      return res.status(400).json({
        error: 'Error de formato en los datos',
        details: error.message,
      });
    }

    if (error instanceof TypeError) {
      return res.status(400).json({
        error: 'Error en los datos de entrada',
        details: error.message,
      });
    }

    return res.status(500).json({ error: `Error al procesar la consulta: ${error.message}` });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId; // Obtener el ID del usuario autenticado

    // Buscar todos los chats asociados al usuario
    const userChats = await Chat.find({ user_id: userId }).sort({ _id: -1 });

    if (!userChats || userChats.length === 0) {
      return res.status(404).json({ message: 'No se encontraron chats para este usuario.' });
    }

    res.status(200).json({
      message: 'Chats encontrados exitosamente.',
      chats: userChats,
    });
  } catch (error) {
    console.error('Error al obtener los chats del usuario:', error.message);
    res.status(500).json({ error: 'No se pudo obtener los chats del usuario.' });
  }
};
