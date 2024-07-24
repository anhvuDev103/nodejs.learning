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

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 4 * 300 * 1024,
    filter: function ({ name, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'));

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any);
      }

      return valid;
    },
  });

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      if (!files.image) {
        return reject(new Error('File is empty'));
      }

      resolve(files.image);
    });
  });
};

export const getNameFormFullName = (fullname: string) => {
  const namearr = fullname.split('.');
  namearr.pop();
  return namearr.join('');
};
