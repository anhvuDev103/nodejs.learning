import { Request } from 'express';
import formidable, { Files } from 'formidable';
import fs from 'fs';
import path from 'path';

export const initFolder = () => {
  const uploadsFolderPath = path.resolve('uploads');
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true,
    });
  }
};

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    filter: function ({ name, originalFilename, mimetype }) {
      console.log('>> Check | mimetype:', mimetype);

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }

      return valid;
    },
  });

  return new Promise<Files<string>>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log('>> Check | err:', err);
      console.log('>> Check | files:', files);
      console.log('>> Check | fields:', fields);
      if (err) {
        return reject(err);
      }

      if (!files.image) {
        return reject(new Error('File is empty'));
      }

      resolve(files);
    });
  });
};
