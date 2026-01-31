import Ajv, { type Options as AjvOptions, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

export class SchemaValidator {
  private ajv: Ajv;
  // Static cache to share compiled validators across instances
  private static validatorsCache: Map<string, ValidateFunction> = new Map();

  constructor(
    options: AjvOptions = { allowUnionTypes: true, allErrors: true },
  ) {
    this.ajv = new Ajv(options);
    addFormats(this.ajv);
  }

  /**
   * Compiles a schema and caches the validator function
   * @param schema The JSON schema object
   * @param key A unique key to identify/cache the schema (usually file path or unique ID)
   */
  compile(schema: object, key: string): ValidateFunction {
    if (SchemaValidator.validatorsCache.has(key)) {
      return SchemaValidator.validatorsCache.get(key)!;
    }

    const validate = this.ajv.compile(schema);
    SchemaValidator.validatorsCache.set(key, validate);
    return validate;
  }

  /**
   * Validates data against a schema
   * @param schema The JSON schema
   * @param data The data to validate
   * @param key The unique key for the schema
   * @returns Object containing isValid boolean and errors array
   */
  validate(
    schema: object,
    data: any,
    key: string,
  ): { isValid: boolean; errors: string | null } {
    const validate = this.compile(schema, key);
    const isValid = validate(data);
    return {
      isValid,
      errors:
        isValid || !validate.errors
          ? null
          : JSON.stringify(validate.errors, null, 2),
    };
  }
}
