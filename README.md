# BigFloat
A JavaScript library for arbitrary floating point precision utilizing JavaScript BigInt type under the hood.

# License

This project is released under the MIT License (see LICENSE).

A commercial / sublicensing option is available for organizations or vendors that
wish to obtain an alternative license permitting sale or sublicensing under
different terms. For commercial licensing inquiries, please contact: https://www.hvks.com/license.html.

# Documentation

Full manual: docs/BigFloat.pdf
Quick start examples below

Add this to your .HTML file:
<script src="../Javascript/BigFloat.js"> </script>

# Example

  	let a=parseBigFloat("1.234E+2");  // Default precision  
	let b=parseBigFloat("9.876E-2");  // Default precision  
	let c=BigFloat.add(a,b);  
 	console.log(c.toString();  

# External Resources

An external test bench is available at www.hvks.com/Numerical/Test/BigFloat.html for accuracy and performance testing, including comparisons with other arbitrary precision JavaScript libraries such as BigNumber.js and decimal.js.

Other JavaScript libraries can be found at https://www.hvks.com/Numerical/js.html

Additional information is available at www.hvks.com

# Contact information

Email: hve@hvks.com

# BigFloat - Arbitrary Precision Floating-Point Library

A high-performance JavaScript library for arbitrary-precision floating-point arithmetic with comprehensive mathematical functions.

[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://github.com/yourusername/bigfloat-library)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Features

- **True Arbitrary Precision**: No hard limits on precision - compute with 100, 1,000, 10,000, or even 100,000+ decimal digits
- **IEEE 754-Inspired Design**: Binary floating-point representation using native BigInt for optimal performance
- **Comprehensive Mathematical Functions**: Complete set of transcendental, trigonometric, hyperbolic, and inverse functions
- **Flexible Precision Control**: Per-instance precision and rounding modes - change precision dynamically as needed
- **Mathematical Constants**: π, e, ln(2), ln(10), √2 computed to arbitrary precision on demand
- **Advanced Numerical Functions**: fma (fused multiply-add), nextafter, ldexp, frexp for rigorous numerical analysis
- **Multiple Rounding Modes**: NEAREST (ties to even), UP, DOWN, ZERO
- **Exceptional Performance**: Outperforms Decimal.js by 10-2600× in benchmarks at high precision

## Quick Start

### Basic Usage
```javascript
// Create BigFloat numbers
const x = new BigFloat("1.5", 50);  // 50 decimal digits precision
const y = new BigFloat(2.7, 50);

// Basic arithmetic
const sum = BigFloat.add(x, y);
const product = BigFloat.mul(x, y);
const quotient = BigFloat.div(x, y);

console.log(sum.toString());      // 4.2
console.log(product.toString());  // 4.05
```

### Computing π to 100 Digits
```javascript
const pi = BigFloat.PI(100);
console.log(pi.toString());
// 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117068
```

### Trigonometric Calculations
```javascript
// Compute sin(π/6) to 50 digits
const pi = BigFloat.PI(50);
const angle = BigFloat.div(pi, new BigFloat(6, 50));
const result = BigFloat.sin(angle);
console.log(result.toString());  // 0.5 (exactly)
```

### High-Precision Exponential
```javascript
const x = new BigFloat("2.5", 100);
const exp_x = BigFloat.exp(x);
console.log(exp_x.toPrecision(20));  // 12.182493960703473438
```

## Performance Highlights

BigFloat dramatically outperforms other JavaScript arbitrary-precision libraries at high precision:

| Operation | Precision | BigFloat | Decimal.js | Speedup |
|-----------|-----------|----------|------------|---------|
| sqrt(2) | 100,000 digits | 18 ms | 48,158 ms | **2,617×** |
| exp(2.5) | 10,000 digits | 100 ms | 26,694 ms | **267×** |
| asin(0.5) | 1,000 digits | 8.8 ms | 1,356 ms | **154×** |
| log(2.5) | 10,000 digits | 536 ms | ❌ Failed | ✓ |

See [Performance Benchmarks](docs/BigFloat.pdf#page=71) for comprehensive analysis.

## Installation

### Download
```bash
# Clone repository
git clone https://github.com/yourusername/bigfloat-library.git

# Or download directly
wget https://raw.githubusercontent.com/yourusername/bigfloat-library/main/BigFloat.js
```

### Browser
```html
<script src="BigFloat.js"></script>
<script>
  const x = new BigFloat("1.414213562373095", 100);
  const squared = BigFloat.mul(x, x);
  console.log(squared.toString());  // ≈ 2.0
</script>
```

### Node.js
```javascript
const BigFloat = require('./BigFloat.js');
const result = BigFloat.sqrt(new BigFloat(2, 100));
console.log(result.toString());
```

## Core API

### Constructor
```javascript
new BigFloat(value, precision, rounding)
BigFloat(value, precision, rounding)  // Works without 'new'
```

**Parameters:**
- `value` - Number, string, BigInt, or another BigFloat
- `precision` - Decimal digits of precision (default: 20)
- `rounding` - Rounding mode (default: NEAREST)

### Basic Arithmetic
```javascript
BigFloat.add(a, b)      // Addition: a + b
BigFloat.sub(a, b)      // Subtraction: a - b
BigFloat.mul(a, b)      // Multiplication: a × b
BigFloat.div(a, b)      // Division: a ÷ b
BigFloat.sqrt(x)        // Square root: √x
BigFloat.abs(x)         // Absolute value: |x|
BigFloat.inverse(x)     // Reciprocal: 1/x
```

### Exponential & Logarithmic Functions
```javascript
BigFloat.exp(x)         // e^x
BigFloat.log(x)         // Natural logarithm ln(x)
BigFloat.ln(x)          // Alias for log()
BigFloat.log10(x)       // Base-10 logarithm
BigFloat.pow(x, y)      // Power: x^y
```

### Trigonometric Functions
```javascript
BigFloat.sin(x)         // Sine (x in radians)
BigFloat.cos(x)         // Cosine
BigFloat.tan(x)         // Tangent
BigFloat.asin(x)        // Arcsine: sin⁻¹(x)
BigFloat.acos(x)        // Arccosine: cos⁻¹(x)
BigFloat.atan(x)        // Arctangent: tan⁻¹(x)
BigFloat.atan2(y, x)    // Two-argument arctangent
```

### Hyperbolic Functions
```javascript
BigFloat.sinh(x)        // Hyperbolic sine
BigFloat.cosh(x)        // Hyperbolic cosine
BigFloat.tanh(x)        // Hyperbolic tangent
BigFloat.asinh(x)       // Inverse hyperbolic sine
BigFloat.acosh(x)       // Inverse hyperbolic cosine
BigFloat.atanh(x)       // Inverse hyperbolic tangent
```

### Mathematical Constants

All constants computed to arbitrary precision on demand:
```javascript
BigFloat.PI(precision)      // π ≈ 3.14159...
BigFloat.E(precision)       // e ≈ 2.71828...
BigFloat.LN2(precision)     // ln(2) ≈ 0.69314...
BigFloat.LN10(precision)    // ln(10) ≈ 2.30258...
BigFloat.SQRT2(precision)   // √2 ≈ 1.41421...
BigFloat.EPSILON(precision) // Machine epsilon for precision
```

### Advanced Numerical Functions
```javascript
BigFloat.fma(a, b, c)         // Fused multiply-add: a×b + c (single rounding)
BigFloat.nextafter(x, toward) // Next representable number
BigFloat.ldexp(x, exp)        // x × 2^exp
BigFloat.frexp(x)             // Extract mantissa and exponent
BigFloat.fmod(a, b)           // Floating-point remainder
BigFloat.modf(x)              // Split into integer and fractional parts
```

### Rounding & Integer Functions
```javascript
BigFloat.floor(x)      // Round down to integer
BigFloat.ceil(x)       // Round up to integer  
BigFloat.trunc(x)      // Truncate to integer (toward zero)
BigFloat.round(x)      // Round to nearest integer
```

### Comparison Operations
```javascript
BigFloat.equal(a, b)        // a == b
BigFloat.notequal(a, b)     // a != b
BigFloat.less(a, b)         // a < b
BigFloat.lessequal(a, b)    // a <= b
BigFloat.greater(a, b)      // a > b
BigFloat.greaterequal(a, b) // a >= b
```

### Type Checking
```javascript
x.isNaN()        // Is NaN?
x.isFinite()     // Is finite (not NaN or infinity)?
x.isInfinite()   // Is ±infinity?
x.isZero()       // Is zero?
x.isInteger()    // Is integer?
x.isPositive()   // Is positive?
x.isNegative()   // Is negative?
x.isEven()       // Is even integer?
x.isOdd()        // Is odd integer?
```

### Conversion Methods
```javascript
x.toString(base)           // String representation (base 2, 10, or 16)
x.toNumber()               // Convert to JavaScript Number
x.toBigInt()               // Convert to BigInt
x.toExponential(digits)    // Exponential notation string
x.toFixed(digits)          // Fixed-point notation string
x.toPrecision(precision)   // String with specified precision
```

## Advanced Examples

### Dynamic Precision Management
```javascript
// Start with lower precision
let x = new BigFloat("1.0", 50);

// Increase precision for sensitive calculation
x._precision = 200;
x = x._normalize();

let result = BigFloat.sin(x);

// Reduce back to target precision
result._precision = 50;
result = result._normalize();
```

### Fused Multiply-Add for Numerical Stability
```javascript
// Standard computation (two roundings)
let a = new BigFloat("1e20", 50);
let b = new BigFloat("1e-20", 50);
let c = new BigFloat("1", 50);

let standard = BigFloat.add(BigFloat.mul(a, b), c);

// FMA (single rounding, more accurate)
let fma_result = BigFloat.fma(a, b, c);

console.log("Standard:", standard.toString());
console.log("FMA:", fma_result.toString());
```

### Computing with Machine Epsilon
```javascript
const precision = 100;
const eps = BigFloat.EPSILON(precision);

const one = new BigFloat(1, precision);
const onePlusEps = BigFloat.add(one, eps);

console.log(BigFloat.equal(onePlusEps, one));  // false
console.log(eps.toString());  // 1e-100

// Use for tolerance-based comparison
function approxEqual(a, b, tolerance) {
  const diff = BigFloat.abs(BigFloat.sub(a, b));
  return BigFloat.less(diff, tolerance);
}
```

### Next Representable Value
```javascript
const x = new BigFloat("1.5", 10);
const next = BigFloat.nextafter(x, new BigFloat(2));
const prev = BigFloat.nextafter(x, new BigFloat(1));

console.log("x:", x.toString());
console.log("next:", next.toString());  // Slightly larger than 1.5
console.log("prev:", prev.toString());  // Slightly smaller than 1.5
```

## Rounding Modes

BigFloat supports four IEEE 754-style rounding modes:
```javascript
BigFloat.ROUNDING_NEAREST  // Round to nearest, ties to even (default)
BigFloat.ROUNDING_UP       // Round toward +infinity
BigFloat.ROUNDING_DOWN     // Round toward -infinity
BigFloat.ROUNDING_ZERO     // Round toward zero (truncate)

// Set rounding mode
let x = new BigFloat("1.5", 10, BigFloat.ROUNDING_UP);
x.rounding(BigFloat.ROUNDING_DOWN);  // Change mode
```

## Internal Architecture

BigFloat uses a binary floating-point representation inspired by IEEE 754:
```
value = sign × significand × 2^exponent
```

**Key Components:**
- `_sign`: +1 or -1
- `_significand`: BigInt storing mantissa in binary
- `_exponent`: Binary exponent (power of 2)
- `_precision`: Decimal precision specification
- `_rounding`: Rounding mode
- `_bits`: Cached bit length (performance optimization)
- `_special`: Flags for zero, NaN, infinity

**Why Binary Representation?**
- Leverages native BigInt operations (highly optimized C++ implementation)
- Binary exponents make scaling trivial (multiply by 2^n = add to exponent)
- Aligns with hardware floating-point (IEEE 754)
- Enables division-free algorithms (e.g., reciprocal square root)

See [Design Philosophy](docs/BigFloat.pdf#page=8) for detailed explanation.

## Performance Characteristics

**Strengths:**
- **Arithmetic Operations**: 10-300× faster than Decimal.js at high precision
- **Square Root**: Division-free Newton's method, 2,600× faster at 100k digits
- **Transcendental Functions**: Modern algorithms with optimal convergence
- **Scalability**: O(n² log n) complexity scaling

**Trade-offs:**
- Binary ↔ decimal conversion overhead (one-time cost per number)
- Larger code size (~4,500 lines) due to comprehensive function coverage

**Best suited for:**
- Scientific computing with intensive calculations
- High-precision numerical analysis
- Many operations per number creation
- Precision requirements beyond 1,000 digits

See [Performance Analysis](docs/BigFloat.pdf#page=71) for benchmarks.

## Documentation

📘 **[Complete User Manual (PDF)](docs/BigFloat.pdf)** - 80-page comprehensive guide including:
- Design philosophy and internal architecture
- Complete API reference with examples
- Mathematical background for all functions
- Performance analysis and benchmarks
- Comparison with BigNumber.js and Decimal.js
- Development history and AI-assisted implementation

## Browser Compatibility

Requires JavaScript environments supporting:
- ES6+ (2015+)
- Native BigInt (2020+)

**Compatible with:**
- Chrome/Edge 67+
- Firefox 68+
- Safari 14+
- Node.js 10.4+

## Use Cases

### Scientific Computing
```javascript
// High-precision physical constants
const c = new BigFloat("299792458", 100);  // Speed of light (m/s)
const h = new BigFloat("6.62607015e-34", 100);  // Planck constant
```

### Cryptography
```javascript
// Large prime calculations
const p = new BigFloat("2^521 - 1", 200);  // Mersenne prime
```

### Financial Modeling
```javascript
// Compound interest with extreme precision
const principal = new BigFloat("1000000", 50);
const rate = BigFloat.div(new BigFloat("3.5"), new BigFloat("100"));
const years = 30;
// ... complex calculations
```

### Mathematical Research
```javascript
// Compute Ramanujan's constant to 1000 digits
const pi = BigFloat.PI(1000);
const result = BigFloat.exp(BigFloat.mul(pi, BigFloat.sqrt(new BigFloat(163, 1000))));
console.log(result.toString());
```

## Comparison with Other Libraries

| Feature | BigFloat | Decimal.js | BigNumber.js |
|---------|----------|------------|--------------|
| True arbitrary precision | ✅ Yes | ❌ Limited to 1,025 digits | ✅ Yes |
| Transcendental functions | ✅ Full set | ✅ Full set | ❌ Limited |
| Performance (high precision) | ⚡ Excellent | 🐌 Poor | 🐌 Poor |
| fma, nextafter | ✅ Yes | ❌ No | ❌ No |
| Per-instance precision | ✅ Yes | ❌ Global only | ❌ Global only |
| Reliability at 10k+ digits | ✅ Perfect | ❌ Fails often | ✅ Good |

## Version History

- **3.0** (Jan 2026) - Complete rewrite using BigInt, binary representation, modern algorithms
- **2.0** (2015-2020) - Decimal string representation, basic functions
- **1.0** (2012) - Initial JavaScript implementation

## License

This project is released under the MIT License (see [LICENSE](LICENSE)).

A commercial/sublicensing option is available for organizations or vendors that wish to obtain an alternative license permitting sale or sublicensing under different terms. For commercial licensing inquiries, please contact: https://www.hvks.com/license.html

## Contact

**Henrik Vestermark**  
Email: hve@hvks.com  
Website: https://hvks.com

## Acknowledgments

BigFloat builds upon decades of research in arbitrary-precision arithmetic and numerical analysis. Special thanks to the broader computational mathematics community. Implementation inspired by MPFR, GMP, and IEEE 754 floating-point standards.

The development of this library was accelerated through collaborative AI-assisted programming, combining domain expertise with rapid implementation capabilities.

## Contributing

This is a personal research library. For bug reports or suggestions, please contact hve@hvks.com.

---

**See also:** [Integration Library](https://github.com/yourusername/integration-library) | [Interval Arithmetic Library](https://github.com/yourusername/interval-library)
