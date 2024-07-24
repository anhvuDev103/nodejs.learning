import { Request } from 'express';
import formidable, { File, Files } from 'formidable';
import fs from 'fs';

import { UPLOAD_TEMP_DIR } from '@/constants/dir';

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true,
    });
  }
};

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 4000 * 1024, // 4MB
    filter: function ({ name, originalFilename, mimetype }) {
      console.log('>> Check | mimetype:', mimetype);

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }

      return valid;
    },
  });

  return new Promise<File>((resolve, reject) => {
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

      resolve((files.image as File[])[0]);
    });
  });
};

export const getNameFormFullName = (fullname: string) => {
  const namearr = fullname.split('.');
  namearr.pop();
  return namearr.join('');
};
