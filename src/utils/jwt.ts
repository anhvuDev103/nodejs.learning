import jwt, { Algorithm, SignOptions } from 'jsonwebtoken';

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256',
  },
}: {
  payload: string | Buffer | object;
  privateKey?: string;
  options?: SignOptions;
}) => {
  const baseOptions = {
    algorithm: 'HS256' as Algorithm,
    ...options,
  };

  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, baseOptions, (error, token) => {
      if (error) {
        throw reject(error);
      }

      resolve(token as string);
    });
  });
};
