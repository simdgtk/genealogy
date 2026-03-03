import { auth } from "./auth_file/auth"; // path to your auth file

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
