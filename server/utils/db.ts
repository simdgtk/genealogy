import mongoose from "mongoose";

export const client = mongoose.connection.getClient();
