// Type definitions for BigFloat.js
// Project: BigFloat.js - Arbitrary Precision Floating Point Arithmetic
// Definitions by: Henrik Vestermark
// TypeScript Version: 4.0+

/**
 * Arbitrary precision floating-point number library using native BigInt
 * 
 * @example
 * ```typescript
 * const x = new BigFloat("3.141592653589793", 50);
 * const y = BigFloat.sqrt(new BigFloat(2, 50));
 * const result = BigFloat.mul(x, y);
 * ```
 */
declare class BigFloat {
    // ========== Constructor ==========
    
    /**
     * Create a new BigFloat number
     * 
     * @param value - Initial value (number, string, bigint, or BigFloat)
     * @param precision - Number of decimal digits of precision (default: 20)
     * @param rounding - Rounding mode (default: ROUNDING_NEAREST)
     * 
     * @example
     * ```typescript
     * new BigFloat(3.14159, 50);
     * new BigFloat("3.14159265358979323846", 100);
     * new BigFloat(42n, 50);
     * new BigFloat(otherBigFloat, 100); // Copy with new precision
     * ```
     */
    constructor(value?: number | string | bigint | BigFloat, precision?: number, rounding?: number);
    
    // ========== Static Constants ==========
    
    /** Normal finite number */
    static readonly SPECIAL_NONE: 0;
    
    /** Zero (signed) */
    static readonly SPECIAL_ZERO: 1;
    
    /** Infinity (signed) */
    static readonly SPECIAL_INF: 2;
    
    /** Not a Number */
    static readonly SPECIAL_NAN: 3;
    
    /** Round to nearest, ties to even (default) */
    static readonly ROUNDING_NEAREST: 0;
    
    /** Round toward +infinity (ceiling) */
    static readonly ROUNDING_UP: 1;
    
    /** Round toward -infinity (floor) */
    static readonly ROUNDING_DOWN: 2;
    
    /** Round toward zero (truncate) */
    static readonly ROUNDING_ZERO: 3;
    
    /** Rounding mode constants (backward compatibility) */
    static readonly RoundingMode: {
        readonly NEAREST: 0;
        readonly UP: 1;
        readonly DOWN: 2;
        readonly ZERO: 3;
    };
    
    /** Default rounding mode for new BigFloat instances */
    static defaultRounding: number;
    
    /** Default precision (in decimal digits) for new BigFloat instances */
    static defaultPrecision: number;
    
    // ========== Instance Properties ==========
    
    /** Machine epsilon for this instance's precision (read-only) */
    readonly EPSILON: BigFloat;
    
    // ========== Static Helper Methods ==========
    
    /**
     * Convert special value code to string
     * @param special - Special value code
     * @returns String representation ("none", "zero", "inf", "nan", "unknown")
     */
    static specialToString(special: number): string;
    
    /**
     * Convert rounding mode code to string
     * @param rounding - Rounding mode code
     * @returns String representation ("nearest", "up", "down", "zero", "unknown")
     */
    static roundingToString(rounding: number): string;
    
    /**
     * Set default rounding mode for new BigFloat instances
     * @param mode - Rounding mode
     */
    static defaultrounding(mode: number): void;
    
    /**
     * Set default precision for new BigFloat instances
     * @param prec - Precision in decimal digits
     */
    static defaultprecision(prec: number): void;
    
    /**
     * Parse a string into a BigFloat
     * @param s - String to parse
     * @param precision - Decimal precision
     * @param rounding - Rounding mode
     * @returns New BigFloat or NaN if parsing fails
     */
    static parseBigFloat(s: string, precision?: number, rounding?: number): BigFloat;
    
    // ========== Instance Methods - Properties ==========
    
    /**
     * Get or set the sign
     * @param s - Sign to set (+1 or -1), or undefined to get current sign
     * @returns Current sign if no argument, otherwise this
     */
    sign(s?: number): number | this;
    
