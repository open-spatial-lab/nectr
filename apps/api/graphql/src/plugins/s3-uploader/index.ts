import S3 from 'aws-sdk/clients/s3';
import FormData from 'form-data';
import { Plugin } from '@webiny/plugins/types';
import { File } from '@webiny/api-file-manager/types';
import { Context } from '@webiny/handler/types';

interface Config {
  bucketName: string;
}

export default (config: Config): Plugin => ({
  type: 'fm.storage',
  name: 'fm.storage.s3',
  async upload(file: File, context: Context) {
    const s3 = new S3({
      region: process.env.AWS_REGION
    });

    const formData = new FormData();
    formData.append('file', file['buffer'], {
      filename: file['filename'],
      contentType: file.type
    });

    const uploadParams = {
      Bucket: config.bucketName,
      Key: file.key,
      Body: formData
    };

    await s3.upload(uploadParams).promise();

    return {
      src: `https://${config.bucketName}.s3.amazonaws.com/${file.key}`,
      type: file.type,
      size: file.size,
      meta: {}
    };
  }
});