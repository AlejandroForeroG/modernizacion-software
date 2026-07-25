#!/usr/bin/env bash
# Corre los tests de Java con JaCoCo y regenera
# documentación/cobertura-jacoco.md con el resumen (general, por paquete y
# clases con menor cobertura).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CSV_FILE="$REPO_ROOT/target/site/jacoco/jacoco.csv"
MD_FILE="$REPO_ROOT/documentación/cobertura-jacoco.md"

echo "== PetClinic - cobertura de código (JaCoCo) =="

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'java' en el PATH. Instalá JDK 17+." >&2
  exit 1
fi

if [ ! -x "$REPO_ROOT/mvnw" ]; then
  echo "ERROR: no se encontró el wrapper de Maven ($REPO_ROOT/mvnw)." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'python3' en el PATH (se usa para armar el resumen)." >&2
  exit 1
fi

echo "== Corriendo tests + reporte JaCoCo =="
cd "$REPO_ROOT"
MVN_LOG="$(mktemp)"
trap 'rm -f "$MVN_LOG"' EXIT

./mvnw -B test jacoco:report 2>&1 | tee "$MVN_LOG"

if [ ! -f "$CSV_FILE" ]; then
  echo "ERROR: no se generó $CSV_FILE" >&2
  exit 1
fi

TEST_SUMMARY="$(grep -E '^\[(INFO|WARNING)\] Tests run:' "$MVN_LOG" | tail -1 | sed -E 's/^\[(INFO|WARNING)\] //')"

echo "== Armando resumen en documentación/cobertura-jacoco.md =="
python3 - "$CSV_FILE" "$MD_FILE" "$TEST_SUMMARY" <<'PYEOF'
import csv
import sys
from collections import defaultdict

csv_path, md_path, test_summary = sys.argv[1], sys.argv[2], sys.argv[3]

def pct(covered, missed):
    total = covered + missed
    return round(100 * covered / total, 1) if total else 0.0

METRICS = [
    ("INSTRUCTION", "Instrucciones"),
    ("BRANCH", "Ramas (branch)"),
    ("LINE", "Líneas"),
    ("METHOD", "Métodos"),
]

pkg_totals = defaultdict(lambda: defaultdict(int))
overall = defaultdict(int)
class_rows = []

with open(csv_path, newline="") as f:
    for row in csv.DictReader(f):
        pkg = row["PACKAGE"].replace("org.springframework.samples.", "") or "(default)"
        for key in ("INSTRUCTION_MISSED", "INSTRUCTION_COVERED", "BRANCH_MISSED", "BRANCH_COVERED",
                    "LINE_MISSED", "LINE_COVERED", "METHOD_MISSED", "METHOD_COVERED"):
            pkg_totals[pkg][key] += int(row[key])
            overall[key] += int(row[key])
        class_rows.append(row)

lines = []
lines.append("# Cobertura de código (JaCoCo)\n")
lines.append(
    "Generado automáticamente por `scripts/mac/coverage.sh` "
    "(`./mvnw test jacoco:report`)."
)
if test_summary:
    lines.append(f"Última corrida: {test_summary}.")
lines.append(
    "Reporte HTML completo en `target/site/jacoco/index.html` (no versionado, "
    "se regenera con el script).\n"
)

lines.append("## Resumen general\n")
lines.append("| Métrica | Cobertura | Cubierto / Total |")
lines.append("|---|---|---|")
for prefix, label in METRICS:
    covered, missed = overall[f"{prefix}_COVERED"], overall[f"{prefix}_MISSED"]
    lines.append(f"| {label} | {pct(covered, missed)}% | {covered} / {covered + missed} |")
lines.append(f"\n{len(class_rows)} clases analizadas.\n")

lines.append("## Por paquete (cobertura de líneas)\n")
lines.append("| Paquete | Líneas | Instrucciones | Ramas |")
lines.append("|---|---|---|---|")
for pkg in sorted(pkg_totals):
    t = pkg_totals[pkg]
    line_pct = pct(t["LINE_COVERED"], t["LINE_MISSED"])
    instr_pct = pct(t["INSTRUCTION_COVERED"], t["INSTRUCTION_MISSED"])
    branch_pct = pct(t["BRANCH_COVERED"], t["BRANCH_MISSED"])
    lines.append(
        f"| `{pkg}` | {line_pct}% ({t['LINE_COVERED']}/{t['LINE_COVERED'] + t['LINE_MISSED']}) "
        f"| {instr_pct}% | {branch_pct}% |"
    )

THRESHOLD = 80.0
low = []
for row in class_rows:
    lc, lm = int(row["LINE_COVERED"]), int(row["LINE_MISSED"])
    p = pct(lc, lm)
    if p < THRESHOLD:
        pkg = row["PACKAGE"].replace("org.springframework.samples.", "")
        low.append((p, f"{pkg}.{row['CLASS']}", lc, lm))

lines.append(f"\n## Clases con menor cobertura de líneas (< {THRESHOLD:.0f}%)\n")
if low:
    lines.append("| Clase | Líneas |")
    lines.append("|---|---|")
    for p, name, lc, lm in sorted(low):
        lines.append(f"| `{name}` | {p}% ({lc}/{lc + lm}) |")
else:
    lines.append(f"Todas las clases superan el {THRESHOLD:.0f}% de cobertura de líneas.")

with open(md_path, "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"OK: {md_path}")
PYEOF

echo "== Listo =="
echo "Resumen:              $MD_FILE"
echo "Reporte HTML completo: $REPO_ROOT/target/site/jacoco/index.html"
