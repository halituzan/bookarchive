import slugify from "slugify";
import Books from "../../models/book.model";

export async function generateSlug(text: string) {
  const slug = slugify(text, {
    lower: true,
    remove: /[*+~.()'"!:@?,]/g,
  });
  const bookSlugChecked = await Books.findOne({ slug });

  if (bookSlugChecked) {
    const code = generateCode();
    return slug + "-" + code.toUpperCase();
  } else {
    return slug;
  }
}

export function generateCode(length: number = 10) {
  const codeChars = "0123456789ABCDEFGHIJKLMNOPRSTUVYZXWQ";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * codeChars.length);
    code += codeChars.charAt(randomIndex);
  }
  return code;
}
