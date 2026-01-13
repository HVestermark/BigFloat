# Changelog

All notable changes to **BigFloat.js** are documented in this file.

This project follows Semantic Versioning.  
Major versions reflect fundamental representation or API changes.

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
