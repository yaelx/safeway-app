// Add this to your govmap.d.ts or a new images.d.ts
declare module "*.png" {
  const value: string;
  return value;
}

declare module "*.jpg" {
  const value: string;
  return value;
}

declare module "*.svg" {
  const value: string;
  return value;
}
