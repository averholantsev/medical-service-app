import fastify from 'fastify';
const fastifyClient = fastify({ logger: true });
fastifyClient.get('/api/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
});
const start = async () => {
    try {
        await fastifyClient.listen({ port: 3000, host: '0.0.0.0' });
        fastifyClient.log.info(`Server listening on 3000`);
    }
    catch (err) {
        fastifyClient.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map