    /**
     * Get or set the exponent
     * @param e - Exponent to set, or undefined to get current exponent
     * @returns Current exponent if no argument, otherwise this
     */
    exponent(e?: number): number | this;
    
    /**
     * Get or set the rounding mode
     * @param mode - Rounding mode to set, or undefined to get current mode
     * @returns Current rounding mode if no argument, otherwise this
     */
    rounding(mode?: number): number | this;
    
    /**
     * Get or set the precision
     * @param p - Precision to set, or undefined to get current precision
     * @returns Current precision if no argument, otherwise this
     */
    precision(p?: number): number | this;
    
    // ========== Instance Methods - Type Checking ==========
    
    /**
     * Check if this number is NaN
     * @returns true if NaN, false otherwise
     */
    isNaN(): boolean;
    
    /**
     * Check if this number is finite (not infinity or NaN)
     * @returns true if finite, false otherwise
     */
    isFinite(): boolean;
    
    /**
     * Check if this number is infinite
     * @returns true if infinite, false otherwise
     */
    isInfinite(): boolean;
    
    /**
     * Check if this number is zero
     * @returns true if zero, false otherwise
     */
    isZero(): boolean;
    
    /**
     * Check if this number is an integer
     * @returns true if integer, false otherwise
     */
    isInteger(): boolean;
    
    /**
     * Check if this number is positive (> 0)
     * @returns true if positive, false otherwise
     */
    isPositive(): boolean;
    
    /**
     * Check if this number is negative (< 0)
     * @returns true if negative, false otherwise
     */
    isNegative(): boolean;
    
    /**
     * Check if this integer is even
     * @returns true if even integer, false otherwise
     */
    isEven(): boolean;
    
    /**
     * Check if this integer is odd
     * @returns true if odd integer, false otherwise
     */
    isOdd(): boolean;
    
    // ========== Instance Methods - Conversion ==========
    
    /**
     * Convert to JavaScript number (may lose precision)
     * @returns JavaScript number representation
     */
    toNumber(): number;
    
    /**
     * Convert to BigInt (truncates fractional part)
     * @returns BigInt representation
     */
    toBigInt(): bigint;
    
    /**
     * Convert to string representation
     * @param base - Number base (2, 10, or 16), default 10
     * @returns String representation
     */
    toString(base?: 2 | 10 | 16): string;
    
    /**
     * Format in exponential notation
     * @param digits - Number of digits after decimal point (optional)
     * @returns Exponential notation string (e.g., "1.23e+4")
     */
    toExponential(digits?: number): string;
    
    /**
     * Format with fixed number of decimal places
     * @param fractionDigits - Number of digits after decimal point
     * @returns Fixed-point notation string
     */
    toFixed(fractionDigits: number): string;
    
    /**
     * Format with specified precision
     * @param precision - Total number of significant digits
     * @returns String with specified precision
     */
    toPrecision(precision: number): string;
    
    // ========== Instance Methods - Utility ==========
    
    /**
     * Create a deep copy of this BigFloat
     * @returns New BigFloat with same value
     */
    clone(): BigFloat;
    
    /**
     * Assign value from another BigFloat
     * @param a - BigFloat to copy from
     * @returns this
     */
    assign(a: BigFloat): this;
    
    /**
     * Dump internal state to console (for debugging)
     * @param label - Optional label for output
     * @param verbose - Include detailed information (default: true)
     */
    dump2Console(label?: string, verbose?: boolean): void;
    
    // ========== Instance Methods - Arithmetic ==========
    
    /**
     * Square root of this number
     * @returns Square root
     */
    sqrt(): BigFloat;
    
    /**
     * Raise this number to a power
     * @param y - Exponent
     * @returns this^y
     */
    pow(y: BigFloat): BigFloat;
    
    /**
     * Exponential function (e^this)
     * @returns e^this
     */
    exp(): BigFloat;
    
    // ========== Instance Methods - Trigonometric ==========
    
