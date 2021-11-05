import { nanoid } from 'nanoid';

interface StandardApiResponse {
  status: string;
  statusText: string;
  headers: any;
  config: any;
  request: any;
  data: any;
}

const b2 = {
  authorize: jest.fn().mockImplementation(() => {
    return '';
  }),
  getBucket: jest
    .fn()
    .mockImplementation((bucketName: string): Promise<StandardApiResponse> => {
      return {
        status: '200',
        statusText: 'OK',
        headers: {},
        config: '',
        request: '',
        data: {
          buckets: [nanoid()],
        },
      };
    }),
  getUploadUrl: jest
    .fn()
    .mockImplementation(({ bucketId }): Promise<StandardApiResponse> => {
      return {
        status: '200',
        statusText: 'OK',
        headers: {},
        config: '',
        request: '',
        data: {
          uploadUrl: `https://api.${nanoid()}.com`,
          uploadAuthToken: nanoid(),
        },
      };
    }),
  uploadFile: jest
    .fn()
    .mockImplementation(
      ({ uploadUrl, uploadAuthToken, filename, data, mime }) => {
        return {
          status: '200',
          statusText: 'OK',
          headers: {},
          config: '',
          request: '',
          data: {
            fileId: nanoid(),
            bucketId: nanoid(),
            contentType: nanoid(),
            uploadTimestamp: +new Date(),
          },
        };
      },
    ),
};

export default b2;
