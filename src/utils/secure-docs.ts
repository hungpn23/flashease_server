import { HttpServer } from '@nestjs/common';

const apiDocumentationCredentials = {
  name: 'admin',
  pass: 'admin',
};

// ref: https://trilon.io/blog/nestjs-swagger-tips-tricks#secure-openapi-documentation-usernamepassword
export function secureApiDocs(httpAdapter: HttpServer) {
  httpAdapter.use('/api-docs', (req, res, next) => {
    function parseAuthHeader(input: string): { name: string; pass: string } {
      const [, encodedPart] = input.split(' ');
      const buff = Buffer.from(encodedPart, 'base64');
      const text = buff.toString('ascii');
      const [name, pass] = text.split(':');
      return { name, pass };
    }
    function unauthorizedResponse(): void {
      if (httpAdapter.getType() === 'fastify') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic');
      } else {
        res.status(401);
        res.set('WWW-Authenticate', 'Basic');
      }
      next();
    }
    if (!req.headers.authorization) {
      return unauthorizedResponse();
    }
    const credentials = parseAuthHeader(req.headers.authorization);
    if (
      credentials?.name !== apiDocumentationCredentials.name ||
      credentials?.pass !== apiDocumentationCredentials.pass
    ) {
      return unauthorizedResponse();
    }
    next();
  });
}
