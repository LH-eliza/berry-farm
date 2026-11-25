/**
 * The course does not compile C++. Instead, numeric constants in the sketch
 * (`#define NAME 40` or `const int NAME = 40;`) are read live and drive the
 * built-in controller logic, so editing a threshold really changes the run.
 */
export function parseSketch(code: string) {
  const params: Record<string, number> = {};
  const num = "(-?\\d+(?:\\.\\d+)?)";
  const defRe = new RegExp(`^\\s*#define\\s+([A-Za-z_]\\w*)\\s+${num}`, "gm");
  const constRe = new RegExp(
    `^\\s*const\\s+(?:unsigned\\s+)?(?:int|float|long|byte|uint\\d+_t)\\s+([A-Za-z_]\\w*)\\s*=\\s*${num}\\s*;`,
    "gm"
  );
  for (const re of [defRe, constRe]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) params[m[1]] = parseFloat(m[2]);
  }
  return params;
}

/** Read each wanted constant, falling back to the default and noting what was missing. */
export function readParams<T extends Record<string, number>>(
  code: string,
  defaults: T
): { values: T; missing: string[] } {
  const parsed = parseSketch(code);
  const missing: string[] = [];
  const values = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    if (key in parsed && Number.isFinite(parsed[key])) {
      (values as Record<string, number>)[key] = parsed[key];
    } else {
      missing.push(key);
    }
  }
  return { values, missing };
}
