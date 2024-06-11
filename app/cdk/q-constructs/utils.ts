import { AwsCustomResourcePolicy } from 'aws-cdk-lib/custom-resources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const createCustomResourcePolicy = () => {
  const policyStatements = [
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: [
        'qbusiness:createApplication',
        'qbusiness:updateApplication',
        'qbusiness:deleteApplication',
        'qbusiness:createRetriever',
        'qbusiness:updateRetriever',
        'qbusiness:deleteRetriever',
        'qbusiness:createIndex',
        'qbusiness:updateIndex',
        'qbusiness:deleteIndex',
        'qbusiness:createDataSource',
        'qbusiness:updateDataSource',
        'qbusiness:deleteDataSource',
      ],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: ['iam:PassRole'],
    }),
  ];

  return AwsCustomResourcePolicy.fromStatements(policyStatements);
};

/* eslint @typescript-eslint/no-explicit-any: "off" */

export function xor(a: any, b: any): boolean {
  return (isNotEmpty(a) || isNotEmpty(b)) && !(isNotEmpty(a) && isNotEmpty(b));
}

export const isNotEmpty = <T>(value: T | undefined, checkAttributes = false): value is undefined =>
  !isEmpty(value, checkAttributes);

export const isEmpty = <T>(value: T | undefined, checkAttributes = false): value is undefined => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return false;
  }

  if (value instanceof Date) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every((item) => isEmpty(item));
  }

  if (value instanceof Object) {
    if (Object.keys(value).length === 0) {
      return true;
    }

    if (checkAttributes) {
      return Object.values(value).every((item) => isEmpty(item));
    }
  }

  return <any>value === '';
};

export const getOrThrowIfEmpty = <T>(value: T | undefined, name = 'element') => {
  if (isEmpty(value)) {
    throw new Error(`InvalidArgumentException: ${name} can't be empty`);
  }

  return value;
};

const FLATTEN_SEP = '_';
export const flattenObjectAsStringValue = <T extends object>(obj: T): { [key: string]: string } => {
  const result: any = {};

  function recurse(current: any, prop: string) {
    if (current instanceof Object) {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          recurse(current[key], prop === '' ? key : prop + FLATTEN_SEP + key);
        }
      }
    } else {
      result[prop] = String(current);
    }
  }

  recurse(obj, '');

  return result;
};

export const unflattenObject = <T extends Record<string, any>>(obj: T): any => {
  const result: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split(FLATTEN_SEP);
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const nestedKey = keys[i];
        current = current[nestedKey] = current[nestedKey] || {};
      }

      current[keys[keys.length - 1]] = obj[key];
    }
  }

  return result;
};