    /**
     * Hyperbolic sine of this number
     * @returns sinh(this)
     */
    sinh(): BigFloat;
    
    /**
     * Hyperbolic cosine of this number
     * @returns cosh(this)
     */
    cosh(): BigFloat;
    
    /**
     * Hyperbolic tangent of this number
     * @returns tanh(this)
     */
    tanh(): BigFloat;
    
    // ========== Instance Methods - Rounding ==========
    
    /**
     * Round down to integer (floor)
     * @returns Floor of this number
     */
    floor(): BigFloat;
    
    /**
     * Round up to integer (ceiling)
     * @returns Ceiling of this number
     */
    ceil(): BigFloat;
    
    /**
     * Round toward zero (truncate)
     * @returns Truncated integer
     */
    trunc(): BigFloat;
    
    /**
     * Round to nearest integer
     * @returns Rounded integer
     */
    round(): BigFloat;
    
    /**
     * Split into integer and fractional parts
     * @returns [integer_part, fractional_part]
     */
    modf(): [BigFloat, BigFloat];
    
    // ========== Instance Methods - Successor/Predecessor ==========
    
    /**
     * Next representable value (successor)
     * @returns Next larger representable value
     */
    succ(): BigFloat;
    
    /**
     * Previous representable value (predecessor)
     * @returns Next smaller representable value
     */
    pred(): BigFloat;
    
    // ========== Static Methods - Mathematical Constants ==========
    
    /**
     * Compute π to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns π
     */
    static PI(prec?: number): BigFloat;
    
    /**
     * Compute Euler's number (e) to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns e
     */
    static E(prec?: number): BigFloat;
    
    /**
     * Compute natural logarithm of 2 to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns ln(2)
     */
    static LN2(prec?: number): BigFloat;
    
    /**
     * Compute natural logarithm of 5 to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns ln(5)
     */
    static LN5(prec?: number): BigFloat;
    
    /**
     * Compute natural logarithm of 10 to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns ln(10)
     */
    static LN10(prec?: number): BigFloat;
    
    /**
     * Compute square root of 2 to specified precision
     * @param prec - Precision in decimal digits (default: defaultPrecision)
     * @returns √2
     */
    static SQRT2(prec?: number): BigFloat;
    
    /**
     * Compute machine epsilon for specified precision
     * 
     * Machine epsilon is the smallest value ε such that 1 + ε ≠ 1
     * at the given precision. For precision p: EPSILON = 10^(-p)
     * 
     * @param precision - Precision in decimal digits
     * @returns Machine epsilon
     * 
     * @example
     * ```typescript
     * const eps = BigFloat.EPSILON(50);  // 10^-50
     * ```
     */
    static EPSILON(precision: number): BigFloat;
    
    // ========== Static Methods - Arithmetic ==========
    
    /**
     * Addition: a + b
     * @param a - First operand
     * @param b - Second operand
     * @returns a + b
     */
    static add(a: BigFloat, b: BigFloat): BigFloat;
    
    /**
     * Subtraction: a - b
     * @param a - First operand
     * @param b - Second operand
     * @returns a - b
     */
    static sub(a: BigFloat, b: BigFloat): BigFloat;
    
    /**
     * Multiplication: a × b
     * @param a - First operand
     * @param b - Second operand
     * @returns a × b
     */
    static mul(a: BigFloat, b: BigFloat): BigFloat;
    
    /**
     * Division: a ÷ b
     * @param a - Numerator
     * @param b - Denominator
     * @returns a ÷ b
     */
    static div(a: BigFloat, b: BigFloat): BigFloat;
    
    /**
     * Multiplicative inverse: 1/a
     * @param a - Value to invert
     * @returns 1/a
     */
    static inverse(a: BigFloat): BigFloat;
    
    /**
     * Fused multiply-add: (a × b) + c
     * @param a - First multiplicand
     * @param b - Second multiplicand
     * @param c - Addend
     * @returns (a × b) + c
     */
    static fma(a: BigFloat, b: BigFloat, c: BigFloat): BigFloat;
    
