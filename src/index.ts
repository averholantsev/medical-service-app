import fastify from 'fastify';

const fastifyClient = fastify({ logger: true });

// Declare a route for health check
fastifyClient.get('/api/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
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
