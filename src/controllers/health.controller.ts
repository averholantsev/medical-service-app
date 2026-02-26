import { FastifyRequest, FastifyReply } from 'fastify';

export class HealthController {
  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