    /**
     * Square root
     * @param y - Value
     * @returns √y
     */
    static sqrt(y: BigFloat): BigFloat;
    
    /**
     * Power: x^y
     * @param x - Base
     * @param y - Exponent
     * @returns x^y
     */
    static pow(x: BigFloat, y: BigFloat): BigFloat;
    
    /**
     * Fast power (optimized version)
     * @param x - Base
     * @param y - Exponent
     * @returns x^y
     */
    static powfast(x: BigFloat, y: BigFloat): BigFloat;
    
    // ========== Static Methods - Exponential and Logarithmic ==========
    
    /**
     * Exponential function: e^x
     * @param x - Exponent
     * @returns e^x
     */
    static exp(x: BigFloat): BigFloat;
    
    /**
     * Natural logarithm: ln(x)
     * @param x - Value
     * @returns ln(x)
     */
    static ln(x: BigFloat): BigFloat;
    
    /**
     * Natural logarithm: log(x) (alias for ln)
     * @param x - Value
     * @returns log(x)
     */
    static log(x: BigFloat): BigFloat;
    
    /**
     * Base-10 logarithm: log₁₀(x)
     * @param x - Value
     * @returns log₁₀(x)
     */
    static log10(x: BigFloat): BigFloat;
    
    // ========== Static Methods - Trigonometric ==========
    
    /**
     * Sine function: sin(x)
     * @param x - Angle in radians
     * @returns sin(x)
     */
    static sin(x: BigFloat): BigFloat;
    
    /**
     * Cosine function: cos(x)
     * @param x - Angle in radians
     * @returns cos(x)
     */
    static cos(x: BigFloat): BigFloat;
    
    /**
     * Tangent function: tan(x)
     * @param x - Angle in radians
     * @returns tan(x)
     */
    static tan(x: BigFloat): BigFloat;
    
    /**
     * Inverse sine: arcsin(x)
     * @param x - Value in [-1, 1]
     * @returns arcsin(x)
     */
    static asin(x: BigFloat): BigFloat;
    
    /**
     * Inverse cosine: arccos(x)
     * @param x - Value in [-1, 1]
     * @returns arccos(x)
     */
    static acos(x: BigFloat): BigFloat;
    
    /**
     * Inverse tangent: arctan(x)
     * @param x - Value
     * @returns arctan(x)
     */
    static atan(x: BigFloat): BigFloat;
    
    /**
     * Two-argument inverse tangent: arctan(y/x)
     * @param y - Y coordinate
     * @param x - X coordinate
     * @returns arctan(y/x) with correct quadrant
     */
    static atan2(y: BigFloat, x: BigFloat): BigFloat;
    
    // ========== Static Methods - Hyperbolic Functions ==========
    
    /**
     * Hyperbolic sine: sinh(x)
     * @param x - Value
     * @returns sinh(x)
     */
    static sinh(x: BigFloat): BigFloat;
    
    /**
     * Hyperbolic cosine: cosh(x)
     * @param x - Value
     * @returns cosh(x)
     */
    static cosh(x: BigFloat): BigFloat;
    
    /**
     * Hyperbolic tangent: tanh(x)
     * @param x - Value
     * @returns tanh(x)
     */
    static tanh(x: BigFloat): BigFloat;
    
    /**
     * Inverse hyperbolic sine: arcsinh(x)
     * @param x - Value
     * @returns arcsinh(x)
     */
    static asinh(x: BigFloat): BigFloat;
    
    /**
     * Inverse hyperbolic cosine: arccosh(x)
     * @param x - Value (must be ≥ 1)
     * @returns arccosh(x)
     */
    static acosh(x: BigFloat): BigFloat;
    
    /**
     * Inverse hyperbolic tangent: arctanh(x)
     * @param x - Value in (-1, 1)
     * @returns arctanh(x)
     */
    static atanh(x: BigFloat): BigFloat;
    
