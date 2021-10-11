https://github.com/OptimalBits/bull#readme



### ONLY FOR DEVELOPMENT
When spinning up a new cluster run:
```bash
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=lkjsdakljads
```
and

```bash
kubectl create secret generic backblaze-api-token --from-literal=B2_API_TOKEN={YOUR TOKEN}
```
```bash
kubectl create secret generic backblaze-api-token-id --from-literal=B2_API_TOKEN_ID={TOKEN ID}
```

To run submission tests please create a file called backblaze.secret.json in root dir of submissions with your api keys

https://www.backblaze.com/b2/docs/server_side_encryption.html

#### Notes
Use multer for file uploads
