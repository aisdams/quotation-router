export const mata_uang = ['IDR', 'USD'] as const;

export type MataUang = (typeof mata_uang)[number];

export const mataUangOptions = [
    { value: 'IDR', label: 'IDR' },
    { value: 'USD', label: 'USD' },
  ];
  
export const type = ['Export', 'Import'] as const;

export type Type = (typeof type)[number];

export const TypeOptions = [
    { value: 'Export', label: 'Export' },
    { value: 'Import', label: 'Import' },
  ];