    // ========== Static Methods - Comparison ==========
    
    /**
     * Test equality: a = b
     * @param a - First value
     * @param b - Second value
     * @returns true if a equals b
     */
    static equal(a: BigFloat, b: BigFloat): boolean;
    
    /**
     * Test inequality: a ≠ b
     * @param a - First value
     * @param b - Second value
     * @returns true if a not equal to b
     */
    static notequal(a: BigFloat, b: BigFloat): boolean;
    
    /**
     * Test less than: a < b
     * @param a - First value
     * @param b - Second value
     * @returns true if a less than b
     */
    static less(a: BigFloat, b: BigFloat): boolean;
    
    /**
     * Test greater than: a > b
     * @param a - First value
     * @param b - Second value
     * @returns true if a greater than b
     */
    static greater(a: BigFloat, b: BigFloat): boolean;
    
    /**
     * Test less than or equal: a ≤ b
     * @param a - First value
     * @param b - Second value
     * @returns true if a less than or equal to b
     */
    static lessequal(a: BigFloat, b: BigFloat): boolean;
    
    /**
     * Test greater than or equal: a ≥ b
     * @param a - First value
     * @param b - Second value
     * @returns true if a greater than or equal to b
     */
    static greaterequal(a: BigFloat, b: BigFloat): boolean;
    
    // ========== Static Methods - Rounding and Special ==========
    
    /**
     * Absolute value: |x|
     * @param x - Value
     * @returns |x|
     */
    static abs(x: BigFloat): BigFloat;
    
    /**
     * Floor function (round down)
     * @param x - Value
     * @returns ⌊x⌋
     */
    static floor(x: BigFloat): BigFloat;
    
    /**
     * Ceiling function (round up)
     * @param x - Value
     * @returns ⌈x⌉
     */
    static ceil(x: BigFloat): BigFloat;
    
    /**
     * Truncate (round toward zero)
     * @param x - Value
     * @returns trunc(x)
     */
    static trunc(x: BigFloat): BigFloat;
    
    /**
     * Round to nearest integer
     * @param x - Value
     * @returns round(x)
     */
    static round(x: BigFloat): BigFloat;
    
    /**
     * Floating-point modulo: a mod b
     * @param a - Dividend
     * @param b - Divisor
     * @returns a mod b
     */
    static fmod(a: BigFloat, b: BigFloat): BigFloat;
    
    /**
     * Split into integer and fractional parts
     * @param x - Value
     * @returns [integer_part, fractional_part]
     */
    static modf(x: BigFloat): [BigFloat, BigFloat];
    
    /**
     * Extract mantissa and exponent: x = mantissa × 2^exponent
     * @param x - Value
     * @returns [mantissa, exponent] where mantissa ∈ [0.5, 1)
     */
    static frexp(x: BigFloat): [BigFloat, number];
    
    /**
     * Construct from mantissa and exponent: mantissa × 2^exp
     * @param x - Mantissa
     * @param exp - Exponent (integer)
     * @returns x × 2^exp
     */
    static ldexp(x: BigFloat, exp: number): BigFloat;
    
    /**
     * Next representable value towards target
     * @param x - Starting value
     * @param towards - Direction value
     * @returns Next representable value from x towards 'towards'
     */
    static nextafter(x: BigFloat, towards: BigFloat): BigFloat;
}

/**
 * Parse a string into a BigFloat (global function)
 * @param s - String to parse
 * @param precision - Decimal precision (optional)
 * @param rounding - Rounding mode (optional)
 * @returns BigFloat or NaN if parsing fails
 */
declare function parseBigFloat(s: string, precision?: number, rounding?: number): BigFloat;

/**
 * Global statistics arrays for performance monitoring (optional)
 */
declare var BigFloatStat: any[];
declare var BigFloatStat2: any[];

export = BigFloat;
export as namespace BigFloat;
