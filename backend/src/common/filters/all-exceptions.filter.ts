import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Սխալ հարցում',
  401: 'Անհրաժեշտ է մուտք գործել',
  403: 'Մուտքն արգելված է',
  404: 'Տվյալները չեն գտնվել',
  409: 'Նման տվյալ արդեն գոյություն ունի',
  413: 'Ֆայլը չափազանց մեծ է',
  429: 'Չափազանց շատ հարցումներ։ Խնդրում ենք փորձել մի փոքր ուշ',
  500: 'Սերվերի սխալ։ Խնդրում ենք փորձել ավելի ուշ',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = STATUS_MESSAGES[500];
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const b = body as { message?: unknown; errors?: Record<string, string[]> };
        errors = b.errors;
        // Only pass through messages we wrote ourselves (Armenian); framework defaults are English.
        message = typeof b.message === 'string' && /[Ա-֏]/.test(b.message)
          ? b.message
          : STATUS_MESSAGES[status] ?? message;
      } else if (typeof body === 'string' && /[Ա-֏]/.test(body)) {
        message = body;
      } else {
        message = STATUS_MESSAGES[status] ?? message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        message = target ? `Նման արժեք արդեն գոյություն ունի (${target})` : STATUS_MESSAGES[409];
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = STATUS_MESSAGES[404];
      } else if (exception.code === 'P2003') {
        status = HttpStatus.CONFLICT;
        message = 'Գործողությունը հնարավոր չէ կատարել՝ առկա են կապակցված տվյալներ';
      } else {
        this.logger.error(exception.message, exception.stack);
      }
    } else {
      const err = exception as Error;
      this.logger.error(err?.message ?? String(exception), err?.stack);
    }

    res.status(status).json({ statusCode: status, message, ...(errors ? { errors } : {}) });
  }
}
