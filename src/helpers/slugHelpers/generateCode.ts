export function generateCode(length: number = 10) {
  const codeChars = "0123456789ABCDEFGHIJKLMNOPRSTUVYZXWQ";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * codeChars.length);
    code += codeChars.charAt(randomIndex);
  }
  return code;
}
