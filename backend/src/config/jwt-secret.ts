/**
 * Zwraca sekret JWT z env. Fail-fast: brak sekretu = wyjątek na starcie (#62).
 * Zapobiega uruchomieniu z domyślnym/zaszytym sekretem, który pozwalałby
 * podrobić tokeny (w tym rolę admin).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET nie jest ustawiony. Ustaw silny, losowy sekret w zmiennej środowiskowej JWT_SECRET.',
    );
  }
  return secret;
}
