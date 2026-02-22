# Changelog
All notable changes to **BigFloat.js** are documented in this file.
This project follows Semantic Versioning.  
Major versions reflect fundamental representation or API changes.
---
## [3.0.2] – 2026-02-22
### Added
- `BigFloat._rangeReduction2PI(v)` — internal helper that reduces a positive argument
  to `[0, 2π)` at elevated working precision. The binary exponent of `v` is converted
  to extra decimal digits so that the subtraction `v − k·2π` retains full significance
  for arbitrarily large arguments, preventing catastrophic cancellation.
- `BigFloat._rangeReductionPI(v)` — internal helper that further reduces a value in
  `[0, 2π)` to `[0, π)`, returning `[reduced, signFlip]` so the caller can track the
  sign change from the identity `sin(π + v) = −sin(v)`.

### Changed
- **`sin(x)`** — Rewritten to use the new range-reduction helpers.
  - Fixed sign handling: `|x|` is now passed to `_rangeReduction2PI` (sign stripped
    before reduction, restored via the odd-function identity at the end).
  - Corrected working-precision formula: guard digits are now computed from the actual
    working precision rather than the original `x._precision`.
  - Corrected trisection depth `k`: now uses `5 * ceil(log(2)·log(precision))` and is
    adjusted by `v._exponent` after range reduction, matching the C++ reference.
- **`cos(x)`** — Rewritten to mirror the C++ `float_precision::cos()` implementation.
  - Uses `_rangeReduction2PI` for correct precision scaling with large arguments.
  - Determines sign from the full `[0, 2π)` quadrant before folding (`cos < 0` for
    `v ∈ (π/2, 3π/2)`).
  - Folds `v` to `[0, π/2]` via two reflections: `2π − v` then `π − v`.
  - Near-π/2 branch: when `v > π/2 − 0.1`, computes `cos(v) = sin(π/2 − v)` to avoid
    catastrophic cancellation in `√(1 − sin²v)` when `sin(v) ≈ 1`.
- **`tan(x)`** — Rewritten to mirror the C++ `float_precision::tan()` implementation.
  - Replaces the previous inline 2π reduction with `_rangeReduction2PI`.
  - Adaptive working precision with three tiers matching the C++ formula:
    `p < 40` → `p/4 + 10` extra digits; `p < 100` → `p/10 + 5`; else `5`.
  - Near-singularity branch: when `|v mod π − π/2| < 0.1`, uses the identity
    `tan(π/2 + δ) = −1/tan(δ)` to avoid cancellation near `π/2` and `3π/2`.
    The result sign is derived as `−sign(tan(δ))` rather than hardcoded, correctly
    handling both sides of each singularity.
  - Restores the odd-function property (`tan(−x) = −tan(x)`) explicitly.

### Fixed
- `cos(x)` sign was previously determined by double-precision `Math.cos(x)`, which
  fails for large arguments where `x` has lost all phase information as a `float64`.
- `tan(x)` sign logic was incorrect in the second and third quadrants.

---
## [3.0.1] – 2025-12-22
### Added
- `BigFloat.cmp(a, b)` returning `-1`, `0`, or `1` for less than, equal, or greater than comparisons.
---
## [3.0.0] – 2025-11-14
### Summary
This is a **complete rewrite** of BigFloat.js.
All 1.x and 2.x implementations were retired and replaced with a new architecture based on binary representation and modern JavaScript `BigInt`.  
The design is based on more than a decade of research and published papers on arbitrary precision arithmetic.
### Added
- New binary based internal representation incorporating BigInt
- Modernized parsing and formatting
- Rebuilt arithmetic, transcendental, and conversion framework
- Clean, consistent API surface
### Changed
- **Breaking:** All previous 1.x and 2.x APIs and internal formats removed
- **Breaking:** Numeric core redesigned for correctness, performance, and scalability
---
## [2.0.x] – 2022
### Summary
The 2.x series focused on internal performance and memory layout.
### Changed
- Internal decimal layout optimized for improved performance and reduced overhead
---
## [1.x] – 2012 to 2021
### Summary
The 1.x series established BigFloat.js as a full featured arbitrary precision floating point library.
### Added
- Core arbitrary precision decimal arithmetic
- Parsing and formatting
- Mathematical constants: `PI`, `E`, `LN2`, `LN10`
- Elementary functions:  
  `sqrt`, `log`, `exp`, `pow`
- Trigonometric functions:  
  `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`
- Hyperbolic functions:  
  `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`
- Rounding and integer conversion:  
  `floor`, `ceil`, `trunc`, `round`, `toInteger`
- BigInt integration:  
  `toBigInt()`
### Performance
- Multi digit arithmetic using 14 digit blocks
- Fast multiplication
- Optimized addition and subtraction
- Specialized handling of powers of 10
- Argument reduction for transcendental functions
- Experimental FFT based multiplication
- Karatsuba, Toom Cook 3, and Schönhage Strassen multiplication
### Fixed
- Numerous correctness and domain edge cases
- Trigonometric and inverse function accuracy
- Parsing of signed zero
- Precision propagation in addition and subtraction
- Formatting issues such as `-0` output
---
## Versioning notes
- 1.x and 2.x represent the legacy architecture
- 3.x is a clean, modern reimplementation
- No backward compatibility is guaranteed between 2.x and 3.x
For research background and implementation theory see:  
https://hvks.com/Numerical/papers.html
