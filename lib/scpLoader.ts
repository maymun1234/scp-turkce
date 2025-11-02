import { Asset } from 'expo-asset';
import Papa, { ParseResult } from 'papaparse';

// 1. Veri modeli için bir interface tanımlayalım (Tip Güvenliği)
interface ScpDataRow {
  code: string;
  title: string;
  text: string;
  rating: number; // dynamicTyping bunu sayıya çevirecek
  state: string;
  tags: string;
  link: string;
  // Diğer tüm alanlar için
  [key: string]: any;
}

export async function loadScpData(): Promise<ScpDataRow[]> {
  try {
    // 2. Asset'i yükle
    const [asset] = await Asset.loadAsync(
      require('../app/assets/scp6999.csv')
    );

    // 3. FileSystem yerine 'fetch' ile asset URI'ını oku (Daha Basit)
    // Bu, asset'in yerel URI'ından (file://...) içeriği çeker.
    const response = await fetch(asset.uri);
    const csvString = await response.text();

    if (!csvString) {
      throw new Error('CSV dosyası boş veya okunamadı.');
    }

    // 4. Papa.parse ayarlarını iyileştir
    const parsed: ParseResult<ScpDataRow> = Papa.parse(csvString, {
      header: true,         // Başlık satırını kullan
      skipEmptyLines: true, // Boş satırları atla
      dynamicTyping: true,  // 'rating' gibi sayısal değerleri otomatik algıla
      
      // 5. '"""' sorununu çözmek için 'transform' kullan (Daha Verimli)
      // Bu fonksiyon, her bir hücre değeri için çalışır.
      // Papa.parse, """değer""" formatını "değer" (string) olarak okur.
      // Bu fazladan tırnakları burada temizleriz.
      transform: (value: string) => {
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          return value.substring(1, value.length - 1);
        }
        return value;
      },
    });

    // 6. Papa.parse'ın kendi hata dizisini kontrol et
    if (parsed.errors.length > 0) {
      console.warn('CSV parse edilirken bazı hatalar oluştu:', parsed.errors);
      // Hatalara rağmen devam edebiliriz, 'parsed.data' yine de dolu olabilir.
    }

    // 7. Filtrelemeyi 'parsed.data' üzerinden yap
    const cleanData = parsed.data.filter((row) => row.code && row.title);
    
    return cleanData;

  } catch (err) {
    console.error('SCP verisi yüklenemedi:', err);
    return [];
  }
}