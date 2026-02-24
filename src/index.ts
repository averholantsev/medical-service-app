import fastify from 'fastify';
import multipart from '@fastify/multipart';
import * as pdf from 'pdfjs-dist/legacy/build/pdf.mjs';

const fastifyClient = fastify({ logger: true });

// Register multipart plugin with limits
fastifyClient.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1, // allow only one file
  },
});

// Declare a route for health check
fastifyClient.get('/api/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Route for PDF parsing
fastifyClient.post('/api/parse-pdf', async (request, reply) => {
  try {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let filename = '';
    let mimetype = '';

    for await (const part of parts) {
      if (part.type === 'file' && part.filename) {
        // Validate file type
        if (part.mimetype !== 'application/pdf') {
          return reply.code(400).send({ error: 'File must be a PDF' });
        }
        // Collect file data
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        pdfBuffer = Buffer.concat(chunks);
        filename = part.filename;
        mimetype = part.mimetype;
        break; // assume single file upload
      }
    }

    if (!pdfBuffer) {
      return reply.code(400).send({ error: 'No PDF file provided' });
    }

    // Parse PDF
    const loadingTask = pdf.getDocument({ data: pdfBuffer });
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    const textContent: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const text = await page.getTextContent();
      const pageText = text.items.map((item: any) => item.str).join(' ');
      textContent.push(pageText);
    }

    return {
      filename,
      mimetype,
      pageCount: numPages,
      textByPage: textContent,
      fullText: textContent.join('\n---\n'),
    };
  } catch (error) {
    fastifyClient.log.error(error);
    return reply.code(500).send({
      error: 'Failed to parse PDF',
      details: (error as Error).message,
    });
  }
});

// Run the server
const start = async () => {
  try {
    await fastifyClient.listen({ port: 3000, host: '0.0.0.0' });
    fastifyClient.log.info(`Server listening on 3000`);
  } catch (err) {
    fastifyClient.log.error(err);
    process.exit(1);
  }
};

start();
