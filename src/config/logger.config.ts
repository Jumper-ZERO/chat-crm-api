export const loggerConfig = {
  pinoHttp: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        colorize: true,
        translateTime: 'dd/mm/yyyy, h:MM:ss TT',
        levelFirst: false,
        messageFormat: '[Chat Crm] {level} [{context}] {msg}',
      },
    },
  },
};
