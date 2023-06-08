export const socket = require("socket.io")();

export const sendStatus = (token_val, processed_data) => {
  console.log(token_val, processed_data);
  try {
    socket.emit(token_val, processed_data);
  } catch (e) {
    console.log(e);
  }
};
