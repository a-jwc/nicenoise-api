import { v4 as uuidv4 } from 'uuid';

export const createFileName = (file: Express.Multer.File) => {
  const ext = file.mimetype.split('/')[1];
  const filename = `${uuidv4()}-${Date.now()}.${ext}`;
  return filename;
};
