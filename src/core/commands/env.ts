import type { CommandDefinition } from '../shell/types';

export const env: CommandDefinition = {
  name: 'env',
  summary: 'Ortam değişkenlerini yazdırır.',
  usage: 'env',
  completion: 'none',
  manPage: `AD
    env - ortam değişkenlerini görüntüler veya komut çalıştırır

KULLANIM
    env

AÇIKLAMA
    Mevcut kabuk oturumundaki tüm ortam değişkenlerini (environment variables)
    ANAHTAR=DEĞER biçiminde ekrana yazdırır.

ÖRNEKLER
    env
    env | grep USER
    env | grep PATH`,
  run(_args, ctx) {
    const keys = Object.keys(ctx.env)
      .filter((k) => k !== '?')
      .sort();
    for (const k of keys) {
      ctx.stdout(`${k}=${ctx.env[k]}\n`);
    }
    return 0;
  },
};
