cd "C:\Users\BercanAyd\AppData\Local\Android\Sdk\emulator"
./emulator.exe -avd Pixel_5_API_30
npx expo start -c  
eas build --platform android --profile production
