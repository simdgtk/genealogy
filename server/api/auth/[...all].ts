import { auth } from "./auth_file/auth";

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
