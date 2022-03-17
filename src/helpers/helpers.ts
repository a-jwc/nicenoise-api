import { Prisma } from '@prisma/client';

// source: https://github.com/alexis-cortes/exclude-fields-prisma
export const exclude = (modelName: string, fields: string[]) => {
  const modelFields = {
    ...Prisma[`${firstLetterUpperCase(modelName)}ScalarFieldEnum`],
  };
  fields.forEach((field) => delete modelFields[field]);
  Object.keys(modelFields).forEach((key) => (modelFields[key] = true));
  return modelFields;
};

const firstLetterUpperCase = (word: string) => {
  const upperCase = word.charAt(0).toUpperCase() + word.slice(1);
  return upperCase;
};
