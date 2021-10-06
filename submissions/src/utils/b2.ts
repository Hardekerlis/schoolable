import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.B2_API_TOKEN_ID as string,
  applicationKey: process.env.B2_API_TOKEN as string,
  retry: {
    retries: 5,
  },
});

export default b2;
