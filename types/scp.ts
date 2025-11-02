// Bu dosya, CSV'den gelen verinin yapısını (şablonunu) tanımlar.
// _layout.js dosyanız bu şablonu kullanarak 
// 'scpData' içinde ne tür veriler olduğunu bilir.
// Bu, kod yazarken otomatik tamamlama (autocomplete) almanızı sağlar.

export interface ScpDataRow {
  code: string;
  title: string;
  text: string;
  
  // CSV başlığınızda 'image captions' gibi boşluklu bir isim varsa,
  // bu şekilde tırnak içinde yazılmalıdır.
  // ? ekleyerek bu alanı 'isteğe bağlı' (optional) hale getirdik.
  "image captions"?: string; 

  // Papa.parse'da 'dynamicTyping: true' kullandığımız için
  // 'rating' bir sayı (number) olarak gelecektir.
  rating: number; 
  
  state: string;
  tags: string;
  link: string;
  
  // CSV'de burada tanımlamadığımız başka alanlar varsa
  // hata vermemesi için bu satırı ekliyoruz.
  [key: string]: any; 
}

