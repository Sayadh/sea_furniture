import { BadRequestException, ValidationError } from '@nestjs/common';

const MESSAGES: Record<string, string> = {
  isNotEmpty: 'Դաշտը պարտադիր է',
  isDefined: 'Դաշտը պարտադիր է',
  isString: 'Պետք է լինի տեքստ',
  isInt: 'Պետք է լինի ամբողջ թիվ',
  isNumber: 'Պետք է լինի թիվ',
  isBoolean: 'Անթույլատրելի արժեք',
  isEmail: 'Էլ. փոստի հասցեն սխալ է',
  isUrl: 'Հղումը սխալ է',
  isUUID: 'Սխալ նույնացուցիչ',
  isEnum: 'Անթույլատրելի արժեք',
  isArray: 'Պետք է լինի ցուցակ',
  isDateString: 'Ամսաթիվը սխալ է',
  isISO8601: 'Ամսաթիվը սխալ է',
  min: 'Արժեքը չափազանց փոքր է',
  max: 'Արժեքը չափազանց մեծ է',
  minLength: 'Տեքստը չափազանց կարճ է',
  maxLength: 'Տեքստը չափազանց երկար է',
  arrayMinSize: 'Ցուցակը դատարկ է',
  arrayMaxSize: 'Ցուցակում չափազանց շատ տարրեր կան',
  arrayNotEmpty: 'Ցուցակը դատարկ է',
  matches: 'Ձևաչափը սխալ է',
  whitelistValidation: 'Անթույլատրելի դաշտ',
  isArmenianPhone: 'Հեռախոսահամարը սխալ է։ Օրինակ՝ 077 123 456',
  isSlug: 'Slug-ը կարող է պարունակել միայն լատինատառ փոքրատառեր, թվեր և գծիկ',
};

function collect(errors: ValidationError[], parent = '', out: Record<string, string[]> = {}): Record<string, string[]> {
  for (const err of errors) {
    const field = parent ? `${parent}.${err.property}` : err.property;
    if (err.constraints && (err.value === undefined || err.value === null || err.value === '')) {
      out[field] = [MESSAGES.isNotEmpty];
    } else if (err.constraints) {
      out[field] = Object.entries(err.constraints).map(([key, msg]) => MESSAGES[msg] ?? MESSAGES[key] ?? msg);
    }
    if (err.children?.length) collect(err.children, field, out);
  }
  return out;
}

export function validationExceptionFactory(errors: ValidationError[]): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    message: 'Խնդրում ենք ստուգել լրացված դաշտերը',
    errors: collect(errors),
  });
}
