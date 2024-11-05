export function generateCode(length: number = 10) {
  const characters = "0123456789ABCDEFGHIJKLMNOPRSTUVYZXWQ";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}
