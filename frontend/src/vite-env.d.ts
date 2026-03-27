/// <reference types="vite/client" />

// Deklarasi eksplisit di bawah ini opsional karena `vite/client` sudah mencakupnya,
// tetapi ditambahkan agar TypeScript benar-benar mendeteksi semua format berikut:
declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}
