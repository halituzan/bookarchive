// categoryTypes.ts

export default (type: string) => {
  switch (type) {
    case "0":
      return "Bilim Kurgu";
    case "1":
      return "Dünya Roman";
    case "2":
      return "Fantastik";
    case "3":
      return "Korku Gerilim";
    case "4":
      return "Macera";
    case "5":
      return "Polisiye";
    case "6":
      return "Romantik";
    case "7":
      return "Türk Klasikleri";
    case "8":
      return "Türk Romanı";
    default:
      return "0";
  }
};

// 0-Bilim Kurgu
// 1-Dünya Roman
// 2-Fantastik
// 3-Korku Gerilim
// 4-Macera
// 5-Polisiye
// 6-Romantik
// 7-Türk Klasikleri
// 8-Türk Romanı
