////////////////////////////////////////////////////////////////////////////
//
//                       Copyright (c) 2012-2026
//                       Henrik Vestermark
//                       Denmark, USA
//
//                       All Rights Reserved
//
//   This source file is subject to the terms and conditions of the
//   Henrik Vestermark License Agreement which restricts the manner
//   in which it may be used.
//   Mail: hve@hvks.com
//   Web:  https://www.hvks.com
//
/////////////////////////////////////////////////////////////////////////////
//
// Module name     :    BigFloat.js
// Module ID Nbr   :   
// Description     :    Javascript arbitrary precision number class using BigInt
//                      the is a complete rewrite of the previous BigFloat class
//                      use decimal string to hold the arbitrary precision number.
//                      All previous versions 1.x and 2.x has been removed.
//                      The present code is based on the more than 10 papers i wrote
//                      about various aspect of arbitrary precision and how do make
//                      an efficient and fast implementation. see.
//                      https://hvks.com/Numerical/papers.html
//
// --------------------------------------------------------------------------
// Change Record   :   
//
// Version	Author/Date		Description of changes
// -------  ---------------	----------------------
// 03.00	HVE/14-Nov-2025	Initial release
// 03/01    HVE/22-Dec-2025 Added BigFloat.cmp(a,b) return [-1,0,1]
//
// End of Change Record
//
/////////////////////////////////////////////////////////////////////////////
//
/// @file BigFloat.js
/// @brief Arbitrary Precision Floating Point Arithmetic Library
/// @author Henrik Vestermark (hve@hvks.com)
/// @date 14-Nov-2025
/// @copyright Copyright (c) 2012-2025 Henrik Vestermark
//
/// @mainpage BigFloat.js - Arbitrary Precision Floating Point Arithmetic
///
/// @section intro Introduction
/// 
/// BigFloat.js is a high-performance arbitrary precision floating-point 
/// arithmetic library for JavaScript. It leverages native BigInt for 
/// optimal performance while providing IEEE 754-like semantics with 
/// arbitrary precision.
///
/// This is a complete rewrite of previous versions (1.x and 2.x), utilizing
/// JavaScript's native BigInt capabilities for dramatic performance 
/// improvements over decimal string-based implementations.
///
/// @section structure Internal Structure
///
/// A BigFloat object contains the following members:
///
/// @par _sign
/// The sign of the number, either +1 or -1. This is stored separately
/// from the significand for easier manipulation, rather than using 
/// two's complement representation.
///
/// @par _exponent
/// The binary exponent representing the power of 2 (i.e., 2^_exponent).
/// This binary representation aligns with IEEE 754 standard format and
/// enables efficient arithmetic operations.
///
/// @par _significand
/// The significand (mantissa) of the BigFloat number, stored as a 
/// JavaScript BigInt object. This is interpreted as a normalized binary
/// number with an implicit leading 1 bit and hidden binary point after
/// the first bit (similar to IEEE 754 format). The significand represents
/// a value in the range [1, 2) when normalized.
///
/// @par _precision
/// The number of decimal fraction digits for a normalized number. This
/// determines the accuracy of calculations and is user-configurable.
/// Unlike fixed-precision libraries, precision can be changed dynamically.
///
/// @par _rounding
/// The rounding mode used when normalizing numbers after operations.
/// Supported modes: NEAREST (ties to even), UP (toward +∞), DOWN (toward -∞),
/// and ZERO (toward zero/truncate).
///
/// @par _special
/// Special value flag indicating zero, NaN, +infinity, or -infinity.
/// Zero is treated specially as it has no set bits in the significand.
///
/// @par _bits
/// Cached bit length of the significand for performance optimization.
/// If _bits < 0, it will be recalculated when needed. This caching
/// avoids repeated bit-length calculations during operations.
///
/// @section design Design Philosophy
///
/// The internal representation uses native BigInt objects for the significand,
/// which dramatically increases performance compared to decimal array-based
/// approaches used by other libraries (e.g., Decimal.js, BigNumber.js).
///
/// The structure follows IEEE 754 principles:
/// - Binary significand (not decimal)
/// - Base-2 exponent (not base-10)
/// - Normalized representation (1.xxxxx format)
/// - Separate sign handling
///
/// @subsection binary_point The Hidden Binary Point
///
/// The _significand is not interpreted as a simple BigInt value. Instead,
/// there is a hidden binary point between the first set bit and the 
/// remaining bits. For example, if _significand = 11010101₂ and 
/// _exponent = 3, this represents:
///
///   1.1010101₂ × 2³ = 1101.0101₂
///
/// This interpretation means that multiplication, addition, and subtraction
/// operations on the bit patterns produce mathematically correct results
/// without special handling—we only need to track where the hidden binary
/// point is located and normalize the result.
///
/// @subsection normalization Normalization
///
/// After every arithmetic or mathematical operation, the result is normalized
/// to ensure:
/// - The significand has a leading 1 bit (except for zero)
/// - The number is rounded to the specified precision
/// - The exponent is adjusted accordingly
/// - Special flags (zero, infinity, NaN) are updated
///
/// This normalization guarantees that all BigFloat values are in canonical
/// form, making comparisons and subsequent operations efficient and correct.
///
/// @section precision Dynamic Precision
///
/// Unlike fixed-precision libraries, BigFloat allows dynamic precision
/// adjustment. This is invaluable for error control:
///
/// @code
/// // Increase precision for intermediate calculations
/// let x = new BigFloat("3.14159", 50);
/// x.precision(100);  // Bump up precision
/// let result = BigFloat.sin(x);  // High-precision calculation
/// result.precision(50);  // Round to final precision
/// @endcode
///
/// This approach helps manage rounding errors in complex calculations while
/// maintaining reasonable performance.
///
/// @section performance Performance Advantages
///
/// By using native BigInt instead of decimal string representations:
/// - Binary operations are 10-2600× faster than Decimal.js
/// - No precision limits (Decimal.js fails beyond ~10,000 digits)
/// - Efficient use of CPU and memory
/// - Better algorithmic complexity for large precision
///
/// See the performance comparison documentation for detailed benchmarks.
///
/// @section api API Design
///
/// The library intentionally does not use ES6 class syntax to enable:
///
/// @code
/// // Constructor-style creation
/// let a = new BigFloat(10.5);
///
/// // Functional-style conversion (like BigInt)
/// let b = BigFloat(10.5);
///
/// // Seamless integration in expressions
/// let result = BigFloat(10.5).mul(BigFloat.sqrt(BigFloat(2)));
/// @endcode
///
/// This design mirrors JavaScript's BigInt() constructor behavior and
/// enables natural expression composition.
///
/// @section research Research Background
///
/// The algorithms implemented in BigFloat.js are based on extensive research
/// in arbitrary precision arithmetic. For detailed mathematical background,
/// implementation techniques, and algorithm analysis, see:
///
/// **Numerical Methods - Papers**  
/// https://www.hvks.com/Numerical/numerical.html
///
/// This collection contains over 12 research papers covering:
/// - Arbitrary precision multiplication (Karatsuba, FFT-based)
/// - Division algorithms (Newton-Raphson, Burnikel-Ziegler)
/// - Transcendental functions (exp, log, trigonometric)
/// - Root-finding methods (Newton, Halley)
/// - Special functions (gamma, error function)
/// - Precision analysis and error bounds
///
/// @section examples Usage Examples
///
/// @subsection example_basic Basic Arithmetic
/// @code
/// const x = new BigFloat("3.14159265358979323846", 50);
/// const y = new BigFloat(2, 50);
///
/// const sum = BigFloat.add(x, y);
/// const product = BigFloat.mul(x, y);
/// const quotient = BigFloat.div(x, y);
/// console.log(quotient.toString());  // High-precision result
/// @endcode
///
/// @subsection example_constants Mathematical Constants
/// @code
/// const pi = BigFloat.PI(100);       // π to 100 digits
/// const e = BigFloat.E(100);         // e to 100 digits
/// const sqrt2 = BigFloat.SQRT2(100); // √2 to 100 digits
/// const eps = BigFloat.EPSILON(100); // Machine epsilon
/// @endcode
///
/// @subsection example_trig Transcendental Functions
/// @code
/// const x = new BigFloat("1.5", 50);
/// const sinX = BigFloat.sin(x);
/// const lnX = BigFloat.ln(x);
/// const expX = BigFloat.exp(x);
/// const sqrtX = BigFloat.sqrt(x);
/// @endcode
///
/// @subsection example_precision Precision Management
/// @code
/// let x = new BigFloat("0.1", 20);
/// 
/// // Increase precision for intermediate calculation
/// x.precision(100);
/// let y = BigFloat.pow(x, new BigFloat(10, 100));
/// 
/// // Round to final precision
/// y.precision(20);
/// console.log(y.toFixed(20));
/// @endcode
///
/// @section rounding Rounding Modes
///
/// Four IEEE 754-style rounding modes are supported:
///
/// - **ROUNDING_NEAREST** (0): Round to nearest, ties to even (default)
/// - **ROUNDING_UP** (1): Round toward +∞ (ceiling)
/// - **ROUNDING_DOWN** (2): Round toward -∞ (floor)  
/// - **ROUNDING_ZERO** (3): Round toward zero (truncate)
///
/// @code
/// const x = new BigFloat("3.7", 10, BigFloat.ROUNDING_DOWN);
/// console.log(BigFloat.floor(x));  // Uses instance rounding mode
/// @endcode
///
/// @section license License
///
/// This source file is subject to the terms and conditions of the
/// Henrik Vestermark License Agreement which restricts the manner
/// in which it may be used.
///
/// @section contact Contact
///
/// **Author:** Henrik Vestermark  
/// **Email:** hve@hvks.com  
/// **Website:** https://www.hvks.com  
/// **Research Papers:** https://www.hvks.com/Numerical/numerical.html
///
/// @section version Version History
///
/// @par Version 3.01 (14-Nov-2025)
/// - Complete rewrite using native BigInt
/// - 10-2600× performance improvement over previous versions
/// - Eliminated precision limits
/// - Added comprehensive transcendental function library
/// - Implemented dynamic precision management
/// - Full IEEE 754-style rounding mode support
///
/// @par Previous Versions (1.x, 2.x)
/// - Removed (decimal string-based implementation)
///
/////////////////////////////////////////////////////////////////////////////

// Performance monitoring arrays (optional)
BigFloatStat = [];   // Statistical data collection
BigFloatStat2 = [];  // Secondary statistics

/**
 * BigFloat with Integer Codes for Special Values and Rounding Modes
 * 
 * Benefits:
 * - Faster comparisons
 * - Smaller memory footprint
 * - Better JIT optimization
 * - Type-safe (typos cause errors)
 */

// Define special value constants
const SPECIAL_NONE = 0;      // Normal finite number
const SPECIAL_ZERO = 1;      // Zero (signed)
const SPECIAL_INF = 2;       // Infinity (signed)
const SPECIAL_NAN = 3;       // Not a Number

// Export as static properties for easy access
BigFloat.SPECIAL_NONE = SPECIAL_NONE;
BigFloat.SPECIAL_ZERO = SPECIAL_ZERO;
BigFloat.SPECIAL_INF = SPECIAL_INF;
BigFloat.SPECIAL_NAN = SPECIAL_NAN;

// Helper function for debugging - converts code to string
BigFloat.specialToString = function(special) {
    switch(special) {
        case SPECIAL_NONE: return "none";
        case SPECIAL_ZERO: return "zero";
        case SPECIAL_INF: return "inf";
        case SPECIAL_NAN: return "nan";
        default: return "unknown";
    }
};

// Define rounding mode constants
const ROUNDING_NEAREST = 0;  // Round to nearest, ties to even
const ROUNDING_UP = 1;       // Round toward +infinity
const ROUNDING_DOWN = 2;     // Round toward -infinity
const ROUNDING_ZERO = 3;     // Round toward zero (truncate)

// Export as static properties
BigFloat.ROUNDING_NEAREST = ROUNDING_NEAREST;
BigFloat.ROUNDING_UP = ROUNDING_UP;
BigFloat.ROUNDING_DOWN = ROUNDING_DOWN;
BigFloat.ROUNDING_ZERO = ROUNDING_ZERO;

// For backward compatibility, keep the old RoundingMode object
// The four rounding mode supported
// NEAREST  round to Nearest
// ZERO     round towards zero
// UP       round up 
// DOWN     round down
//
BigFloat.RoundingMode = {
    NEAREST: ROUNDING_NEAREST,
    UP: ROUNDING_UP,
    DOWN: ROUNDING_DOWN,
    ZERO: ROUNDING_ZERO
};

BigFloat.roundingToString = function(rounding) {
    switch(rounding) {
        case ROUNDING_NEAREST: return "nearest";
        case ROUNDING_UP: return "up";
        case ROUNDING_DOWN: return "down";
        case ROUNDING_ZERO: return "zero";
        default: return "unknown";
    }
};

// Constructor for BigFloat
function BigFloat(value=0, precision = BigFloat.defaultPrecision, rounding = BigFloat.defaultRounding) {
    if (!(this instanceof BigFloat)) return new BigFloat(value, precision, rounding);

    this._sign = 1;                  // +1 or -1
    this._exponent = 0;              // power of 2
    this._significand = 0n;          // BigInt, normalized (MSB = 1)
    this._precision = precision;     // in decimal digits of the fraction
    this._rounding = rounding;       // rounding mode
    this._special = SPECIAL_ZERO;    // null | 'zero' | 'inf' | 'nan'
    this._bits = 0;                  // Remember bit length

    if (typeof value === 'string') 
        this._parseFromString(value);
    else if (typeof value === 'number') 
        this._fromNumber(value);
    else if (typeof value === 'bigint') {
        this._significand = value < 0n ? -value : value;
        this._sign = value < 0n ? -1 : 1;
        this._exponent = 0;
        this._normalizeBits();  
    } else if (value instanceof BigFloat) { // Notice when value is a BigFloat
        // the object inherit the precision and rounding mode
        Object.assign(this, value);
    }
}

// Initial default values
BigFloat.defaultRounding = BigFloat.RoundingMode.NEAREST;
BigFloat.defaultPrecision = 20;  // decimal fraction digits

// Start Getters & Setters
BigFloat.defaultrounding = function (mode) {
    if (mode === undefined) return BigFloat.defaultRounding;
    return (BigFloat.defaultRounding = mode);
};

BigFloat.defaultprecision = function (prec) {
    if (prec !== undefined) BigFloat.default.Precision = prec;
    return BigFloat.defaultPrecision;
};


BigFloat.prototype.sign = function (s) {
    if (s !== undefined) this._sign = s < 0 ? -1 : 1;
    // No check for accidentally setting -0??
    return this._sign;
};

BigFloat.prototype.exponent = function (e) {
    if (e !== undefined) this._exponent = Number(e);
    return this._exponent;
};

BigFloat.prototype.rounding = function (mode) {
    if (mode !== undefined) this._rounding = mode;
    return this._rounding;
};

BigFloat.prototype.precision = function (p) {
    if (p !== undefined) this._precision = p;
    if(p!=undefined) this._bits=0;
    return this._precision;
};


Object.defineProperty(BigFloat.prototype, 'EPSILON', {
    get: function() {
        return BigFloat.EPSILON(this._precision);
    },
    set: undefined,  // ← No setter, so read-only!
    enumerable: false
});
// End getters & setters

/**
 * Debug helper: print the internal state of this BigFloat.
 * @param {string} label - optional text prefix for clarity
 */
BigFloat.prototype.dump2Console = function (label = '', verbose=true) {
    const bitlen = this._bitlength(); //_significand.toString(2).length;
    const effExp = this._exponent - (bitlen - 1);

    const signStr = this._sign > 0 ? '+' : '-';
    const specStr = BigFloat.specialToString(this._special);

    if(verbose)
        console.log(
            `${label ? label + ': ' : ''}` + `${this.toString()}\n` +
            `  sign:        ${this._sign}\n` +
            `  significand: ${this._significand.toString(10)} (0b${this._significand.toString(2)})\n` +
            `  Bit length:  ${this._bitlength() /*_significand.toString(2).length*/}\n` +
            `  exponent:    ${this._exponent} (binary 2^${this._exponent})\n`+
            `  precision:   ${this._precision}\n` +
            `  rounding:    ${this._rounding}\n`
        );
    else
        console.log(
            `${label ? label + ': ' : ''}` +
            ` ${this.toString()}\n`
        );
};

// Clone the BigFloat object
BigFloat.prototype.clone = function() {
    BigFloatStat.clone=(BigFloatStat.clone??0)+1;
    const copy = new BigFloat();
    copy._sign = this._sign;
    copy._significand = this._significand;
    copy._exponent = this._exponent;
    copy._precision = this._precision;
    copy._rounding = this._rounding;
    copy._special = this._special;
    copy._bits = this._bits;
    return copy;
};

// Handle construction of BigFloat from an Number either integer, float, nan, inf etc
BigFloat.prototype._fromNumber = function (num) {
    BigFloatStat._fromNumber=(BigFloatStat._fromNumber??0)+1;
    if (!Number.isFinite(num)) {
        this._special = isNaN(num) ? SPECIAL_NAN : SPECIAL_INF;
        this._sign = Math.sign(num) || 1;
        this._bits=0;
        return;
    }
    // keep this._precision and this._rounding as already set
    if (num === 0) {
        this._special = SPECIAL_ZERO;
        this._sign = 1;
        this._exponent = 0;
        this._significand = 0n;
        this._bits = 0;
        return;
    }
    
    this._sign = num < 0 ? -1 : 1;
    num = Math.abs(num);
    
    if(Number.isInteger(num))
        {// Handle integer
        this._significand = BigInt(num);
        this._exponent = 0;
        this._special=num!=0?SPECIAL_NONE:SPECIAL_ZERO;
        this._normalizeBits(); // Also set this._bits
        return;
        }
    
    // float number
    // Use the exact binary representation via multiplication by power of 2
    // Multiply by 2^52 to get all significant bits as integer
    const scaled = num * (2 ** 52);
    const scaledInt = Math.round(scaled);
    this._significand = BigInt(scaledInt);
    this._exponent = -52 + this._bitlength() - 1; //_significand.toString(2).length - 1;
    this._compact();
        
    // Now normalize to the requested precision
    // This will round the number to have the correct number of bits
    // for the specified decimal precision
    this._normalize();
    return;
};

// Handle construction of BigFloat from a number string
BigFloat.prototype._parseFromString = function (str) {
        BigFloatStat._parseFromString=(BigFloatStat._parseFromString??0)+1;
    const bf = parseBigFloat(str, this._precision, this._rounding);
    this._sign        = bf._sign;
    this._significand = bf._significand;
    this._exponent    = bf._exponent;
    this._special     = bf._special;
    this._bits        = bf._this;
};

BigFloat.prototype._bitlength = function(forced = false) {
    BigFloatStat._bitlength = (BigFloatStat._bitlength ?? 0) + 1;
    //this._bits = this._significand.toString(2).length; 
    //  return this._bits;
    let n = this._significand; // n is always positive (stored as abs value)
    
    // Handle zero
    if (n === 0n) {
        this._bits = 0;
        return 0;
    }
    
    // Force recomputation if requested
    if (forced) 
        this._bits = -1;
    
    // Return cached value if available
    if (this._bits > 0) {
        BigFloatStat._bitlengthCache = (BigFloatStat._bitlengthCache ?? 0) + 1;
        return this._bits;
    }
    
    // =========================================================================
    // HEX STRING METHOD - 1.6x faster than your binary search
    // =========================================================================
    // Convert to hex (4x fewer characters than binary, 2x fewer than decimal)
    const hex = n.toString(16);
    const hexLen = hex.length;
    
    // Each hex digit = 4 bits, but first digit might be partial
    const firstDigit = parseInt(hex[0], 16);
    
    // Determine how many bits the first digit uses
    let firstDigitBits;
    if (firstDigit >= 8) firstDigitBits = 4;      // 1000-1111 (4 bits)
    else if (firstDigit >= 4) firstDigitBits = 3; // 0100-0111 (3 bits)
    else if (firstDigit >= 2) firstDigitBits = 2; // 0010-0011 (2 bits)
    else firstDigitBits = 1;                       // 0001      (1 bit)
    
    // Total bits = (remaining hex digits × 4) + bits in first digit
    this._bits = (hexLen - 1) * 4 + firstDigitBits;
    
    return this._bits;
};

// Set the exponent to the binary bit length of the number - 1 and also
//  initialize this_bits;
// 
BigFloat.prototype._normalizeBits = function () {
    BigFloatStat._normalizeBits=(BigFloatStat._normalizeBits??0)+1;
    if (this._significand === 0n) {
        this._special = SPECIAL_ZERO;
        this._sign = 1;
        this._exponent = 0;
        this._significand = 0n;
        this._bits = 0;
        return this;
    }

    // Normalize so MSB corresponds to bit-length - 1
    const bitlen = this._bitlength(true); //_significand.toString(2).length;
    this._exponent += bitlen - 1;
    this._special=SPECIAL_NONE;
    // Keep full significand (no shift!)
    return this;
};

/* Not used anymore
// Extend significand to target precision by padding zeros
BigFloat.prototype._expandToTargetPrecision = function() {
    BigFloatStat._expandToTargetPrecision=(BigFloatStat._expandToTargetPrecision??0)+1;
    const actualBits = this._significand.toString(2).length;
    const targetBits = Math.ceil((this._precision+1) * Math.log2(10));
    
    if (actualBits >= targetBits) return this;  // Already at or above target
    
    const result = this.clone();
    const bitsToAdd = targetBits - actualBits;
    result._significand = this._significand << BigInt(bitsToAdd);
    // exponent stays the same    
    return result;
};
*/

// Compact BigFloat significant im place
BigFloat.prototype._compact = function() {
    BigFloatStat._compact=(BigFloatStat._compact??0)+1;
    let bits=0;
    for(;(this._significand & 1n) === 0n && this._significand > 0n; ++bits) 
        this._significand >>= 1n;
    this._bits -= bits;  // Reduce bits with the number of trailing zeros
    if(this._significand===0n)
        this._special=SPECIAL_ZERO;
  //  console.log(`Compact bit count= ${bits}\n`);
}

// CORRECTED _normalize() - respects this._rounding
BigFloat.prototype._normalize = function() {
    BigFloatStat._normalize = (BigFloatStat._normalize ?? 0) + 1;
    
    // Convert decimal precision to binary bits with guard bits
    const targetBits = Math.ceil((this._precision + 1) * 3.321928094887362);   
    const currentBits = this._bitlength(); // Use cached value
    
    if (currentBits <= targetBits) {
        this._special = this._significand === 0n ? SPECIAL_ZERO : SPECIAL_NONE;
        return this; // Already at or below target precision, nothing to do
    }
    
    // Need to round: we have too many bits
    const bitsToRemove = currentBits - targetBits;
    
    // Get the bits we're about to lose for rounding decision
    const mask = (1n << BigInt(bitsToRemove)) - 1n;
    const droppedBits = this._significand & mask;
    const halfWay = 1n << BigInt(bitsToRemove - 1);
    
    // Shift right to remove excess bits
    this._significand >>= BigInt(bitsToRemove);
    this._bits = targetBits;  // Update cache - we know the new size
    
    // ⭐ APPLY ROUNDING BASED ON this._rounding
    let roundUp = false;
    switch (this._rounding) {
//case ROUNDING_NEAREST:  // 0 - Round to nearest, ties to even
  //          roundUp = droppedBits > halfWay || 
//                      (droppedBits === halfWay && (this._significand & 1n) === 1n);
//            break;
        case ROUNDING_NEAREST:  // 0 - Round to nearest
            // Check only the first bit being dropped (bit at position bitsToRemove-1)
            const firstDroppedBit = 1n << BigInt(bitsToRemove - 1);
            roundUp = (droppedBits & firstDroppedBit) !== 0n;
            break;
        case ROUNDING_UP:  // 1 - Round towards +infinity (ceiling)
            // Round up if: positive and any bits dropped, OR negative and no bits dropped
            if (this._sign > 0) {
                roundUp = droppedBits > 0n;
            } else {
                roundUp = false;  // Negative numbers round towards zero (which is up for negatives)
            }
            break;
        case ROUNDING_DOWN:  // 2 - Round towards -infinity (floor)
            // Round up if: negative and any bits dropped
            if (this._sign < 0) {
                roundUp = droppedBits > 0n;
            } else {
                roundUp = false;  // Positive numbers round towards zero (which is down for positives)
            }
            break;
        case ROUNDING_ZERO:  // 3 - Round towards zero (truncate)
            // Never round up - just truncate
            roundUp = false;
            break;
        default:
            // Unknown rounding mode - default to nearest
            roundUp = droppedBits > halfWay || 
                      (droppedBits === halfWay && (this._significand & 1n) === 1n);
            break;
    }
    
    // Apply rounding if needed
    if (roundUp) {
        this._significand += 1n;
        
        // Check if rounding caused overflow
        const isPowerOf2 = (this._significand & (this._significand - 1n)) === 0n;
        
        if (isPowerOf2 && this._significand > (1n << BigInt(targetBits))) {
            // Overflow detected - gained an extra bit
            this._significand >>= 1n;
            this._exponent += 1;
            this._bits = targetBits;  // Still targetBits after shift
        } else {
            // No overflow or power of 2 within bounds
            this._bits = targetBits;
        }
    }
    
    this._special = this._significand === 0n ? SPECIAL_ZERO : SPECIAL_NONE;
    return this;
};


/////////////////////////////////////////////////////////////////
//
// Instance is... methods.
//      .isNaN()
//      .isFinite
//      .isInfinite()
//      .isZero()
//      .isInteger()
//      .isPositive
//      .isNegative()
//      .isEven()
//      .isOdd()
//
/////////////////////////////////////////////////////////////////

/**
 * Returns true if the value is NaN (Not a Number)
 * @returns {boolean}
 */
BigFloat.prototype.isNaN = function() {
    return this._special === SPECIAL_NAN;
};

/**
 * Returns true if the value is finite (not Infinity or NaN)
 * @returns {boolean}
 */
BigFloat.prototype.isFinite = function() {
    return this._special === SPECIAL_NONE || this._special === SPECIAL_ZERO;
};

/**
 * Returns true if the value is infinite (positive or negative infinity)
 * @returns {boolean}
 */
BigFloat.prototype.isInfinite = function() {
    return this._special === SPECIAL_INF;
};

/**
 * Returns true if the value is zero
 * @returns {boolean}
 */
BigFloat.prototype.isZero = function() {
    return this._special === SPECIAL_ZERO || this._significand === 0n;
};

/**
 * Returns true if the value is an integer (no fractional part)
 * @returns {boolean}
 */
BigFloat.prototype.isInteger = function() {
    if (this._special === SPECIAL_NAN || this._special === SPECIAL_INF) return false;
    if (this._special === SPECIAL_ZERO || this._significand === 0n) return true;
    
    // BigFloat stores: significand × 2^exponent
    // where significand has implicit leading 1: 1.fraction
    // 
    // For integer check, we need to see if all fractional bits are zero
    // 
    // The value is: significand × 2^exponent
    // If exponent >= bitLength - 1, then we're shifting left (integer)
    // If exponent < bitLength - 1, we need to check lower bits
    const bitLength = this._bitlength();
    
    // Number of bits to the right of the binary point
    // bitLength - 1 is the position of MSB (0-indexed from right)
    // exponent tells us where the binary point is
    // 
    // If exponent >= bitLength - 1: all bits are to left of point (integer)
    // If exponent < bitLength - 1: some bits are to right of point (fractional) 
    const fracBits = (bitLength - 1) - this._exponent;
    
    // If no fractional bits, it's an integer
    if (fracBits <= 0) return true;
    
    // Check if the fractional bits are all zero
    const mask = (1n << BigInt(fracBits)) - 1n;
    return (this._significand & mask) === 0n;
};

/**
 * Returns true if the value is positive (> 0)
 * @returns {boolean}
 */
BigFloat.prototype.isPositive = function() {
    if (this._special === SPECIAL_NAN) return false;
    if (this._special === SPECIAL_ZERO || this._significand === 0n) return false;
    return this._sign > 0;
};

/**
 * Returns true if the value is negative (< 0)
 * @returns {boolean}
 */
BigFloat.prototype.isNegative = function() {
    if (this._special === SPECIAL_NAN) return false;
    if (this._special === SPECIAL_ZERO || this._significand === 0n) return false;
    return this._sign < 0;
};

/**
 * Returns true if the value is an even integer
 * @returns {boolean}
 */
BigFloat.prototype.isEven = function() {
    if (!this.isInteger()) return false;
    if (this.isZero()) return true;  
    // Check the least significant bit
    return (this._significand & 1n) === 0n;
};

/**
 * Returns true if the value is an odd integer
 * @returns {boolean}
 */
BigFloat.prototype.isOdd = function() {
    if (!this.isInteger()) return false;
    if (this.isZero()) return false;
    // Check the least significant bit
    return (this._significand & 1n) === 1n;
};

/////////////////////////////////////////////////////////////////
//
// End of Instance .is... methods.
//      .isNaN()
//      .isFinite
//      .isInfinite()
//      .is.Zero()
//      .isInteger()
//      .isPositive
//      .isNegative()
//      .isEven()
//      .isOdd()
//
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//
// The output methods. .to... methods
//      .toNumber()
//      .toString(argument=10)
//      .toExponential(argument)
//      .toFixed(argument)
//      .toPrecision(argument)
//
/////////////////////////////////////////////////////////////////

// Convert BigFloat to JavaScript 64-bit float (Number)
// Preserves as much accuracy as possible (up to 53 bits of precision)
BigFloat.prototype.toNumber = function() {
    BigFloatStat._toNumber=(BigFloatStat._toNumber??0)+1;
    // Handle special cases
    if (this._special === SPECIAL_NAN) return NaN;
    if (this._special === SPECIAL_INF) return this._sign > 0 ? Infinity : -Infinity;
    if (this._special === SPECIAL_ZERO || this._significand === 0n) 
        return this._sign > 0 ? 0 : -0;
    
    const bitLen = this._bitlength();
    
    // Extract top 53 bits of significand
    const shift = Math.max(0, bitLen - 53);
    const mantissa = Number(this._significand >> BigInt(shift));
    
    // CRITICAL: BigFloat uses hidden-bit normalization
    // significand represents 1.fraction in binary
    // So the actual value is: (1 + fraction) × 2^exponent
    // where fraction = significand / 2^bitLen
    //
    // But we extract mantissa which still has the leading 1 bit
    // So mantissa represents the full significand with leading bit
    // mantissa has (bitLen - shift) bits
    //
    // To get the normalized value [1, 2):
    // normalized = mantissa / 2^(bitLen - shift - 1)
    //
    // Then: value = normalized × 2^exponent
    //             = (mantissa / 2^(bitLen - shift - 1)) × 2^exponent
    //             = mantissa × 2^(exponent - (bitLen - shift - 1))
    //             = mantissa × 2^(exponent - bitLen + shift + 1) 
    const mantissaBits = bitLen - shift;
    const effectiveExponent = this._exponent - mantissaBits + 1;
    
    // Check for overflow/underflow
    if (effectiveExponent > 1023) 
        return this._sign > 0 ? Infinity : -Infinity;
    if (effectiveExponent < -1074) 
        return this._sign > 0 ? 0 : -0;
    
    const result = mantissa * Math.pow(2, effectiveExponent);
    return this._sign > 0 ? result : -result;
};

/**
 * BigFloat.prototype.toBigInt()
 * Converts a BigFloat to a JavaScript BigInt
 * 
 * Returns the integer part of the BigFloat as a BigInt.
 * This is equivalent to truncating toward zero (like trunc()).
 * 
 * @returns {BigInt} The integer part of the value
 * @throws {RangeError} If the value is NaN or Infinity
 * 
 * Examples:
 *   BigFloat(123.456).toBigInt() => 123n
 *   BigFloat(-123.456).toBigInt() => -123n
 *   BigFloat(1.5e20).toBigInt() => 150000000000000000000n
 */
BigFloat.prototype.toBigInt = function() {
    BigFloatStat._toBigInt=(BigFloatStat._toBigInt??0)+1;
    // Handle special cases
    if (this._special === SPECIAL_NAN) 
        throw new RangeError('Cannot convert NaN to BigInt');
    if (this._special === SPECIAL_INF) 
        throw new RangeError('Cannot convert Infinity to BigInt');
    if (this._special === SPECIAL_ZERO || this._significand === 0n) 
        return 0n;
    
    // Get the integer part using trunc
    const truncated = BigFloat.trunc(this);
    
    // Now convert the truncated BigFloat to BigInt
    // The truncated number has no fractional part, so we need to scale
    // the significand by the exponent
    const bitlen = truncated._bitlength();
    const effExp = truncated._exponent - (bitlen - 1);
    
    let result;
    
    if (effExp >= 0) {
        // Positive exponent: shift left
        result = truncated._significand << BigInt(effExp);
    } else {
        // Negative exponent: shift right (should not happen after trunc, but handle it)
        result = truncated._significand >> BigInt(-effExp);
    }
    
    // Apply sign
    if (truncated._sign < 0) 
        result = -result;
    return result;
};

/**
 * Complete corrected BigFloat.prototype.toString() function
 * 
 * Fixes:
 * 1. Proper exp10 calculation for numbers with leading zeros after decimal
 * 2. Handle rounding overflow (999...→1000...) with exponent adjustment
 */

BigFloat.prototype.toString = function(base = 10) {
    BigFloatStat._toString = (BigFloatStat._toString ?? 0) + 1;
    const tstart= performance.now(); // Timing start
   
    const do_toString = () =>  {
    if (this._special != SPECIAL_NONE && this._special != SPECIAL_ZERO)
        return BigFloat.specialToString(this._special);
    if (this._significand === BigInt(0)) 
        return "0";
    
    // Handle both base 2 and base 16 with same code
    if (base === 2 || base === 16) {
        const sign = this._sign < 0 ? "-" : "";
        const digits = this._significand.toString(base);
        if (digits.length === 1) 
            return `${sign}${digits} * 2^${this._exponent}`;
        return `${sign}${digits[0]}.${digits.substring(1)} * 2^${this._exponent}`;
    }
    
    if (base === 10) {
        const sign = this._sign < 0 ? "-" : "";
        const bitLength = this._bitlength();
        const effectiveExponent = this._exponent - bitLength + 1;
        
        // Convert to decimal string with extra precision
        let fullDecimalStr;
        
        if (effectiveExponent >= 0) {
            const value = this._significand * (BigInt(1) << BigInt(effectiveExponent));
            fullDecimalStr = value.toString(10);
            
        } else {
            const denomShift = -effectiveExponent;
            const intPart = this._significand >> BigInt(denomShift);
            const mask = (BigInt(1) << BigInt(denomShift)) - BigInt(1);
            const fracNumerator = this._significand & mask;
            
            if (fracNumerator === BigInt(0)) {
                fullDecimalStr = intPart.toString(10);
            } else {
                const minForBinary = Math.ceil(denomShift * 0.30103);
const minForPrecision = this._precision + 5;
                const fracDigitsNeeded = Math.ceil(denomShift * 0.30103) + this._precision + 5;
                const denom = 1n << BigInt(denomShift);
                const scaled = fracNumerator * (10n ** BigInt(fracDigitsNeeded));
                let fracValue = (scaled + denom / 2n) / denom; // Round to nearest
                let fracDecimal = fracValue.toString(10).padStart(fracDigitsNeeded, '0');
                fullDecimalStr = intPart.toString(10) + "." + fracDecimal;
            }
        }
        
        // Now round fullDecimalStr to this._precision + 1 significant digits
        const decimalPos = fullDecimalStr.indexOf('.');
        
        // Extract all digits (removing decimal point)
        let allDigits = fullDecimalStr.replace('.', '');
        
        // Find first non-zero digit
        const firstNonZeroIdx = allDigits.search(/[1-9]/);
        if (firstNonZeroIdx < 0) 
            return sign + "0";
    
        // Significant digits start from first non-zero
        const significantDigits = allDigits.substring(firstNonZeroIdx);
        // Round to this._precision + 1 significant digits
        let roundedDigits;
        let expAdjustment = 0;  // Track if rounding causes exponent change
        
        if (significantDigits.length <= this._precision + 1) {
            roundedDigits = significantDigits;
        } else {
            // Need to round
            const digitToRound = parseInt(significantDigits[this._precision + 1]);
            let digitsToKeep = significantDigits.substring(0, this._precision + 1);
            
            if (digitToRound >= 5) {
                // Round up
                const asNumber = BigInt(digitsToKeep) + BigInt(1);
                roundedDigits = asNumber.toString();
                
                // Check if rounding added a digit (e.g., 999 + 1 = 1000)
                if (roundedDigits.length > this._precision + 1) {
                    // Overflow! We gained a digit, exponent increases by 1
                    expAdjustment = 1;
                    // Keep only the required number of digits
                    roundedDigits = roundedDigits.substring(0, this._precision + 1);
                }
            } else {
                roundedDigits = digitsToKeep;
            }
        }
        
        // Calculate the decimal exponent
        let exp10;
        if (decimalPos < 0) {
            // No decimal point - it's an integer
            exp10 = allDigits.length - firstNonZeroIdx - 1;
        } else {
            // Has decimal point - find where first non-zero is in original string
            const firstNonZeroInOriginal = fullDecimalStr.search(/[1-9]/);
            
            if (firstNonZeroInOriginal < decimalPos) {
                // First non-zero is before the decimal point
                exp10 = decimalPos - firstNonZeroInOriginal - 1;
            } else {
                // First non-zero is after the decimal point
                exp10 = -(firstNonZeroInOriginal - decimalPos);
            }
        }
        
        // Apply the adjustment from rounding overflow
        exp10 += expAdjustment;
        // Format as scientific notation
        if (roundedDigits.length === 1) 
            return sign + roundedDigits + "e" + (exp10 >= 0 ? "+" : "") + exp10;
        
        let mantissa = roundedDigits[0] + "." + roundedDigits.substring(1);
        // Remove trailing zeros
        mantissa = mantissa.replace(/\.?0+$/, '');
        return sign + mantissa + "e" + (exp10 >= 0 ? "+" : "") + exp10;
     }
    
    throw new Error(`Base ${base} not supported`);
    }
    
    const tostr = do_toString()
    const t = performance.now() - tstart;
    BigFloatStat2._toString = (BigFloatStat2._toString ?? (t)) + (t);
    return tostr;
};

    
BigFloat.prototype.toExponential = function(Digits) {
     BigFloatStat._toExponential=(BigFloatStat._toExponential??0)+1;
    // If fractionDigits not specified, use current precision - 1
    let fractionDigits = Digits;
    if (fractionDigits === undefined) {
        fractionDigits = this._precision;
    }
    // Handle special case
    if (this._significand === 0n) {
        return "0." + "0".repeat(fractionDigits) + "e+0";
    }
    
    // fractionDigits is digits after decimal point
    // Total significant digits = fractionDigits + 1 (for the leading digit)
    const targetPrecision = fractionDigits + 1;
    
    // Create a new BigFloat with the target precision
    const rounded = new BigFloat(0, targetPrecision);
    rounded._sign = this._sign;
    rounded._significand = this._significand;
    rounded._exponent = this._exponent;
    rounded._normalize();
    
    // Use toString() to get the exponential format
    let result = rounded.toString(10);
    if(Digits===undefined)
        return result;
    
    // Pad with zeros if needed
    // Format is: [-]d.ddd...e[+/-]exp
    const eIndex = result.indexOf('e');
    if (eIndex === -1) {
        // Shouldn't happen with current toString(), but handle it
        return result;
    }
    
    const mantissaPart = result.substring(0, eIndex);
    const exponentPart = result.substring(eIndex);
    
    // Check if we need padding
    const dotIndex = mantissaPart.indexOf('.');
    
    if (dotIndex === -1) {
        // No decimal point, need to add it and all the zeros
        // e.g., "2e+0" with fractionDigits=3 -> "2.000e+0"
        if (fractionDigits > 0) {
            return mantissaPart + "." + "0".repeat(fractionDigits) + exponentPart;
        } else {
            return result;
        }
    } else {
        // Has decimal point, check if we need more zeros
        const currentFractionDigits = mantissaPart.length - dotIndex - 1;
        if (currentFractionDigits < fractionDigits) {
            const zerosNeeded = fractionDigits - currentFractionDigits;
            return mantissaPart + "0".repeat(zerosNeeded) + exponentPart;
        } else {
            return result;
        }
    }
};

BigFloat.prototype.toFixed = function(fractionDigits) {
     BigFloatStat._toFixed=(BigFloatStat._toFixed??0)+1;
    // Default to 0 fraction digits if not specified
    if (fractionDigits === undefined) {
        fractionDigits = 0;
    }
    
    // Handle special case
    if (this._significand === 0n) {
        if (fractionDigits === 0) 
            return "0";
        return "0." + "0".repeat(fractionDigits);
    }
    
    const sign = this._sign < 0 ? "-" : "";
    
    // Get exponential format from toString()
    // We need enough precision to cover the requested fraction digits
    // Create a temporary BigFloat with high enough precision
    const temp = new BigFloat(0, this._precision);
    temp._sign = this._sign;
    temp._significand = this._significand;
    temp._exponent = this._exponent;
    
    let expStr = temp.toString(10);
    
    // Parse the exponential format: [-]d.ddde[+/-]exp
    // Remove sign for processing
    expStr = expStr.replace(/^-/, '');
    
    const eIndex = expStr.indexOf('e');
    if (eIndex === -1) {
        // Shouldn't happen, but handle it
        return sign + expStr;
    }
    
    let mantissa = expStr.substring(0, eIndex);
    const exponentPart = expStr.substring(eIndex + 1);
    const exponent = parseInt(exponentPart);
    
    // Remove decimal point from mantissa to get all digits
    const dotIndex = mantissa.indexOf('.');
    let allDigits;
    if (dotIndex === -1) {
        allDigits = mantissa;
    } else {
        allDigits = mantissa.substring(0, dotIndex) + mantissa.substring(dotIndex + 1);
    }
    
    // The exponent tells us where the decimal point should be
    // exponent = 0 means: d.ddd (decimal after first digit)
    // exponent = 2 means: ddd.ddd (decimal after 3rd digit)
    // exponent = -2 means: 0.00d.ddd (decimal before first digit with 2 leading zeros)
    
    const decimalPosition = exponent + 1; // Position after this many digits
    
    let integerPart;
    let fractionalPart;
    
    if (decimalPosition <= 0) {
        // Number is < 1, need leading zeros
        // e.g., 2.5e-2 = 0.025
        integerPart = "0";
        fractionalPart = "0".repeat(-decimalPosition) + allDigits;
    } else if (decimalPosition >= allDigits.length) {
        // Number is an integer or needs trailing zeros
        // e.g., 2.5e+2 = 250
        integerPart = allDigits + "0".repeat(decimalPosition - allDigits.length);
        fractionalPart = "";
    } else {
        // Decimal point is within the digits
        integerPart = allDigits.substring(0, decimalPosition);
        fractionalPart = allDigits.substring(decimalPosition);
    }
    
    // Now adjust fractionalPart to match fractionDigits
    if (fractionalPart.length < fractionDigits) {
        // Pad with zeros
        fractionalPart = fractionalPart + "0".repeat(fractionDigits - fractionalPart.length);
    } else if (fractionalPart.length > fractionDigits) {
        // Need to round
        const digitToCheck = parseInt(fractionalPart[fractionDigits]);
        fractionalPart = fractionalPart.substring(0, fractionDigits);
        
        if (digitToCheck >= 5) {
            // Round up - need to handle carry
            if (fractionDigits === 0) {
                // Rounding affects integer part
                integerPart = (BigInt(integerPart) + 1n).toString();
            } else {
                const fracValue = BigInt(fractionalPart) + 1n;
                fractionalPart = fracValue.toString().padStart(fractionDigits, '0');
                
                // Check for overflow (e.g., 999 + 1 = 1000)
                if (fractionalPart.length > fractionDigits) {
                    integerPart = (BigInt(integerPart) + 1n).toString();
                    fractionalPart = "0".repeat(fractionDigits);
                }
            }
        }
    }
    
    // Format result
    if (fractionDigits === 0) 
        return sign + integerPart;
    else 
        return sign + integerPart + "." + fractionalPart;
};

BigFloat.prototype.toPrecision = function(precision) {
    // If precision is undefined, use toString() behavior
     BigFloatStat._toPrecision=(BigFloatStat._toPrecision??0)+1;
    if (precision === undefined) 
        return this.toString(10);
    
    // Handle special case
    if (this._significand === 0n) {
        if (precision === 1) 
            return "0";
        return "0." + "0".repeat(precision - 1);
    }
    
    // Get the exponent to determine magnitude
    // Use toString() to get the exponential form
    const temp = new BigFloat(0, this._precision);
    temp._sign = this._sign;
    temp._significand = this._significand;
    temp._exponent = this._exponent;
    
    const expStr = temp.toString(10);
    
    // Parse exponent from string: d.ddde[+/-]exp
    const eIndex = expStr.indexOf('e');
    const exponentPart = expStr.substring(eIndex + 1);
    const exp10 = parseInt(exponentPart);
    
    // JavaScript's rule for toPrecision:
    // - Use exponential if: exp10 < -6 or exp10 >= precision
    // - Use fixed otherwise
    
    if (exp10 < -6 || exp10 >= precision) {
        // Use exponential notation
        // precision is total significant digits, so fractionDigits = precision - 1
        return this.toExponential(precision - 1);
    } else {
        // Use fixed notation
        // Need to calculate how many fraction digits
        // exp10 tells us position: exp10=0 means "d.ddd", exp10=2 means "ddd.d"
        // Integer digits = exp10 + 1
        // Fraction digits = precision - (exp10 + 1)
        const integerDigits = exp10 + 1;
        const fractionDigits = precision - integerDigits;
        return this.toFixed(fractionDigits);
    }
};

/////////////////////////////////////////////////////////////////
//
// END of the output methods.
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Arithmetic prototypes & functions
//  .assign(argument)   - Assign the argument to this 
//  add(a,b)            - Return a+b
//  sub(a,b)            - Return a-b
//  mul(a,b)            - Return a*b
//  div(a,b)            - Return a/b
//  mod(a,b)            - Return a%b
//  inverse(b)          - Return 1/b
//  neg(a)              - Return -a
//
////////////////////////////////////////////////////////////////

// Assignment 
BigFloat.prototype.assign = function (a) {
    if (!(a instanceof BigFloat)) 
        throw new TypeError("assign() requires a BigFloat instance");

    BigFloatStat.assign=(BigFloatStat.assign??0)+1;
    this._sign = a._sign;
    this._exponent = a._exponent;
    this._significand = a._significand;
    this._special = a._special ?? null;
    this._bits = a._bits;

    // Retain this.precision and this._rounding (do not overwrite)
    // Re-normalize only if precision mismatch
    if (this._precision !== a._precision) 
        this._normalize();
    return this;
};

//
// Arithmetic operators +,-,*,/ and 1/x
//
// Arithmetic add(lhs,rhs)
BigFloat.add = function (a, b) {
    // Convert to BigFloat if needed (efficient)
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (!(b instanceof BigFloat)) b = new BigFloat(b);
    
    BigFloatStat.add = (BigFloatStat.add ?? 0) + 1;
    
    // Handle specials
    if (a._special || b._special) {
        if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN) return new BigFloat(NaN);
        if (a._special === SPECIAL_INF && b._special === SPECIAL_INF) {
            return a._sign === b._sign ? new BigFloat(a) : new BigFloat(NaN);
        }
        if (a._special === SPECIAL_INF) return new BigFloat(a);
        if (b._special === SPECIAL_INF) return new BigFloat(b);
        if (a._special === SPECIAL_ZERO) return new BigFloat(b);
        if (b._special === SPECIAL_ZERO) return new BigFloat(a);
    }
    
    const workPrec = Math.max(a._precision, b._precision);
    
    // Work with compact representations
    let x_sig = a._significand;
    let y_sig = b._significand;
    let x_exp = a._exponent;
    let y_exp = b._exponent;
    let x_sign = a._sign;
    let y_sign = b._sign;
    
    // CRITICAL FIX: Use _bitlength() method, not toString(2).length!
    const bitlenX = a._bitlength();
    const bitlenY = b._bitlength();
    
    // Calculate effective exponents (LSB position)
    let effExpX = x_exp - (bitlenX - 1);
    let effExpY = y_exp - (bitlenY - 1);
    // Align to the SMALLER effective exponent
    /* Optimizing below but doesnt work so commented until later
    let commonEffExp;
    const maxShift = Math.ceil((workPrec + 10) * 3.322); // Allow some guard bits

    if (effExpX > effExpY) {
        const d = effExpX - effExpY;
        if (d > maxShift) {
            // y is too small to affect the result at working precision
            let result = new BigFloat(a);
            result._precision=workPrec;
            return result._normalize();
        }
        x_sig <<= BigInt(d);
        commonEffExp = effExpY;
    } else if (effExpY > effExpX) {
        const d = effExpY - effExpX;
        if (d > maxShift) {
            // x is too small to affect the result at working precision
            let result = new BigFloat(b);
            result._precision=workPrec;
            return result._normalize();
        }
        y_sig <<= BigInt(d);
        commonEffExp = effExpX;
    } else {
        commonEffExp = effExpX;
    }
    */
    
    // Align to the SMALLER effective exponent
    let commonEffExp;
    if (effExpX > effExpY) {
        const d = effExpX - effExpY;
        x_sig <<= BigInt(d);
        commonEffExp = effExpY;
    } else if (effExpY > effExpX) {
        const d = effExpY - effExpX;
        y_sig <<= BigInt(d);
        commonEffExp = effExpX;
    } else {
        commonEffExp = effExpX;
    }
    
    // Signed addition
    let sumSig = BigInt(x_sign) * x_sig + BigInt(y_sign) * y_sig;
    if (sumSig === 0n) {
        const r = new BigFloat(0n);
        return r;
    }
    
    const result = new BigFloat(0n);
    result._sign = sumSig < 0n ? -1 : 1;
    sumSig = sumSig < 0n ? -sumSig : sumSig;
    result._significand = sumSig;
    const bitlenR = result._bitlength();
    result._exponent = commonEffExp + (bitlenR - 1);
    result._precision = workPrec;
    result._rounding = a._rounding;
    if(result._significand != 0n)
        result._special=SPECIAL_NONE;
    return result._normalize();
};

// Arithmetic subtract
BigFloat.sub = function (a, b) {
    // Convert to BigFloat if needed (efficient)
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (!(b instanceof BigFloat)) b = new BigFloat(b);
    BigFloatStat.sub=(BigFloatStat.sub??0)+1;

    // Clone b and flip its sign
    const negB = new BigFloat(b);
    negB._sign = -negB._sign;

    // Use existing addition logic. add() will ensure that subtraction is done at
    // the maximum precision of the operands
    return BigFloat.add(a, negB);
};

// Arithmetic multiply
BigFloat.mul = function (a, b) {
    a = (a instanceof BigFloat) ? a : new BigFloat(a);
    b = (b instanceof BigFloat) ? b : new BigFloat(b);
    BigFloatStat.mul=(BigFloatStat.mul??0)+1;
    // Handle special cases
    if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (a._special === SPECIAL_ZERO || b._special === SPECIAL_ZERO) return new BigFloat(0);
    if (a._special === SPECIAL_INF || b._special === SPECIAL_INF) {
        const sign = a._sign * b._sign;
        return new BigFloat(sign > 0 ? Infinity : -Infinity);
    }
    
    // Work with compact representations - NO expansion!
    const product = new BigFloat();
    product._sign = a._sign * b._sign;
    product._significand = a._significand * b._significand;
    product._exponent = a._exponent + b._exponent;
    product._precision = Math.max(a._precision, b._precision);
    product._rounding = a._rounding;
    if(product._significand!=0n)
        product._special=SPECIAL_NONE;
    
    // Check if multiplication produced an extra bit (carry)
    const aBits = a._bitlength(); //_significand.toString(2).length;
    const bBits = b._bitlength(); //_significand.toString(2).length;
    const productBits = product._bitlength(); //_significand.toString(2).length;
    const expectedBits = aBits + bBits - 1;
    
    if (productBits > expectedBits) 
        product._exponent += 1;
    
    return product._normalize();
};


/**
 * Compute the multiplicative inverse 1/a using Newton iteration.
 * The precision doubles each step until target precision is reached.
 */
BigFloat.inverse = function (a) {
    BigFloatStat.inverse=(BigFloatStat.inverse??0)+1;
    const tstart = performance.now(); // Timing start
    
    do_inverse = () => { 
        // Convert to BigFloat if needed (efficient)
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (a._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (a._special === SPECIAL_ZERO) return new BigFloat(Infinity);
    if (a._special === SPECIAL_INF) return new BigFloat(0n);
    if (a._significand === 0n) return new BigFloat(Infinity);
    
    const prec = a._precision;
    const extra = 5;                       // guard digits
    const workPrec = prec + extra;
    const bitPrec = Math.ceil((prec+1) * Math.log2(10));

    // Copy of |a| with exponent reset for iteration
    let v = new BigFloat(a);
    v._sign = 1;
    v._precision = workPrec;
    v._exponent =0; // Normalize to [1..2)
    
    // Initial double-based approximation with out the exponent
    let fv = v.toNumber(); 
    if (!Number.isFinite(fv) || fv === 0) return new BigFloat(Infinity);
    let invStart = 1 / fv;
    let u = new BigFloat(invStart, workPrec); 

    const two = new BigFloat(2);
    const one = new BigFloat(1);
    let r = new BigFloat(0n,workPrec);
    
    let loopCnt=1;
    // Newton iteration: u = u * (2 - a * u)
    // each iteration roughly doubles correct digits
    for (;;++loopCnt) {
        // r = 2 - v * u
        r=BigFloat.mul(v, u);
        r=BigFloat.sub(two, r);
        // u = u * r
        u=BigFloat.mul(u, r);
        r=BigFloat.sub(r,one);
        if (r._significand === 0n) 
            break;
        if (r._exponent < -bitPrec) 
            break;  // converged
    }

    // Adjust for original exponent: 1/a = u * 2^(-a._exponent)
    u._exponent -= a._exponent;
    u._sign = a._sign;        
    u._precision = prec;
    //  u.dump2Console('result u', false); // DEBUG
    u._normalize();
    return u;
    }
    
    const r = do_inverse();
    const t = performance.now()-tstart; // Timing end
    BigFloatStat2.inverse=(BigFloatStat2.inverse??(t))+(t);
    return r;
};

// Arithmetic division
// the result is always with the maximum precisio of the two operands]
BigFloat.div = function (a, b) {
    BigFloatStat.div = (BigFloatStat.div ?? 0) + 1;
    // Convert to BigFloat if needed (efficient)
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (!(b instanceof BigFloat)) b = new BigFloat(b);
    // ensure max precision of the arguments.

    // Handle special cases
    if (b._special === SPECIAL_ZERO) return new BigFloat(Infinity);
    if (b._special === SPECIAL_INF) return new BigFloat(0n);
    if (a._special || b._special) 
        if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN) return new BigFloat(NaN);
      
    const prec = Math.max(a._precision,b._precision);
    
     // Special case: b is exactly 1
    if (b._exponent === 0 && b._significand === 1n) 
        {// a / 1 = a
        const result = new BigFloat(a);
        result._precision = prec;
        return result;
    }
    
    let inv = b;
    inv._precision = prec;  
    
    // Special case: a is exactly 1
    if (a._exponent === 0 && a._significand === 1n) 
        // 1 / b = inverse(invB)
        return BigFloat.inverse(inv); // No normalization needed!
    
    // Check if BOTH a and b are powers of 2 (ultra fast!)
    if (a._significand === 1n && b._significand === 1n) {
        // a = 2^exp_a, b = 2^exp_b
        // a / b = 2^(exp_a - exp_b)
        const result = new BigFloat(1n, prec, a._rounding);
        result._exponent = a._exponent - b._exponent;
        result._sign = a._sign * b._sign;
        return result;  // No normalization needed!
    }
    
    // Check if b is a power of 2 (very fast!)
    if (b._significand === 1n) {
        // b = 2^exponent, so division is just exponent subtraction
        const result = new BigFloat(a);
        result._precision = prec;
        result._exponent -= b._exponent;
        result._sign = a._sign * b._sign;
        return result;  // No normalization needed!
    }
    
    // Check if a is a power of 2 (fast!)
    if (a._significand === 1n) {
        // a = 2^exp_a
        // a / b = 2^exp_a * (1/b)
        inv = BigFloat.inverse(inv);
        inv._exponent += a._exponent;
        inv._sign = a._sign * inv._sign;
        return inv;  // inverse already normalized
    }
    
    // General case: a / b = a * (1 / b)
    //inv._precision += 2;
    inv = BigFloat.inverse(inv);
    let result = BigFloat.mul(a, inv);
   // result._precision = prec;
    return result;
};

// Negate the value. No need to normalize()
BigFloat.neg = function (a) {
    BigFloatStat.neg=(BigFloatStat.neg??0)+1;
    // Convert to BigFloat if needed (efficient)
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    var res = new BigFloat(a);
    if( res._special===SPECIAL_ZERO||res._significand===0n)
        return res;
    if( res._special===SPECIAL_INF||res._special===SPECIAL_NONE)
        res._sign *= -1;  // Flip sign
    return res;
};


/**
 * BigFloat.sqrt(y) - Division-Free Implementation
 * Computes square root using Newton's method on reciprocal square root.
 * 
 * Algorithm:
 * 1. Find x ≈ 1/√y using: x_{n+1} = (x_n/2)(3 - y*x_n²)
 * 2. Then √y = y * x
 * 
 * This avoids division (only uses multiplications), which is much faster
 * for arbitrary precision arithmetic.
 * 
 * Mathematical derivation:
 * - To find 1/√y, solve: f(x) = 1/x² - y = 0
 * - f'(x) = -2/x³
 * - Newton: x_{n+1} = x_n - f(x_n)/f'(x_n)
 *                    = x_n - (1/x_n² - y)/(-2/x_n³)
 *                    = (x_n/2)(3 - y*x_n²)
 * 
 * @param {BigFloat} y - The value to take square root of
 * @returns {BigFloat} - Square root of y
 */
BigFloat.sqrt = function (y) {
    const tstart = performance.now(); // Timing start
    BigFloatStat.sqrt=(BigFloatStat.sqrt??0)+1;
    
    const do_sqrt = () => {
    // Convert to BigFloat if needed (efficient)
    if (!(y instanceof BigFloat)) y = new BigFloat(y);
   
    // Handle special cases
    if (y._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (y._special === SPECIAL_ZERO) return new BigFloat(0n);
    if (y._special === SPECIAL_INF) 
        return y._sign > 0 ? new BigFloat(Infinity) : new BigFloat(NaN);
    // Negative numbers have no real square root
    if (y._sign < 0) return new BigFloat(NaN);
    // Handle perfect case: sqrt(1) = 1
    if (y._significand === 1n && y._exponent === 0)  
        return new BigFloat(1n, y._precision, y._rounding);
    
    // Perfect powers of 2 with even exponent
    // Since normalized: significand=1n means the value is exactly 2^exponent
    if (y._significand === 1n && y._exponent % 2 === 0) {
        const result = new BigFloat(y);
        result._exponent = y._exponent / 2;
        return result;
    }
    
    const prec = y._precision;
    const extra = 5;  // guard digits
    const workPrec = prec + extra;
    const targetPrec = Math.ceil((prec+1) * Math.log2(10));
    
    // ========== Smart normalization for initial guess ==========
    // 
    // Key insight: 1/√(a × 2^exp) = (1/√a) × 2^(-exp/2)
    //              √(a × 2^exp) = √a × 2^(exp/2)
    //
    // FIXED: Use y._exponent directly as the binary exponent
    const exp = y._exponent;  // ← CORRECTED: This IS the binary exponent!
    // Split exponent into even and odd parts
    const expHalf = Math.floor(exp / 2);
    const expRemainder = exp - (expHalf * 2);  // Always 0 or 1, never -1
    
    // Create normalized copy with adjusted exponent
    let normalized = new BigFloat(y);
    normalized._precision = workPrec;
    normalized._exponent = expRemainder;  // 0 if even, 1 if odd
    
    // This gives us a value in range:
    // - [significand × 2^0, significand × 2^0) ≈ [1, 2) if exp was even
    // - [significand × 2^1, significand × 2^1) ≈ [2, 4) if exp was odd
    
    // Get initial guess using JavaScript
    const normalizedFloat = normalized.toNumber();
    if (!Number.isFinite(normalizedFloat) || normalizedFloat === 0) 
        return new BigFloat(NaN);
    
    // Initial guess: 1/√(normalized)
    const initialRecipSqrt = 1.0 / Math.sqrt(normalizedFloat);
    let x = new BigFloat(initialRecipSqrt, workPrec);
    
    // ========== Newton iteration (division-free!) ==========
    //
    // Iteration: x_{n+1} = (x_n)*0.5*(3 - y*x_n²)
    //
    // This computes 1/√normalized without any division operations!
    const three = new BigFloat(3); 
    const one = new BigFloat(1);
    let loopCnt=1;
    for (; ; ++loopCnt) {
        // Calculate x_n²
        const xSquared = BigFloat.mul(x, x);
        // Calculate normalized * x_n²
        const yxSquared = BigFloat.mul(normalized, xSquared);
        // Calculate (3 - normalized*x_n²)
        let r = BigFloat.sub(three, yxSquared);
        r._exponent -= 1; // Multiply with 0.5. term -> 1 when converging
        // Calculate x_n * (3 - normalized*x_n²)
        x=BigFloat.mul(x, r);
        // Calculate x_{n+1} = (x_n)0.5(3 - normalized*x_n²)
    
        // Check convergence: r < epsilon
        r=(BigFloat.sub(r,one));
        if (r._significand === 0n) 
            break;
        if (r._exponent < -targetPrec) 
            break;  // converged
        }
    
    // ========== Compute √y = y * (1/√y) ==========
    //
    // Now x ≈ 1/√normalized
    // So √normalized = normalized * x
    let result = BigFloat.mul(normalized, x);
    
    // ========== Scale back to original magnitude ==========
    //
    // We computed √(y with exponent = expRemainder)
    // Now add back expHalf to get √(original y)
    result._exponent += expHalf;
    result._precision = prec;
    result._normalize();
    return result;
    }
    
    const r = do_sqrt();
    const t = performance.now()-tstart; // Timing end
    BigFloatStat2.sqrt=(BigFloatStat2.sqrt??(t))+(t);
    return r;
};

// Prototype method for convenience
BigFloat.prototype.sqrt = function() {
    return BigFloat.sqrt(this);
};

////////////////////////////////////////////////////////////////
//
// END Arithmetic prototypes & functions
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Comparison functions
//  equal(a,b)            - Return a==b
//  notequal(a,b)         - Return a!=b
//  less(a,b)             - Return a<b
//  lessequal(a,b)        - Return a<=b
//  greater(a,b)          - Return a>b
//  greaterequal(a,b)     - Return a>=b
//
////////////////////////////////////////////////////////////////

// == operator
BigFloat.equal = function (a, b) {
    a = (a instanceof BigFloat) ? a : BigFloat.parseBigFloat(String(a));
    b = (b instanceof BigFloat) ? b : BigFloat.parseBigFloat(String(b));
    BigFloatStat.equal=(BigFloatStat.equal??0)+1;
    // NaN compares false
    if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN) return false;

    // Zero equality (treat -0 == +0)
    if (a._special === SPECIAL_ZERO && b._special === SPECIAL_ZERO) return true;

    // Infinity equality
    if (a._special === SPECIAL_INF && b._special === SPECIAL_INF)
        return a._sign === b._sign;

    return (
        a._sign === b._sign &&
        a._exponent === b._exponent &&
        a._significand === b._significand
    );
};

/**
 * FINAL CORRECTED BigFloat.less() function
 * 
 * The issue: When both numbers have the same raw exponent but different bit lengths,
 * we can't just compare significands directly!
 * 
 * Example:
 *   a: sig=25769803775 (35 bits), exp=0 → value = sig × 2^(0-35+1) = sig × 2^-34
 *   b: sig=3 (2 bits), exp=0 → value = sig × 2^(0-2+1) = sig × 2^-1
 * 
 * Solution: Always normalize to compare at the same effective exponent (exp - bitlen + 1)
 */
BigFloat.less = function (a, b) {
    a = (a instanceof BigFloat) ? a : new BigFloat(a);
    b = (b instanceof BigFloat) ? b : new BigFloat(b);
    BigFloatStat.less = (BigFloatStat.less ?? 0) + 1;
    
    // NaN: always false
    if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN) return false;

    // Handle sign differences
    if (a._sign < b._sign) return true;
    if (a._sign > b._sign) return false;

    // Now both same sign
    const sign = a._sign; // +1 or -1

    // Handle infinities
    if (a._special === SPECIAL_INF && b._special === SPECIAL_INF) return false;
    if (a._special === SPECIAL_INF) return sign < 0;  // -inf < any finite
    if (b._special === SPECIAL_INF) return sign > 0;  // finite < +inf

    // Handle zeros
    if (a._special === SPECIAL_ZERO && b._special === SPECIAL_ZERO) return false;
    if (a._special === SPECIAL_ZERO) return sign > 0; // 0 < positive b
    if (b._special === SPECIAL_ZERO) return sign < 0; // negative a < 0

    // The value of a BigFloat is: significand × 2^(exponent - bitlength + 1)
    // 
    // To compare two BigFloats, we need to compare:
    //   a_sig × 2^(a_exp - a_bitlen + 1)  vs  b_sig × 2^(b_exp - b_bitlen + 1)
    //
    // This is equivalent to comparing at a common exponent base:
    //   a_sig × 2^(a_exp - a_bitlen)  vs  b_sig × 2^(b_exp - b_bitlen)
    //
    // Bring to common base by using the minimum (most negative) effective exponent
    
    const bitLenA = a._bitlength();
    const bitLenB = b._bitlength();
    
    const effExpA = a._exponent - bitLenA + 1;
    const effExpB = b._exponent - bitLenB + 1;
    
    // Use the smaller (more negative) effective exponent as common base
    const commonEffExp = Math.min(effExpA, effExpB);
    
    // Scale significands: multiply by 2^(effExp - commonEffExp)
    const scaleA = effExpA - commonEffExp;
    const scaleB = effExpB - commonEffExp;
    
    let scaledSigA = a._significand << BigInt(scaleA);
    let scaledSigB = b._significand << BigInt(scaleB);
    
    // Now compare the scaled significands
    if (scaledSigA !== scaledSigB) {
        return sign > 0
            ? scaledSigA < scaledSigB
            : scaledSigA > scaledSigB;
    }

    return false;
};


BigFloat.notequal = (a, b) => !BigFloat.equal(a, b);
BigFloat.greater = (a, b) => BigFloat.less(b, a);
BigFloat.lessequal = (a, b) => !BigFloat.greater(a, b);
BigFloat.greaterequal = (a, b) => !BigFloat.less(a, b);

// Compare = (a>b)-(b<a);
BigFloat.cmp = function (a,b) {
    BigFloatStat.cmp = (BigFloatStat.cmp ?? 0) + 1; 
    a = (a instanceof BigFloat) ? a : new BigFloat(a);
    b = (b instanceof BigFloat) ? b : new BigFloat(b);
    if(BigFloat.less(a,b))  return -1;
    if(BigFloat.less(b,a))  return 1;
    return 0;
}

////////////////////////////////////////////////////////////////
//
// END Comparison functions
//
////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
//
// Standard Mathematical functions
//
//  abs()
//  floor()
//  ceil()
//  round()
//  trunc()
//  ldexp()
//  frexp()
//  modf()
//  fmod()
//  fma()
//  nextafter()
//
////////////////////////////////////////////////////////////////


BigFloat.abs = function(x) {
    BigFloatStat.abs = (BigFloatStat.abs ?? 0) + 1;
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    // abs(NaN) = NaN, abs(±Infinity) = +Infinity, abs(0) = 0
    // These already work correctly by just setting sign to 1
    var res = new BigFloat(x);
    res._sign = 1; 
    return res;  // No Normalization needed.
}

/**
 * CORRECTED BigFloat.floor, ceil, trunc, round functions
 * 
 * The key insight: Don't manually set _significand and call _normalizeBits()
 * Instead, construct a proper BigFloat from the integer result
 */

/**
 * BigFloat.floor(x)
 * Returns the largest integer <= x
 */
BigFloat.floor = function (x) {
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    BigFloatStat.floor=(BigFloatStat.floor??0)+1;
    
    // Handle special values
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity, x._precision, x._rounding);
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN, x._precision, x._rounding);
    
    const bitlen = x._bitlength();
    const effExp = x._exponent - (bitlen - 1);
    
    // If effExp >= 0, x is already an integer
    if (effExp >= 0) {
        return new BigFloat(x);
    }
    
    // x has fractional bits
    const fracBits = -effExp;
    const intPart = x._significand >> BigInt(fracBits);
    const fracPart = x._significand & ((1n << BigInt(fracBits)) - 1n);
    
    let resultInt;
    
    if (x._sign > 0) {
        // Positive: just truncate
        resultInt = intPart;
    } else {
        // Negative: if there's a fractional part, round down (more negative)
        if (fracPart === 0n) {
            resultInt = intPart;
        } else {
            resultInt = intPart + 1n;
        }
        // Apply negative sign
        resultInt = -resultInt;
    }
    
    // Construct a new BigFloat from the integer - this handles normalization correctly
    return new BigFloat(resultInt, x._precision, x._rounding);
};

/**
 * BigFloat.ceil(x)
 * Returns the smallest integer >= x
 */
BigFloat.ceil = function (x) {
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    BigFloatStat.ceil=(BigFloatStat.ceil??0)+1;
    
    // Handle special values
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity, x._precision, x._rounding);
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN, x._precision, x._rounding);
    
    const bitlen = x._bitlength();
    const effExp = x._exponent - (bitlen - 1);
    
    // If effExp >= 0, x is already an integer
    if (effExp >= 0) {
        return new BigFloat(x);
    }
    
    // x has fractional bits
    const fracBits = -effExp;
    const intPart = x._significand >> BigInt(fracBits);
    const fracPart = x._significand & ((1n << BigInt(fracBits)) - 1n);
    
    let resultInt;
    
    if (x._sign > 0) {
        // Positive: if there's a fractional part, round up
        if (fracPart === 0n) {
            resultInt = intPart;
        } else {
            resultInt = intPart + 1n;
        }
    } else {
        // Negative: just truncate (toward zero, which is up for negatives)
        resultInt = intPart;
        // Apply negative sign
        resultInt = -resultInt;
    }
    
    // Construct a new BigFloat from the integer
    return new BigFloat(resultInt, x._precision, x._rounding);
};

/**
 * BigFloat.trunc(x)
 * Truncates toward zero (removes fractional part)
 */
BigFloat.trunc = function (x) {
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    BigFloatStat.trunc=(BigFloatStat.trunc??0)+1;
    
    // Handle special values
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity, x._precision, x._rounding);
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN, x._precision, x._rounding);
    
    const bitlen = x._bitlength();
    const effExp = x._exponent - (bitlen - 1);
    
    // If effExp >= 0, x is already an integer
    if (effExp >= 0) {
        return new BigFloat(x);
    }
    
    // x has fractional bits - just remove them
    const fracBits = -effExp;
    let resultInt = x._significand >> BigInt(fracBits);
    
    // Apply sign
    if (x._sign < 0) {
        resultInt = -resultInt;
    }
    
    // Construct a new BigFloat from the integer
    return new BigFloat(resultInt, x._precision, x._rounding);
};

/**
 * BigFloat.round(x)
 * Rounds to nearest integer (round half away from zero)
 */
BigFloat.round = function (x) {
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    BigFloatStat.round=(BigFloatStat.round??0)+1;
    
    // Handle special values
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity, x._precision, x._rounding);
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN, x._precision, x._rounding);
    
    const bitlen = x._bitlength();
    const effExp = x._exponent - (bitlen - 1);
    
    // If effExp >= 0, x is already an integer
    if (effExp >= 0) {
        return new BigFloat(x);
    }
    
    // x has fractional bits
    const fracBits = -effExp;
    const intPart = x._significand >> BigInt(fracBits);
    const fracPart = x._significand & ((1n << BigInt(fracBits)) - 1n);
    
    // Check if fractional part >= 0.5
    const half = 1n << BigInt(fracBits - 1);
    const roundUp = fracPart >= half;
    
    let resultInt = roundUp ? intPart + 1n : intPart;
    
    // Apply sign
    if (x._sign < 0) {
        resultInt = -resultInt;
    }
    
    // Construct a new BigFloat from the integer
    return new BigFloat(resultInt, x._precision, x._rounding);
};

BigFloat.fmod = function (a, b) {
    // fmod(a, b) = a - trunc(a/b) * b
    
    // Convert to BigFloat if needed
    if (!(a instanceof BigFloat)) {
        a = new BigFloat(a);
    }
    if (!(b instanceof BigFloat)) {
        b = new BigFloat(b);
    }
    BigFloatStat.fmod=(BigFloatStat.fmod??0)+1;
    // Check for division by zero
    if (b._significand === 0n) {
        throw new Error("Division by zero in fmod");
    }
    
    // Compute a / b
    const quotient = BigFloat.div(a,b);
    
    // Truncate the quotient (remove fractional part, keep sign)
    const truncated = BigFloat.trunc(quotient);
    
    // Compute trunc(a/b) * b
    const product = BigFloat.mul(truncated,b);
    
    // Return a - trunc(a/b) * b
    return BigFloat.sub(a,product);
}

/**
 * BigFloat.frexp(x)
 * Returns [mantissa, exponent] where x = mantissa * 2^exponent
 * mantissa is in [1, 2) range
 */
BigFloat.frexp = function(x) {
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    
    BigFloatStat.frexp = (BigFloatStat.frexp ?? 0) + 1;
    
    // Handle special cases
    if (x._special === SPECIAL_ZERO) {
        return [new BigFloat(0n, x._precision, x._rounding), 0];
    }
    if (x._special === SPECIAL_NAN) {
        return [new BigFloat(NaN), 0];
    }
    if (x._special === SPECIAL_INF) {
        return [new BigFloat(x._sign > 0 ? Infinity : -Infinity), 0];
    }
    
    // Your BigFloat is already in the form: significand * 2^exponent
    // where significand (with implicit binary point) is in [1, 2)
    
    // The mantissa is just a copy with the same significand but we need
    // to express it properly
    let mantissa = new BigFloat(x);
    
    // The actual exponent accounting for the bit position
    const bitlen = x._bitlength();
    
    // The value is: significand * 2^exponent
    // But significand is interpreted as 1.xxxxx (with implicit leading 1)
    // So the actual exponent for the number is already x._exponent
    // when the significand represents [1, 2)
    
    // Actually, we need to think about this more carefully:
    // In your format: _significand stores the bits, and with the implicit
    // binary point after the first bit, it represents a value in [1, 2).
    // The full value is this × 2^_exponent
    
    // So frexp should return:
    // - mantissa: the number normalized to [1, 2)
    // - exponent: the exponent
    
    // The number is already normalized! So:
    let exp = x._exponent;
    
    return [mantissa, exp];
};

/**
 * BigFloat.ldexp(x, exp)
 * Returns x * 2^exp
 */
BigFloat.ldexp = function(x, exp) {
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    
    BigFloatStat.ldexp = (BigFloatStat.ldexp ?? 0) + 1;
    
    // Handle special cases
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity);
    
    // Simply add to the exponent - this multiplies by 2^exp
    let result = new BigFloat(x);
    result._exponent += exp;
    
    return result._normalize();
};   


/**
 * BigFloat.modf(x)
 * Extracts integer and fractional parts
 * Returns [integer_part, fractional_part] where:
 *   - integer_part = trunc(x)
 *   - fractional_part = x - trunc(x)
 *   - Both have the same sign as x
 * 
 * Examples:
 *   modf(3.7) = [3, 0.7]
 *   modf(-3.7) = [-3, -0.7]
 *   modf(5) = [5, 0]
 * 
 * Useful for decomposing a number into whole and fractional components.
 */
BigFloat.modf = function (x) {
    x = (x instanceof BigFloat) ? x : new BigFloat(x);
    BigFloatStat.modf=(BigFloatStat.modf??0)+1;
    // Handle special values
    if (x._special === SPECIAL_ZERO) return [new BigFloat(0n), new BigFloat(0n)];
    if (x._special === SPECIAL_NAN) return [new BigFloat(NaN), new BigFloat(NaN)];
    if (x._special === SPECIAL_INF) {
        const inf = new BigFloat(x._sign > 0 ? Infinity : -Infinity);
        const zero = new BigFloat(0n);
        return [inf, zero];
    }
    
    const integerPart = BigFloat.trunc(x);
    const fractionalPart = BigFloat.sub(x, integerPart);
    
    return [integerPart, fractionalPart];
};

// Fused Multiply-Add: fma(a, b, c) = a*b + c
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Compute a*b + c with extended precision to avoid intermediate rounding.
//   This is more accurate than computing (a*b) + c separately.
//
// The key benefit: the multiplication is done at higher precision, then
// only one rounding occurs at the end when adding c.
//
// @param {BigFloat} a - First multiplicand
// @param {BigFloat} b - Second multiplicand  
// @param {BigFloat} c - Addend
// @returns {BigFloat} - Result of a*b + c
BigFloat.fma = function(a, b, c) {
    // Convert to BigFloat if needed
    if (!(a instanceof BigFloat)) a = new BigFloat(a);
    if (!(b instanceof BigFloat)) b = new BigFloat(b);
    if (!(c instanceof BigFloat)) c = new BigFloat(c);
    BigFloatStat.fma = (BigFloatStat.fma ?? 0) + 1;
    
    // Handle NaN - if any argument is NaN, result is NaN
    if (a._special === SPECIAL_NAN || b._special === SPECIAL_NAN || c._special === SPECIAL_NAN) 
        return new BigFloat(NaN);
    
    // Handle infinity cases
    // a*b produces inf if either a or b is inf (and the other is not zero)
    // inf + c = inf (unless c is -inf with same magnitude)
    if (a._special === SPECIAL_INF || b._special === SPECIAL_INF) {
        // Check for 0 * inf which is NaN
        if ((a._special === SPECIAL_INF && (b._special === SPECIAL_ZERO || b._significand === 0n)) ||
            (b._special === SPECIAL_INF && (a._special === SPECIAL_ZERO || a._significand === 0n))) 
            return new BigFloat(NaN);
        // a*b will be ±inf, then add c
        const abSign = a._sign * b._sign;
        if (c._special === SPECIAL_INF && c._sign !== abSign) 
            return new BigFloat(NaN);  // inf - inf = NaN
        return new BigFloat(abSign > 0 ? Infinity : -Infinity);
    }
    
    if (c._special === SPECIAL_INF) 
        return new BigFloat(c._sign > 0 ? Infinity : -Infinity);
    
    // Determine target precision (max of all three arguments)
    const targetPrecision = Math.max(a._precision, b._precision, c._precision);
    // Use double precision for intermediate multiplication
    // This ensures no rounding happens during a*b
    const workPrecision = 2 * Math.max(a._precision, b._precision, c._precision);
    
    // Create working copies with extended precision
    let aWork = new BigFloat(a, workPrecision);
    let bWork = new BigFloat(b, workPrecision);
    let cWork = new BigFloat(c, workPrecision);    
    // Perform a*b at extended precision
    let product = BigFloat.mul(aWork, bWork);
    // Add c at extended precision
    let result = BigFloat.add(product, cWork);
    // Round to target precision (this is the only rounding step!)
    result._precision = targetPrecision;
    result._rounding = a._rounding;  // Use rounding mode from first argument
    return result._normalize();
};

/**
 * BigFloat nextafter, succ, and pred functions
 * Based on Henrik Vestermark's C++ implementation
 * 
 * Key approach:
 * 1. Normalize x by setting exponent to 0 (save original exponent)
 * 2. Create ULP = BigFloat(1) with exponent = -pbits and same precision as x
 * 3. Add/subtract ULP to/from normalized x
 * 4. Restore original exponent by adding it back
 * 
 * Since both x and ULP have the same precision, BigFloat.add/sub handles them correctly
 * without losing precision.
 */

/**
 * BigFloat.prototype.succ()
 * Returns the next representable number towards positive infinity
 */
BigFloat.prototype.succ = function() {
    BigFloatStat.succ = (BigFloatStat.succ ?? 0) + 1;
    
    // Handle special cases
    if (this._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (this._special === SPECIAL_INF) {
        if (this._sign > 0) return new BigFloat(Infinity);
        // -Infinity moving toward +infinity returns largest negative number
        return new BigFloat(-Number.MAX_VALUE, this._precision);
    }
    
    // Handle zero - return smallest positive number
    if (this._special === SPECIAL_ZERO || this._significand === 0n) {
        const pbits = Math.ceil(this._precision * Math.log2(10));
        let result = new BigFloat(1n, this._precision, this._rounding);
        result._exponent = -pbits;
        return result;
    }
    
    // Calculate precision in bits
    const pbits = Math.ceil(this._precision * Math.log2(10));
    
    // Save original exponent
    const originalExp = this._exponent;
    
    // Create a copy and normalize to exponent = 0
    let next = new BigFloat(this);
    next._exponent = 0;
    
    // Create ULP = BigFloat(1) with exponent = -pbits and same precision
    let ulp = new BigFloat(1n, this._precision, this._rounding);
    ulp._exponent = -pbits;
    
    // Add or subtract ULP based on sign
    if (next._sign > 0) {
        // Positive: add ULP to move toward +infinity
        next = BigFloat.add(next, ulp);
    } else {
        // Negative: subtract ULP to make less negative (toward +infinity)
        next = BigFloat.sub(next, ulp);
    }
    
    // Restore original exponent
    next._exponent += originalExp;
    return next;
};

/**
 * BigFloat.prototype.pred()
 * Returns the next representable number towards negative infinity
 */
BigFloat.prototype.pred = function() {
    BigFloatStat.pred = (BigFloatStat.pred ?? 0) + 1;
    
    // Handle special cases
    if (this._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (this._special === SPECIAL_INF) {
        if (this._sign < 0) return new BigFloat(-Infinity);
        // +Infinity moving toward -infinity returns largest positive number
        return new BigFloat(Number.MAX_VALUE, this._precision);
    }
    
    // Handle zero - return smallest negative number
    if (this._special === SPECIAL_ZERO || this._significand === 0n) {
        const pbits = Math.ceil(this._precision * Math.log2(10));
        let result = new BigFloat(1n, this._precision, this._rounding);
        result._exponent = -pbits;
        result._sign = -1;
        return result;
    }
    
    // Calculate precision in bits
    const pbits = Math.ceil(this._precision * Math.log2(10));
    
    // Save original exponent
    const originalExp = this._exponent;
    
    // Create a copy and normalize to exponent = 0
    let next = new BigFloat(this);
    next._exponent = 0;
    
    // Create ULP = BigFloat(1) with exponent = -pbits and same precision
    let ulp = new BigFloat(1n, this._precision, this._rounding);
    ulp._exponent = -pbits;
    
    // Add or subtract ULP based on sign
    if (next._sign > 0) {
        // Positive: subtract ULP to move toward -infinity
        next = BigFloat.sub(next, ulp);
    } else {
        // Negative: add negative ULP to make more negative (toward -infinity)
        ulp._sign = -1;
        next = BigFloat.add(next, ulp);
    }
    
    // Restore original exponent
    next._exponent += originalExp;
    return next;
};

/**
 * BigFloat.nextafter(x, towards)
 * Returns the next representable value of x in the direction of towards
 * 
 * @param {BigFloat} x - The starting value
 * @param {BigFloat} towards - The direction to move
 * @returns {BigFloat} - Next representable number in the direction of towards
 */
BigFloat.nextafter = function(x, towards) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    if (!(towards instanceof BigFloat)) towards = new BigFloat(towards);
    
    BigFloatStat.nextafter = (BigFloatStat.nextafter ?? 0) + 1;
    
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (towards._special === SPECIAL_NAN) return new BigFloat(NaN);
    
    // If x == towards, return x unchanged
    if (BigFloat.equal(x, towards)) {
        return new BigFloat(x);
    }
    
    // Determine direction based on comparison
    if (BigFloat.greater(towards, x)) {
        // Moving towards positive infinity
        return x.succ();
    } else {
        // Moving towards negative infinity
        return x.pred();
    }
};

// Add prototype methods for convenience
BigFloat.prototype.floor = function() { return BigFloat.floor(this); };
BigFloat.prototype.ceil = function() { return BigFloat.ceil(this); };
BigFloat.prototype.trunc = function() { return BigFloat.trunc(this); };
BigFloat.prototype.round = function() { return BigFloat.round(this); };
BigFloat.prototype.modf = function() { return BigFloat.modf(this); };


////////////////////////////////////////////////////////////////
//
// END Standard Mathematical functions
//
////////////////////////////////////////////////////////////////


function parseBigFloat(str, precision = BigFloat.defaultPrecision, rounding = BigFloat.defaultRounding) {
    str = String(str).trim();
    const m = /^([+-])?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(str);
    if (!m) 
        return new BigFloat(NaN);
    BigFloatStat.parseBigFloat=(BigFloatStat.parseBigFloat??0)+1;
    let [, sgn, intPart, fracPart, expStr] = m;
    sgn = sgn || "+";
    intPart = intPart || "0";
    fracPart = fracPart || "";
    const exp10 = expStr ? parseInt(expStr, 10) : 0;

    // remove redundant zeros
    intPart = intPart.replace(/^0+(?=\d)/, "");
    fracPart = fracPart.replace(/0+$/, "");

    // zero?
    if (intPart === "0" && fracPart === "") {
        const z = new BigFloat(0n,precision);
        z._special = SPECIAL_ZERO;
        return z;
    }

    const digits = intPart + fracPart;
    let S = BigInt(digits);
    let decExp = exp10 - fracPart.length;

    const bf = new BigFloat();
    bf._sign = sgn === "-" ? -1 : 1;
    bf._precision = precision;
    bf._rounding = rounding;
    bf._special = null;
    bf._bits = -1;  // Force recomputation when needed 

    // FIXED: Scale integers to match requested precision
    if (decExp >= 0) {
        // multiply by 10^decExp exactly
        S *= 10n ** BigInt(decExp);
            // Keep minimal - don't pad to precision
        bf._significand = S;
        bf._exponent = 0;
        
       // bf.dump2Console("Before normalizeBits");
        const result = bf._normalizeBits();
        //bf.dump2Console("After normalizeBits");
        bf._compact();
        //bf.dump2Console("After Compact");
        bf._normalize();
        //bf.dump2Console("After normalize");
        return bf;
    }

    // --- Decimal fraction: divide by 10^(-decExp) ---
    const denom = 10n ** BigInt(-decExp);
    
    // Calculate guard bits
    const denomBits = denom.toString(2).length;
    const precisionBits = Math.ceil((precision+1) * Math.log2(10));
    const guardBits = Math.max(20, Math.ceil(precisionBits * 0.5));
    
    const bitLimit = Math.max(
        precisionBits + guardBits,
        denomBits + precisionBits + guardBits
    );

    // Scale numerator to preserve required binary digits
    const scaled = S << BigInt(bitLimit);
    let q = scaled / denom;
    let r = scaled % denom;

    // ---- Rounding ----
    const half = denom >> 1n;
    let roundUp = false;
    switch (bf._rounding) {
        case BigFloat.RoundingMode.NEAREST:
            roundUp = (r > half) || (r === half && (q & 1n));
            break;
        case BigFloat.RoundingMode.UP:
            roundUp = bf._sign > 0 && r !== 0n;
            break;
        case BigFloat.RoundingMode.DOWN:
            roundUp = bf._sign < 0 && r !== 0n;
            break;
        case BigFloat.RoundingMode.ZERO:
        default:
            roundUp = false;
            break;
    }
    if (roundUp) q += 1n;

    bf._significand = q;
    bf._exponent = -bitLimit;
    //bf.dump2Console("Before normalizeBits");
    const result = bf._normalizeBits();
    //bf.dump2Console("After normalizeBits");
    bf._compact();
    //bf.dump2Console("After compact");
    bf._normalize();
    //bf.dump2Console("After normalize");

    return bf;
};

// Make sure this is also attached to BigFloat
BigFloat.parseBigFloat = parseBigFloat;

////////////////////////////////////////////////////////////////
//
// Standard Mathematical constants
//  PI()
//  LN2()
//  LN10()
//  E 
//  SQRT2()  - sqrt(2)
//  EPSILON()
//
////////////////////////////////////////////////////////////////

// Compue PI with the requested precision
BigFloat.PI = function( prec=BigFloat.defaultPrecision) {
    // This is the Chudnovski method for computing PI. 
    // It is today consider to be the most efficient algorithm for 
    // computing PI with arbitrary precision
    function binarysplittingChudnovskiPI( a, b)
        {
        let p,q, r, pp, qq, rr;
        if (b - a == 1n)
            {
            r = (2n * b - 1n)*(6n * b - 5n)*(6n * b - 1n);
            p = 13591409n + 545140134n * b; 
            p *= r;
            if (b & 0x1n)
                p = -p;
            q = (b**3n)*10939058860032000n;
            return [p,q,r];
            }
        const mid = (a + b) / 2n;
        [p,q,r]=binarysplittingChudnovskiPI(a, mid);	// interval [a..mid]
        [pp,qq,rr]=binarysplittingChudnovskiPI(mid, b);// interval [mid..b]
        // Reconstruct interval [a..b] and return p, q & r
        p = p*qq + pp*r;
        q *= qq;
        r *= rr;
        return [p,q,r];
        }
 
    const k = Math.ceil(prec*Math.log(10) / Math.log(151931373056000)); 
    let [p,q,r]=binarysplittingChudnovskiPI(0n, BigInt(k));

    let pi= new BigFloat(0,prec);
    pi.assign(new BigFloat(4270934400n*q,prec));
    const sqrtterm=BigFloat.sqrt(new BigFloat(10005n, prec));
    
    let denom=new BigFloat(0,prec);
    denom.assign(new BigFloat(q*13591409n,prec));
    denom.assign(BigFloat.add(denom,new BigFloat(p, prec)));
    denom.assign(BigFloat.mul(denom,sqrtterm));
    pi.assign(BigFloat.div(pi,denom));
    pi.precision(prec);
	return pi._normalize();
    }


// Compute LN2 with the requested precision
BigFloat.LN2= function( prec=BigFloat.defaultPrecision) {
	// Decide how many terms, etc.
	const kmax = Math.ceil(prec * Math.log(10) / Math.log(3888));
	const workprec = Math.ceil(prec + 1 + 1 * Math.log(kmax));
    
	function binarysplittingZuniga(a,b) {
		if (a + 1n == b)
		{
			const b6 = 6n * b;

			const q = 216n * (b6 - 1n) * (b6 - 5n);
			const r = b * (2n * b - 1n);
			const p = 1794n * b - 297n;
			return [p,q,r];
		}

		// Recurse: split [a..b] into [a..mid] and [mid..b]
		const mid = (a + b) / 2n;
		
		let [p,q,r]=binarysplittingZuniga(a, mid);
		let [pp,qq,rr]=binarysplittingZuniga(mid, b);

		// Merge results (combine partial results)
		p = p * qq + pp * r;
		q *= qq;
		r *= rr;
        return [p,q,r];
	}

	// 4) Actually use the recursive lambda for each Thread
	let [p,q,r]=binarysplittingZuniga(0n, BigInt(kmax));

	// Convert to float_precision and finish
    q *= 2n;
    //console.log((p*1000n)/q);  // DEBUG
	let fp = BigFloat(p, workprec);
	let fq = BigFloat(q, workprec);
	fp.assign(BigFloat.div(fp,fq));
	fp.precision(prec);

	return fp;
}

// Compute LN5
BigFloat.LN5 = function( prec=BigFloat.defaultPrecision)
{
	// Decide how many terms, etc.
	const kmax = Math.ceil(prec * Math.log(10) / Math.log(675));
	const workprec = Math.ceil(prec + 1 + 1 * Math.log(kmax));

	function binarysplittingZuniga(a,b)
	{
		if (a + 1n == b)
		{
			const b6 = 6n * b;
			const q = 75n * (b6 - 1n) * (b6 - 5n);
			const r = 2n * b * (2n * b - 1n);
			let p = 728n * b - 124n;
			if (b + 1n & 0x1n) // Odd
				p = -p;
			return [p,q,r];
		}

		// 2) Recurse: split [a..b] into [a..mid] and [mid..b]
		const mid = (a + b) / 2n;
		let [p,q,r] = binarysplittingZuniga(a, mid);
		let [pp, qq, rr]=binarysplittingZuniga(mid, b);

		// 3) Merge results (combine partial results)
		p = p * qq + pp * r;
		q *= qq;
		r *= rr;
        return [p,q,r];
	};

	// Prepare accumulators
	let [p,q,r]=binarysplittingZuniga(0n, BigInt(kmax));

	// Convert to float_precision and finish
    let fp = BigFloat(p, workprec);
	let fq = BigFloat(q, workprec);
	fp.assign(BigFloat.div(fp,fq));
	fp.precision(prec);

	return fp;
}

// Compute LN10
BigFloat.LN10 = function(prec=BigFloat.defaultPrecision) {
    const ln2 = BigFloat.LN2(prec);
    const ln5 = BigFloat.LN5(prec);
    let ln10=BigFloat.add(ln2,ln5);
    ln10.precision(prec);
    return ln10;
}

// Compute E with the requested precsion
BigFloat.E= function(prec=BigFloat.defaultPrecision) {
    
    // Stirling approximation to find a suitable k value
    function stirling_approx(digits)
	{
        let xnew, xold;
        const test = (digits + 1) *Math.log(10);
        // Stirling approximation of k!~Sqrt(2*pi*k)(k/e)^k.
        // Taken ln on both side you get: k*(log((k)-1)+0.5*log(2*pi*m);
        // Use Newton method to find in less that 4-5 iteration
        for (xold = 5, xnew = 0; ; xold = xnew)
            {
            let f = xold*(Math.log(xold) - 1) + 0.5*Math.log(2*Math.PI*xold);
            let f1 = 0.5 / xold + Math.log(xold);
            xnew = xold - (f - test) / f1;
            if (Math.ceil(xnew) == Math.ceil(xold))
                break;
            }
        return Math.ceil(xnew);
	}
    
    // Perform the binary splitting of E
    function binarysplittingE(a, b)
	{
        if (b - a == 1)
            {// No overflow using 64bit arithmetic
            const p = 1n;
            const q = b;
            return [p,q];
            }
        const mid = (a + b) / 2n;
        let [p, q]=binarysplittingE(a, mid);  // interval [a..mid]
        let [pp, qq ]=binarysplittingE(mid, b);// interval [mid..b]
        // Reconstruct interval [a..b] and return p & q
        p = p*qq + pp;
        q *= qq;
        return [p,q];
	}
    
    let k = stirling_approx(prec);
	if (k < 2)
		k = 2;  // Minimum 2 terms otherwise it cant split
    let [p,q] = binarysplittingE(0n, BigInt(k));

    p+=q;
	let fp =BigFloat(p, prec); 
    let fq = BigFloat(q, prec);
	fp.assign(BigFloat.div(fp,fq));
	fp.precision(prec);

	return fp;
}

// Compute SQRT2 with the requested precsion
BigFloat.SQRT2= function(prec=BigFloat.defaultPrecision) {
    const c2=new BigFloat(2n,prec);
    return BigFloat.sqrt(c2);
}

/**
 * Returns machine epsilon for the given precision.
 * 
 * Machine epsilon is the smallest value ε such that 1 + ε ≠ 1
 * in floating-point arithmetic with the specified precision.
 * 
 * For precision p decimal digits: EPSILON = 10^(-p)
 * 
 * @param {number} precision - Number of decimal digits of precision
 * @returns {BigFloat} Machine epsilon for the given precision
 */
BigFloat.EPSILON = function(precision) {
    // EPSILON = 10^(-precision) = 1 / (10^precision)
    
    const one = new BigFloat(1, precision);
    const ten = new BigFloat(10, precision);
    const p = new BigFloat(precision, precision);
    
    // Compute 10^precision
    const tenToP = BigFloat.pow(ten, p);
    
    // Return 1 / 10^precision = 10^(-precision)
    return BigFloat.div(one, tenToP);
};

////////////////////////////////////////////////////////////////
//
// END Standard Mathematical constants
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Begin Standard Mathematicalfunctions
//  log(x) - Natural logarithm
//  log10(x)
//  exp(x)
//  pow(x)
//
////////////////////////////////////////////////////////////////

// Power Function: pow(x, y) = x^y
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   General case: x^y = exp(y × ln(x))
//   Integer y: Use binary exponentiation (much faster)
//   Power of 2 with integer y: Direct exponent multiplication (instant!)
//
// Special cases:
//   - 0^0 throws error (undefined)
//   - x^0 = 1
//   - 0^y = 0 (for y > 0)
//   - 1^y = 1
//   - x < 0 and y non-integer throws error
BigFloat.pow = function(x, y) {
    BigFloatStat.pow = (BigFloatStat.pow ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    if (!(y instanceof BigFloat)) y = new BigFloat(y);
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (y._special === SPECIAL_NAN) return new BigFloat(NaN);
    // Handle x = ±Infinity
    if (x._special === SPECIAL_INF) {
        // ±∞^0 = 1
        if (y._special === SPECIAL_ZERO || y._significand === 0n) {
            return new BigFloat(1n, x._precision, x._rounding);
        }
        // ±∞^(negative) = 0
        if (y._sign < 0) {
            return new BigFloat(0n, x._precision, x._rounding);
        }
        // From here: y > 0
        if (x._sign < 0) {
            // -∞^y: check if y is odd integer
            if (BigFloat.isInteger(y)) {
                const yInt = BigFloat.toNumber(y);
                if (yInt !== null && (yInt & 1n) === 1n) {
                    return new BigFloat(Infinity);  // Odd: result is -∞
                }
            }
            return new BigFloat(Infinity);  // Even or non-integer: result is +∞
        }
        // +∞^(positive) = +∞
        return new BigFloat(Infinity);
    }
    // Handle y = ±Infinity
    if (y._special === SPECIAL_INF) {
        const absX = Math.abs(x.toNumber());
        if (absX < 1) return y._sign > 0 ? new BigFloat(0n) : new BigFloat(Infinity);
        if (absX > 1) return y._sign > 0 ? new BigFloat(Infinity) : new BigFloat(0n);
        return new BigFloat(1n);  // |x| = 1
    }
    // Handle 0^0 - domain error
    if ((x._special === SPECIAL_ZERO || x._significand === 0n) && 
        (y._special === SPECIAL_ZERO || y._significand === 0n)) 
        return new BigFloat(NaN);  // Or throw error
    // Handle x = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return y._sign > 0 ? new BigFloat(0n, x._precision) : new BigFloat(Infinity);
    // Handle y = 0: x^0 = 1
    if (y._special === SPECIAL_ZERO || y._significand === 0n) 
        return new BigFloat(1n, x._precision, x._rounding);
    // Handle x = 1: 1^y = 1
    if (x._sign === 1 && x._significand === 1n && x._exponent === 0) 
        return new BigFloat(1n, x._precision, x._rounding);
    
    // Check if y is an integer
    let yIsInteger = false;
    let yInt = null;
    
    if (y._exponent >= 0) {
        yIsInteger = y.isInteger();
        if (yIsInteger) {
            yInt = y.toNumber();
        }
    } 
    // If y is not an integer and x is negative, that's an error
    if (!yIsInteger && x._sign < 0) 
        return new BigFloat(NaN);  // Or throw domain_error
    
    // Normale handling of x^y
    // Estimate needed intermediate precision
    const targetPrec = Math.max(x._precision, y._precision);
    let workPrec = targetPrec + 4;
    // Estimate |y*log(x)| using exponents only
    // |log(x)| ≈ |x._exponent| * log(2) ≈ |x._exponent| * 0.693
    // |y| ≈ 2^(y._exponent)
    const logXMagnitude = Math.abs(x._exponent) * 0.693;
    const yMagnitude = y._exponent; // In powers of 2
    // |y*log(x)| ≈ 2^yMagnitude * logXMagnitude
    const productMagnitude = yMagnitude + Math.log2(logXMagnitude + 1);
    // Extra guard digits needed
    const extraGuard = Math.max(0, Math.ceil(productMagnitude * 0.301)) + 3;
    workPrec  = targetPrec + 5 + extraGuard;

    // INTEGER EXPONENT PATH (optimized)
    if (yIsInteger && yInt !== null) {
        // Check if x is a power of 2 (significand = 1)
        if (x._significand === 1n) {
            // x = 2^(x._exponent)
            // x^y = 2^(x._exponent × y)
            const result = new BigFloat(1n, x._precision, x._rounding);
            result._exponent = x._exponent * Number(yInt);
            
            // Handle sign: negative base with odd exponent
            if (x._sign < 0 && (BigInt(yInt) & 1n) === 1n) 
                result._sign = -1;
            
            return result;
        }
        
        // Binary exponentiation for integer powers
        let absYInt = BigInt(yInt < 0 ? -yInt : yInt);
        const isNegativePower = yInt < 0;
        let result = new BigFloat(1n, workPrec, x._rounding);
        let base = new BigFloat(x);
        base._precision = workPrec;
        
        // Binary exponentiation: n = ...b3 b2 b1 b0 (binary)
        // x^n = x^(b0×2^0 + b1×2^1 + b2×2^2 + ...)
        while (absYInt > 0n) {
            if ((absYInt & 1n) === 1n) 
                // Odd: multiply result by current base
                result = BigFloat.mul(result, base);
            absYInt >>= 1n;  // Divide by 2
            if (absYInt > 0n) 
                // Square the base for next iteration
                base = BigFloat.mul(base, base);
        }
        
        // Handle negative exponent: x^(-n) = 1/x^n
        if (isNegativePower)
           { result = BigFloat.inverse(result);}
        
        // Round to target precision
        result._precision = targetPrec;
        result._rounding = x._rounding;
        result._normalize();
        return result;
     }
    
    // NON-INTEGER EXPONENT PATH: x^y = exp(y × ln(x))
    let result = new BigFloat(x);
    result._precision = workPrec;
    
    // Compute ln(x)
    result = BigFloat.log(result);
    
    // Multiply by y
    const yWork = new BigFloat(y);
    yWork._precision = workPrec;
    result = BigFloat.mul(result, yWork);
    
    // Compute exp(y × ln(x))
    result = BigFloat.exp(result);
    
    // Round to target precision
    result.dump2Console("pow(x,y)  internal",true);
    const bl=result._significand.toString(2).length;
    result._precision = x._precision;
    result._rounding = x._rounding;
    result._normalize();
    result.dump2Console("pow(x,y) normalize",true);
    const bl2=result._significand.toString(2).length;
    return result;
};

// Power Function: pow(x, y) = x^y
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   General case: x^y = exp(y × ln(x))
//   Integer y: Use binary exponentiation (much faster)
//   Power of 2 with integer y: Direct exponent multiplication (instant!)
//
// Special cases:
//   - 0^0 throws error (undefined)
//   - x^0 = 1
//   - 0^y = 0 (for y > 0)
//   - 1^y = 1
//   - x < 0 and y non-integer throws error
BigFloat.powfast = function(x, y) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    if (!(y instanceof BigFloat)) y = new BigFloat(y);
    
    BigFloatStat.pow = (BigFloatStat.pow ?? 0) + 1;
    
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (y._special === SPECIAL_NAN) return new BigFloat(NaN);
    
    // Handle x = ±Infinity
    if (x._special === SPECIAL_INF) {
        // ±∞^0 = 1
        if (y._special === SPECIAL_ZERO || y._significand === 0n) {
            return new BigFloat(1n, x._precision, x._rounding);
        }
        
        // ±∞^(negative) = 0
        if (y._sign < 0) {
            return new BigFloat(0n, x._precision, x._rounding);
        }
        
        // From here: y > 0
        if (x._sign < 0) {
            // -∞^y: check if y is odd integer
            if (BigFloat.isInteger(y)) {
                const yInt = BigFloat.toNumber(y);
                if (yInt !== null && (yInt & 1n) === 1n) {
                    return new BigFloat(Infinity);  // Odd: result is -∞
                }
            }
            return new BigFloat(Infinity);  // Even or non-integer: result is +∞
        }
        // +∞^(positive) = +∞
        return new BigFloat(Infinity);
    }
    
    // Handle y = ±Infinity
    if (y._special === SPECIAL_INF) {
        const absX = Math.abs(x.toNumber());
        if (absX < 1) return y._sign > 0 ? new BigFloat(0n) : new BigFloat(Infinity);
        if (absX > 1) return y._sign > 0 ? new BigFloat(Infinity) : new BigFloat(0n);
        return new BigFloat(1n);  // |x| = 1
    }
    
    // Handle 0^0 - domain error
    if ((x._special === SPECIAL_ZERO || x._significand === 0n) && 
        (y._special === SPECIAL_ZERO || y._significand === 0n)) {
        return new BigFloat(NaN);  // Or throw error
    }
    
    // Handle x = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) {
        return y._sign > 0 ? new BigFloat(0n, x._precision) : new BigFloat(Infinity);
    }
    
    // Handle y = 0: x^0 = 1
    if (y._special === SPECIAL_ZERO || y._significand === 0n) {
        return new BigFloat(1n, x._precision, x._rounding);
    }
    
    // Handle x = 1: 1^y = 1
    if (x._significand === 1n && x._exponent === 0) {
        return new BigFloat(1n, x._precision, x._rounding);
    }
    
    // Check if y is an integer
    let yIsInteger = false;
    let yInt = null;
    
    if (y._exponent >= 0) {
        yIsInteger = y.isInteger();
        if (yIsInteger) {
            yInt = y.toNumber();
        }
    }
    
    // If y is not an integer and x is negative, that's an error
    if (!yIsInteger && x._sign < 0) {
        return new BigFloat(NaN);  // Or throw domain_error
    }
    
    const workPrec = x._precision + 4;
    
    // INTEGER EXPONENT PATH (optimized)
    if (yIsInteger && yInt !== null) {
        // Check if x is a power of 2 (significand = 1)
        if (x._significand === 1n) {
            // x = 2^(x._exponent)
            // x^y = 2^(x._exponent × y)
            const result = new BigFloat(1n, x._precision, x._rounding);
            result._exponent = x._exponent * Number(yInt);
            
            // Handle sign: negative base with odd exponent
            if (x._sign < 0 && (yInt & 1n) === 1n) {
                result._sign = -1;
            }
            
            return result;
        }
        
        // Binary exponentiation for integer powers
        let absYInt = BigInt(yInt < 0n ? -yInt : yInt);
        const isNegativePower = yInt < 0n;
        

        // EXPERIMENTAL: BigInt ** operator path
        if (true) {
            // Helper: Compare results and log differences
            function _comparePowResults(x, y, newResult, originalResult) {
                // Compare the two results
                const diff = BigFloat.sub(newResult, originalResult);
                const absDiff = BigFloat.abs(diff);

                // Compute relative error
                const relError = BigFloat.div(absDiff, BigFloat.abs(originalResult));

                const relErrorNum = relError.toNumber();
                const threshold = Math.pow(10, -x._precision + 2);  // Allow some rounding difference

                if (relErrorNum > threshold) {
                    console.warn('BigInt ** pow mismatch:');
                    console.warn('  x =', x.toString());
                    console.warn('  y =', y.toString());
                    console.warn('  BigInt ** result:', newResult.toString());
                    console.warn('  Original result: ', originalResult.toString());
                    console.warn('  Relative error:  ', relErrorNum);
                }
            }
            
            let resultfast;
            absYInt = BigInt(yInt < 0n ? -yInt : yInt);
            
            try {
             const newSignificand = x._significand ** absYInt;
const originalBits = x._bits;
const newBits = newSignificand.toString(2).length;

// When we raise (sig × 2^exp)^n, we get:
// sig^n × 2^(exp×n)
// But sig went from originalBits to newBits
// The extra bits mean we've multiplied by 2^(newBits - originalBits) too many times
// We need: newExp = exp×n - (newBits - originalBits × n)
//let newExponent = x._exponent * Number(absYInt) - newBits + originalBits * Number(absYInt);
                let newExponent = x._exponent * Number(absYInt) - originalBits * Number(absYInt) + Number(absYInt) + newBits - 1;

   

        // Create result - don't use BigFloat(1n), create a raw object or use a different constructor
        resultfast = new BigFloat(0);
        resultfast._sign = (x._sign < 0 && (absYInt & 1n) === 1n) ? -1 : 1;
        resultfast._significand = newSignificand;
        resultfast._exponent = newExponent;
        resultfast._precision = x._precision;
        resultfast._rounding = x._rounding;
        resultfast._bits = newBits;
        resultfast._special = null;
                                
                // Handle negative exponent: x^(-n) = 1/x^n
                if (isNegativePower) {
                    resultfast = BigFloat.inverse(resultfast);
                }
                
                // Normalize and round to target precision
                resultfast = resultfast._normalize();
                
//result.dump2Console('Correct power code', true ); // DEBUG
//resultfast.dump2Console('New power code', true ); // DEBUG
                // TESTING: Compare with original algorithm
//_comparePowResults(x, y, resultfast, result);
                
                return resultfast._normalize();
                
            } catch (e) {
                console.warn('BigInt ** failed, falling back to binary exponentiation:', e);
                // Fall through to original algorithm
            }
        }
    }
    
    // NON-INTEGER EXPONENT PATH: x^y = exp(y × ln(x))
    let result = new BigFloat(x);
    result._precision = workPrec;
    
    // Compute ln(x)
    result = BigFloat.log(result);
    
    // Multiply by y
    const yWork = new BigFloat(y);
    yWork._precision = workPrec;
    result = BigFloat.mul(result, yWork);
    
    // Compute exp(y × ln(x))
    result = BigFloat.exp(result);
    
    // Round to target precision
    result._precision = x._precision;
    result._rounding = x._rounding;
    return result._normalize();
};

// Instance method
BigFloat.prototype.pow = function(y) {
    return BigFloat.pow(this, y);
};
// Natural Logarithm using Taylor Series
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   ln(x) = 2(z + z³/3 + z⁵/5 + z⁷/7 + ...)
//   where z = (x-1)/(x+1)
//
// Key optimizations:
//   1. Argument reduction to get x close to 1 (faster convergence)
//   2. Exponent separation: ln(significand × 2^exp) = ln(significand) + exp × ln(2)
//   3. Square root reduction to bring value to [1, 1.001) range

BigFloat.log = BigFloat.ln = function(x) {
    BigFloatStat.log = (BigFloatStat.log ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
     
    // Handle special cases
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) 
        return x._sign > 0 ? new BigFloat(Infinity) : new BigFloat(NaN);
    if (x._special === SPECIAL_ZERO || x._sign < 0) 
        return new BigFloat(NaN);  // ln(0) = -∞, ln(negative) = NaN
    
    // ln(1) = 0
    if (x._significand === 1n && x._exponent === 0) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    // Create normalized copy with exponent = 0 (value in [1, 2))
    let z = new BigFloat(x);
    z._exponent = 0;
    
    // Estimate how many square root reductions we need
    // Target: get z close to 1 (within [1, 1.001) for fast convergence)
    // After z._exponent = 0, z is always in [1, 2)
    // ln(z) is always in [0, ln(2)] ≈ [0, 0.693]
    // 
    // We want: noReduction = ceil(log(log(z) / log(1.001)) / log(2))
    //        = ceil(log(log(z) / 0.001) / log(2))
    //
    // For z in [1, 2]:
    //   - Worst case: z ≈ 2, log(z) ≈ 0.693
    //   - log(0.693/0.001) / log(2) ≈ log(693) / log(2) ≈ 9.4
    //   - noReduction ≈ 10
    //
    // For z in [1, 1.1] (typical):
    //   - log(z) ≈ 0.095
    //   - noReduction ≈ 7
    // Fast approximation using toNumber() - much better than toString()!
    const zApprox = z.toNumber();
    let noReduction = Math.ceil(Math.log(Math.log(zApprox) / Math.log(1.001)) / Math.log(2));
    noReduction = Math.max(noReduction, 0);
    
    // Add extra precision for intermediate calculations
    const precision = x._precision + 2 + Math.ceil(Math.log10(x._precision)) + noReduction;
    // Separate exponent: ln(sig × 2^exp) = ln(sig) + exp × ln(2)
    const expo = x._exponent;
    // Set working precision
    z._precision = precision;
    
    // Argument reduction: repeatedly take square root to get close to 1
    // After k square roots: z → z^(1/2^k)
    for (let k = 0; k < noReduction; k++) 
        z = BigFloat.sqrt(z);
    
    // Now z is in [1, 1.001) range - Taylor series will converge quickly
    // Calculate z = (x - 1) / (x + 1)
    // This transforms the argument for the Taylor series
    const one = new BigFloat(1, precision);
    const zMinus1 = BigFloat.sub(z, one);
    const zPlus1 = BigFloat.add(z, one);
    z = BigFloat.div(zMinus1, zPlus1);
    
    // Calculate z²
    const zsq = BigFloat.mul(z, z);
    
    // Taylor series: ln(x) = 2(z + z³/3 + z⁵/5 + z⁷/7 + ...)
    let logx = new BigFloat(z);
    let zPower = new BigFloat(z);
    
    const targetBits = Math.ceil(precision * 3.32);
    
    // Iterate until convergence
    for (let i = 3; ; i += 2) {
        // z^i = z^(i-2) × z²
        zPower = BigFloat.mul(zPower, zsq); 
        // term = z^i / i
        const terms = BigFloat.div(zPower, new BigFloat(i, precision));
        // Check for convergence
        const newLogx = BigFloat.add(logx, terms);
        // If adding the term doesn't change the result, we've converged
        if (BigFloat.equal(newLogx, logx)) 
            break;
        // Alternative convergence check: if term is too small to matter
        if (terms._exponent < -targetBits) 
            break;
        logx = newLogx;
    }
    
    // Multiply by 2 (shift left by 1)
    logx._exponent += 1;
    
    // Adjust for square root reductions: ln(x^(1/2^k)) = ln(x) / 2^k
    // So we need to multiply by 2^k to get ln(x)
    logx._exponent += noReduction;
    
    // Adjust for original exponent: ln(sig × 2^exp) = ln(sig) + exp × ln(2)
    if (expo !== 0) {
        const ln2 = BigFloat.LN2(precision);
        const adjustment = BigFloat.mul(new BigFloat(expo, precision), ln2);
        logx = BigFloat.add(logx, adjustment);
    }
    
    // Round to target precision
    logx._precision = x._precision;
    logx._rounding = x._rounding;
    return logx._normalize();
};

BigFloat.log10 = function(x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    
    BigFloatStat.log10 = (BigFloatStat.log10 ?? 0) + 1;
    
    // Handle NaN and +infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF && x._sign > 0) return new BigFloat(Infinity);
    
    // Handle x<=0 arguments (including -infinity)
    if (x._special === SPECIAL_ZERO || x._sign < 0) {
        return new BigFloat(NaN);  // Could throw error like C++ version
    }
    
    const precision = x._precision;
    
    // res = log(x) / ln(10)
    let res = BigFloat.log(x);
    const ln10 = BigFloat.LN10(precision + 1);
    res = BigFloat.div(res, ln10);
    
    // Round to same precision and rounding mode as argument
    res._precision = precision;
    res._rounding = x._rounding;
    return res._normalize();
};

// Exponential Function: exp(x) = e^x
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Uses the identity: exp(x) = sinh(x) + √(1 + sinh²(x))
//   This is faster than Taylor series because sinh() is already optimized
//
// Special optimization:
//   If x is an integer: exp(x) = e^x (much faster using integer power)
//
// Special cases:
//   exp(0) = 1
//   exp(∞) = ∞
//   exp(-∞) = 0
BigFloat.exp = function(x) {
    BigFloatStat.exp = (BigFloatStat.exp ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    // Handle NaN and +infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF && x._sign > 0) return new BigFloat(Infinity);
    // Handle -infinity: exp(-∞) = 0
    if (x._special === SPECIAL_INF && x._sign < 0) 
        return new BigFloat(0n, x._precision, x._rounding);
    // Handle zero: exp(0) = 1
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(1n, x._precision, x._rounding);
    
    const precision = x._precision + 8 + Math.ceil(Math.log10(x._precision));
    
    // Work with absolute value
    let v = new BigFloat(x);
    v._precision = precision;
    const isNegative = v._sign < 0;
    v._sign = 1;  // Work with |x|
    const one = new BigFloat(1n);
    
    // Check if v is an integer - if so, use the much faster exp(x) = e^x
    if (v.isInteger()) {
        // exp(n) = e^n where n is integer
        // This is 100x faster than sinh method!
        const e = BigFloat.E(precision);
        const n = new BigFloat(v);
        v = BigFloat.pow(e, isNegative ? BigFloat.neg(n) : n);
    } else {
        // Use identity: exp(x) = sinh(x) + √(1 + sinh²(x))
        // Compute sinh(v)
        v = BigFloat.sinh(v);
        // Compute sinh²(v)
        const v_sq = BigFloat.mul(v, v);
        // Compute 1 + sinh²(v)
        const sum = BigFloat.add(one, v_sq);
        // Compute √(1 + sinh²(v))
        const sqrt_term = BigFloat.sqrt(sum);
        // exp(x) = sinh(x) + √(1 + sinh²(x))
        v = BigFloat.add(v, sqrt_term);
        // Handle negative x: exp(-x) = 1/exp(x)
        if (isNegative) 
            v = BigFloat.inverse(v);
    }
       
    // Round to target precision
    v._precision = x._precision;
    v._rounding = x._rounding;
    return v._normalize();
};

// Instance method
BigFloat.prototype.exp = function() {
    return BigFloat.exp(this);
};

////////////////////////////////////////////////////////////////
//
// END Primary Mathematic functions,
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Begin Trigonometric functions
//  sin(x)
//  cos(x)
//  tan(x)
//  asin(x)
//  acos(x)
//  atan(x)
//  atan2(y,x)
//
////////////////////////////////////////////////////////////////

// Sine Function: sin(x)
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Taylor series: sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
//   1) Reduce x to [0..2π] using modulo
//   2) Further reduce to [0..π] using sin(x+π) = -sin(x)
//   3) Argument reduction using trisection: sin(3x) = 3*sin(x) - 4*sin(x)^3
//   4) Taylor series expansion
//   5) Reverse the reduction
//
// Special cases:
//   - sin(0) = 0
//   - sin(NaN) = NaN
//   - sin(±Infinity) = NaN
BigFloat.sin = function(x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);   
    BigFloatStat.sin = (BigFloatStat.sin ?? 0) + 1;
    
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    
    // Handle zero: sin(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    // Calculate working precision
    let precision = x._precision + 2 + Math.ceil(Math.log10(x._precision));
    
    // Calculate optimal reduction factor
    let k = 5 * Math.ceil(Math.log(2) * Math.log(precision));
    precision += Math.floor(k / 4);
    
    // Adjust precision for extreme x values
    if (x._exponent > 10) 
        precision += Math.floor(x._exponent / 4);
    
    let v = new BigFloat(x);
    v._precision = precision;
    let sign = v._sign;
    
    if (sign < 0) 
        v._sign = 1;  // Make positive

   // v.dump2Console('var v-entry=',false); // DEBUG
    
    const c2 = new BigFloat(2n);
    const c3 = new BigFloat(3n);
    const c4 = new BigFloat(4n);   
    let sinx = new BigFloat(0n, precision);
    let pi = null;
    
    // Reduce argument to [0..2π] if needed
    // Check if v > 2*3.14159265 (rough estimate)
    const twoPiEstimate = new BigFloat(2 * Math.PI);
    if (BigFloat.greater(v, twoPiEstimate)) {
        // Calculate 2π with required precision
        pi = BigFloat.PI(precision);
        let twoPi = BigFloat.mul(pi, c2);
        
        if (BigFloat.greater(BigFloat.abs(v), twoPi)) {
            let r = BigFloat.div(v, twoPi);
            //r.dump2Console('var r=v/pi=',false); // DEBUG
            r = BigFloat.trunc(r);  // Get integer part
            //r.dump2Console('var trunc(r)',false); // DEBUG
            v = BigFloat.sub(v, BigFloat.mul(r, twoPi));
          // v.dump2Console('var v%2pi=',false); // DEBUG
        }
        
        const zero = new BigFloat(0n);
        if (BigFloat.less(v, zero)) 
            v = BigFloat.add(v, twoPi);
    }
    
    // Reduce further to [0..π]
    const piEstimate = new BigFloat(Math.PI);
    if (BigFloat.greater(v, piEstimate)) {
        if (pi === null) {
            // Increase reduction factor since we're in [π..2π] range
            k++;
        } else {
            // We already calculated π, use it
            if (BigFloat.greater(v, pi)) {
                v = BigFloat.sub(v, pi);
                sign *= -1;  // Change sign
            }
        }
    }
    
    // Adjust k if v is small (avoid unnecessary reduction)
    k += v._exponent;
    k = Math.max(0, k);
    
    //v.dump2Console('var v=',false); // DEBUG
    
    // Argument reduction using trisection: divide by 3^k
    let r = BigFloat.pow(c3, new BigFloat(k));
    v = BigFloat.div(v, r);
    
    // v^2 for Taylor series
    let vsq = BigFloat.mul(v, v);
    
    // Initialize Taylor series
    r = new BigFloat(v);
    r._precision = precision;
    sinx = new BigFloat(v);
    sinx._precision = precision;
    
    // Taylor series: sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
    let i = 3;
    let loopCnt = 1;
    
    for(;;++loopCnt) {
        // r *= -vsq / (i * (i-1))
        let denominator = new BigFloat(i * (i - 1), precision);
        r = BigFloat.mul(r, vsq);
        r = BigFloat.div(r, denominator);
        r._sign *= -1;  // Change sign
        
        // Check convergence
        let nextSinx = BigFloat.add(sinx, r);
        if (BigFloat.equal(nextSinx, sinx)) 
            break;
        
        sinx = nextSinx;
        i += 2;
    }
    
    // Reverse argument reduction using sin(3x) = 3*sin(x) - 4*sin(x)^3
    for (let j = 0; j < k; j++) {
        let sinxSq = BigFloat.mul(sinx, sinx);
        let term = BigFloat.mul(c4, sinxSq);
        term = BigFloat.sub(c3, term);
        sinx = BigFloat.mul(sinx, term);
    }
    
    // Apply original sign
    if (sign < 0) 
       sinx._sign *= -1;
    
    // Round to same precision as argument
    sinx._precision = x._precision;
    sinx._rounding = x._rounding;
    return sinx._normalize();
};

// Cosine Function: cos(x) = sqrt(1 - sin(x)^2)
// Based on Henrik Vestermark's C++ implementation
//
// This is faster than Taylor series for cos(x)
//
// Special cases:
//   - cos(NaN) = NaN
//   - cos(±Infinity) = NaN
BigFloat.cos = function(x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x); 
    BigFloatStat.cos = (BigFloatStat.cos ?? 0) + 1;
    
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    
    const c1 = new BigFloat(1n);
    
    // Compute sin(x)
    let sinx = BigFloat.sin(x);
    // cos(x) = sqrt(1 - sin^2(x))
    let sinxSq = BigFloat.mul(sinx, sinx);
    let arg = BigFloat.sub(c1, sinxSq);
    let cosx = BigFloat.sqrt(arg);
    
    // Determine sign of cos(x) using double precision approximation
    let d = x.toNumber();
    if (d !== null && Math.cos(d) < 0) 
        cosx._sign = -1;
    
    // Round to same precision as argument
    cosx._precision = x._precision;
    cosx._rounding = x._rounding;
    return cosx._normalize();
};

// Tangent Function: tan(x) = sin(x) / sqrt(1 - sin(x)^2)
// Based on Henrik Vestermark's C++ implementation
//
// Special cases:
//   - tan(0) = 0
//   - tan(π/2) = domain error (undefined)
//   - tan(3π/2) = domain error (undefined)
//   - tan(NaN) = NaN
//   - tan(±Infinity) = NaN
BigFloat.tan = function(x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);    
    BigFloatStat.tan = (BigFloatStat.tan ?? 0) + 1;
    
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    
    // Handle zero: tan(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    const precision = x._precision + 2;
    
    let v = new BigFloat(x);
    v._precision = precision;
    
    // Calculate π with working precision
    let pi = BigFloat.PI(precision);
    let twoPi = new BigFloat(pi);
    twoPi._exponent += 1;  // Multiply by 2
    
    // Reduce argument to [0..2π]
    if (BigFloat.greater(BigFloat.abs(v), twoPi)) {
        let r = BigFloat.div(v, twoPi);
        r = BigFloat.trunc(r);  // Get integer part
        v = BigFloat.sub(v, BigFloat.mul(r, twoPi));
    }
    
    const zero = new BigFloat(0n);
    if (BigFloat.less(v, zero)) 
        v = BigFloat.add(v, twoPi);
    
    // Check for domain errors at π/2 and 3π/2
    let piHalf = new BigFloat(pi);
    piHalf._exponent -= 1;  // Divide by 2
    
    const c3 = new BigFloat(3n, precision);
    let threePiHalf = BigFloat.mul(piHalf, c3);
    
    if (BigFloat.equal(v, piHalf) || BigFloat.equal(v, threePiHalf)) 
        return new BigFloat(NaN);  // Or throw domain_error
    
    // Compute sin(v)
    let tanx = BigFloat.sin(v);
    
    // Compute tan(x) = sin(x) / sqrt(1 - sin^2(x))
    const c1 = new BigFloat(1n);
    let sinxSq = BigFloat.mul(tanx, tanx);
    let sqrtArg = BigFloat.sub(c1, sinxSq);
    let sqrtVal = BigFloat.sqrt(sqrtArg);
    
    // Determine sign based on which quadrant
    if (BigFloat.less(v, piHalf) || BigFloat.greater(v, threePiHalf)) {
        // First or fourth quadrant: positive
        tanx = BigFloat.div(tanx, sqrtVal);
    } else {
        // Second or third quadrant: negative
        sqrtVal._sign = -1;
        tanx = BigFloat.div(tanx, sqrtVal);
    }
    
    // Round to same precision as argument
    tanx._precision = x._precision;
    tanx._rounding = x._rounding;
    return tanx._normalize();
};

// Inverse Sine Function: asin(x)
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Taylor series: asin(x) = x + x^3/(2*3) + (1*3)x^5/(2*4*5) + (1*3*5)x^7/(2*4*6*7) + ...
//   Argument reduction: arcsin(x) = 2*arcsin(x/(sqrt(2)*sqrt(1+sqrt(1-x^2))))
//
// Domain: -1 <= x <= 1
// Special cases:
//   - asin(0) = 0
//   - asin(1) = π/2
//   - asin(-1) = -π/2
//   - asin(|x| > 1) = NaN (domain error)
//   - asin(NaN) = NaN
//   - asin(±Infinity) = NaN
BigFloat.asin = function(x) {
       BigFloatStat.asin = (BigFloatStat.asin ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);     
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    
    const c1 = new BigFloat(1n);
    const cNeg1 = new BigFloat(-1n);
    
    // Domain check: -1 <= x <= 1
    if (BigFloat.greater(x, c1) || BigFloat.less(x, cNeg1)) 
        return new BigFloat(NaN);  // Or throw domain_error
    
    // Handle zero: asin(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    // Handle asin(1) = π/2 and asin(-1) = -π/2
    if (BigFloat.equal(x, c1) || BigFloat.equal(x, cNeg1)) {
        let v = BigFloat.PI(x._precision);
        v._exponent -= 1;  // v = PI/2
        if (x._sign < 0) 
            v._sign = -1;
        return v;
    }
    
    // Calculate working precision
    let precision = x._precision + 2 + Math.ceil(Math.log10(x._precision));
    let v = new BigFloat(x);
    let sign = v._sign;
    if (sign < 0) 
        v._sign = 1;  // Make positive
    
    // Calculate optimal reduction factor
    let k = 2 * Math.ceil(Math.log(2) * Math.log(precision));
    k = Math.min(30, k);
    // Adjust k for small values
    k += v._exponent;
    k = Math.max(0, k);
    // Adjust precision
    precision += Math.floor(k / 4);
    v._precision = precision;
    
    // Argument reduction: arcsin(x) = 2*arcsin(x/(sqrt(2)*sqrt(1+sqrt(1-x^2))))
    // k times
    const sqrt2 = BigFloat.SQRT2(precision);
    //sqrt2.dump2Console('var sqrt2', false); // DEBUG
    for (let i = 0; i < k; i++) {
        // v = v / (sqrt(2) * sqrt(1 + sqrt(1 - v^2)))
        //v.dump2Console('var v', true); // DEBUG
        let vSq = BigFloat.mul(v, v);
        //vSq.dump2Console('var v^2', true); // DEBUG
        let inner = BigFloat.sub(c1, vSq);
        //inner.dump2Console('var 1-v^2', true); // DEBUG
        let sqrtInner = BigFloat.sqrt(inner);
        //sqrtInner.dump2Console('var sqrt(1-v^2)', true); // DEBUG
        let sum = BigFloat.add(c1, sqrtInner);
        //sum.dump2Console('var 1+sqrt(1-v^2)', true); // DEBUG
        let sqrtSum = BigFloat.sqrt(sum);
        //sqrtSum.dump2Console('var sqrt(1+sqrt(1-v^2))', true); // DEBUG
        let denominator = BigFloat.mul(sqrt2, sqrtSum);
        //denominator.dump2Console('var sqrt(2)*sqrt(1+sqrt(1-v^2))', true); // DEBUG
        v = BigFloat.div(v, denominator);
        //v.dump2Console('var v=v/(sqrt(2)*sqrt(1+sqrt(1-v^2)))', true); // DEBUG
    }
    
    // v^2 for Taylor series
    let vsq = BigFloat.mul(v, v);
    // Initialize Taylor series
    let r = new BigFloat(v);
    r._precision = precision;
    let asinx = new BigFloat(v);
    asinx._precision = precision;
    
    // Taylor series: asin(x) = x + x^3/(2*3) + (1*3)x^5/(2*4*5) + ...
    let i = 3;
    let loopcnt = 1;
    
    for(;;++loopcnt,i+=2) {
        // Calculate upper coefficient: (i-2)^2
        let uc = new BigFloat((i - 2) * (i - 2), precision);
        // Calculate lower coefficient: i * (i-1)
        let lc = new BigFloat(i * (i - 1), precision);
        // r *= uc * vsq / lc
        r = BigFloat.mul(r, uc);
        r = BigFloat.mul(r, vsq);
        r = BigFloat.div(r, lc);
        
        // Check convergence
        let nextAsinx = BigFloat.add(asinx, r);
        //console.log(`Loop:${loopcnt} term exponent=${r._exponent} Target:${precision*3.32}`); // DEBUG
        if (BigFloat.equal(nextAsinx, asinx)) 
            break;
        asinx = nextAsinx;
    }
    
    // Reverse argument reduction: multiply by 2^k
    if (k > 0) 
        asinx._exponent += k;
    // Apply original sign
    if (sign < 0) 
        asinx._sign *= -1;
    // Round to same precision as argument
    asinx._precision = x._precision;
    asinx._rounding = x._rounding;
    return asinx._normalize();
};

// Inverse Cosine Function: acos(x) = π/2 - asin(x)
// Based on Henrik Vestermark's C++ implementation
//
// Domain: -1 <= x <= 1
// Special cases:
//   - acos(1) = 0
//   - acos(-1) = π
//   - acos(0) = π/2
//   - acos(|x| > 1) = NaN (domain error)
//   - acos(NaN) = NaN
//   - acos(±Infinity) = NaN
BigFloat.acos = function(x) {
        BigFloatStat.acos = (BigFloatStat.acos ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    
    const c1 = new BigFloat(1n);
    // Domain check: -1 <= x <= 1
    if (BigFloat.greater(x, c1) || BigFloat.less(x, new BigFloat(-1n))) 
        return new BigFloat(NaN);  // Or throw domain_error
    let y = new BigFloat(x);
    // Shortcut: acos(1) = 0
    if (BigFloat.equal(x, c1)) {
        y = new BigFloat(0n, x._precision, x._rounding);
        return y;
    }
    
    // y = π
    y = BigFloat.PI(y._precision);
    // Shortcut: acos(-1) = π
    if (BigFloat.equal(x, new BigFloat(-1n))) 
        return y;
    // y = π/2
    y._exponent -= 1;  // adjustExponent(-1)
    // If x != 0, compute y -= asin(x)
    if (!(x._special === SPECIAL_ZERO || x._significand === 0n)) {
        let asinVal = BigFloat.asin(x);
        y = BigFloat.sub(y, asinVal);
    }
    
    return y;
};

// Inverse Tangent Function: atan(x)
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Taylor series: atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
//   Argument reduction: atan(x) = 2*atan(x/(1+sqrt(1+x^2)))
//
// Special cases:
//   - atan(0) = 0
//   - atan(NaN) = NaN
//   - atan(±Infinity) = NaN
BigFloat.atan = function(x) {
    BigFloatStat.atan = (BigFloatStat.atan ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);    
    // Handle NaN and infinity
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    // Handle zero: atan(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    // Calculate working precision
    let precision = x._precision + 2 + Math.ceil(Math.log10(x._precision));
    let v = new BigFloat(x);
    v._precision = precision;
    // Calculate optimal reduction factor
    let k = 2 * Math.ceil(Math.log(2) * Math.log(precision));
    if (v._exponent >= 0) 
        k++;  // One reduction to get x below 1
    else 
        k += v._exponent;  // Avoid unnecessary reduction if v is small
    k = Math.max(0, k);
    // Adjust precision
    if (k > 0) 
        precision += Math.floor(k / 4);  
    v._precision = precision;  
    const c1 = new BigFloat(1n, precision, x._rounding);
    
    // Argument reduction: atan(x) = 2*atan(x/(1+sqrt(1+x^2)))
    // k times
    for (let i = k; i > 0; i--) {
        // v = v / (1 + sqrt(1 + v^2))
        let vSq = BigFloat.mul(v, v);
        let sum = BigFloat.add(c1, vSq);
        let sqrtVal = BigFloat.sqrt(sum);
        let denominator = BigFloat.add(c1, sqrtVal);
        v = BigFloat.div(v, denominator);
    }
    
    // v^2 for Taylor series
    let vsq = BigFloat.mul(v, v);
    // Initialize Taylor series
    let r = new BigFloat(v);
    r._precision = precision;
    let atanx = new BigFloat(v);
    atanx._precision = precision;
    
    // Taylor series: atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    let i = 3;
    let loopcnt = 1;
    
    for(;;++loopcnt,i+=2) {
        // v *= vsq
        v = BigFloat.mul(v, vsq);
        v._sign *= -1;  // Change sign    
        // r = v / i
        r = BigFloat.div(v, new BigFloat(i, precision));
        // Check convergence
        let nextAtanx = BigFloat.add(atanx, r);
        if (BigFloat.equal(nextAtanx, atanx)) 
            break;
        atanx = nextAtanx;
    }
    
    // Reverse argument reduction: multiply by 2^k
    atanx._exponent += k; 
    // Round to same precision as argument
    atanx._precision = x._precision;
    atanx._rounding = x._rounding;
    return atanx._normalize();
};

// Two-argument arctangent: atan2(y, x)
// Based on Henrik Vestermark's C++ implementation
//
// Returns the angle (in radians) from the X axis to the point (x, y)
//
// Special cases:
//   - atan2(0, 0) = 0
//   - atan2(y, 0) = π/2 (if y > 0) or -π/2 (if y < 0)
//   - atan2(0, x) = 0 (if x > 0) or π (if x < 0)
//   - atan2(NaN, x) = NaN
//   - atan2(y, NaN) = NaN
BigFloat.atan2 = function(y, x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    if (!(y instanceof BigFloat)) y = new BigFloat(y);
    BigFloatStat.atan2 = (BigFloatStat.atan2 ?? 0) + 1;
    
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (y._special === SPECIAL_NAN) return new BigFloat(NaN);
    
    const c0 = new BigFloat(0n, x._precision, x._rounding);
    
    // Handle atan2(0, 0) = 0
    const xIsZero = (x._special === SPECIAL_ZERO || x._significand === 0n);
    const yIsZero = (y._special === SPECIAL_ZERO || y._significand === 0n);
    
    if (xIsZero && yIsZero) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    const precision = x._precision + 2;
    let atan2x = new BigFloat(0n, precision);
    
    if (xIsZero) {
        // x = 0: return ±π/2
        atan2x = BigFloat.PI(precision);
        atan2x._exponent -= 1;  // atan2x = π/2
        
        if (BigFloat.less(y, c0)) {
            atan2x._sign = -1;
        }
    } else if (yIsZero) {
        // y = 0
        if (BigFloat.less(x, c0)) {
            // x < 0: return π
            atan2x = BigFloat.PI(precision);
        } else {
            // x > 0: return 0
            atan2x = new BigFloat(0n, precision, x._rounding);
        }
    } else {
        // General case: atan(y/x) with quadrant adjustments
        let ratio = BigFloat.div(y, x);
        atan2x = BigFloat.atan(ratio);
        
        let pi = BigFloat.PI(precision);
        
        // Quadrant II: x < 0 and y >= 0
        if (BigFloat.less(x, c0) && BigFloat.greaterequal(y, c0)) {
            atan2x = BigFloat.add(atan2x, pi);
        }
        
        // Quadrant III: x < 0 and y < 0
        if (BigFloat.less(x, c0) && BigFloat.less(y, c0)) {
            atan2x = BigFloat.sub(atan2x, pi);
        }
    }
    
    // Round to same precision as argument
    atan2x._precision = x._precision;
    atan2x._rounding = x._rounding;
    return atan2x._normalize();
};

////////////////////////////////////////////////////////////////
//
// END Trigonometric functions,
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Begin Hyperbolic functions
//  sinh(x)
//  cosh(x)
//  tanh(x)
//  asinh(x)
//  acosh(x)
//  atanh(x)
//
////////////////////////////////////////////////////////////////


// Hyperbolic Sine: sinh(x)
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Taylor series: sinh(x) = x + x³/3! + x⁵/5! + x⁷/7! + ...
//   Argument reduction: sinh(3x) = sinh(x)(3 + 4sinh²(x))
//   
// Key features:
//   - Handles sinh(0) = 0
//   - Uses sinh(-x) = -sinh(x) for negative arguments
//   - Reduces argument by dividing by 3^k, then reverses using trisection identity

BigFloat.sinh = function(x) {
    BigFloatStat.sinh = (BigFloatStat.sinh ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    
    // Handle special cases
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(x);  // sinh(±∞) = ±∞
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    // sinh(0) = 0
    if (x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    // Calculate optimal reduction factor
    // Automatically calculate optimal reduction factor as a power of two
    let k = 5 * Math.ceil(Math.log(2) * Math.log(x._precision));
    k += Math.ceil(x._exponent*0.63);  // adjust for smal/large numbers ln(2)/ln(3)
    k = Math.max(0, k);     // ensure it is positive or zero
     // Adjust precision for reductions as well
    let precision = x._precision + 5 + Math.ceil(Math.log10(x._precision)) + Math.floor(k);

    // Work with absolute value, restore sign at end
    // sinh(-x) = -sinh(x)
    let v = new BigFloat(x);
    v._precision = precision;
    const origSign = v._sign;
    v._sign = 1;  // Work with positive value
    
    // Reduce argument: v = v / 3^k
    // Compute 3^k
    let divisor = new BigFloat( 3n ** BigInt(k), precision );
    v = BigFloat.div(v, divisor);
    
    // Now v is small, use Taylor series
    // sinh(x) = x + x³/3! + x⁵/5! + x⁷/7! + ...
    const vsq = BigFloat.mul(v, v);  // v²
    let r = new BigFloat(v);
    let sinhx = new BigFloat(v);
    //v.dump2Console("v=",false);
    const targetBits = Math.ceil(precision * 3.32);
    let loopcnt=1;
    // Taylor series iteration
    for (let i = 3; ; i += 2, ++loopcnt) {
        // r *= v² / (i * (i-1))
        r = BigFloat.mul(r, vsq);
        const denom = new BigFloat(i * (i - 1),precision);
        r = BigFloat.div(r, denom);
        // Check convergence
        const newSinhx = BigFloat.add(sinhx, r);
        if (BigFloat.equal(newSinhx, sinhx)) 
            break;
        // Alternative convergence check
        if (r._exponent < -targetBits) 
            break;
        sinhx = newSinhx;
    }
    
    // Reverse argument reduction using trisection identity
    // sinh(3x) = sinh(x)(3 + 4sinh²(x))
    // So if we computed sinh(x/3^k), we need to apply this k times
    const c3 = new BigFloat(3);
    const c4 = new BigFloat(4);
    
    for (let j = 0; j < k; j++) {
        // sinhx = sinhx * (3 + 4*sinhx²)
        const sinhx_sq = BigFloat.mul(sinhx, sinhx);
        const term = BigFloat.mul(c4, sinhx_sq);
        const factor = BigFloat.add(c3, term);
        sinhx = BigFloat.mul(sinhx, factor);
    }
    
    // Restore original sign
    sinhx._sign = origSign;
    // Round to target precision
    sinhx._precision = x._precision;
    sinhx._rounding = x._rounding;
    sinhx._normalize();
    return sinhx;
};

// Instance method
BigFloat.prototype.sinh = function() {
    return BigFloat.sinh(this);
};

// ============================================================================
// Hyperbolic Cosine: cosh(x)
// ============================================================================
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   Taylor series: cosh(x) = 1 + x²/2! + x⁴/4! + x⁶/6! + ...
//   Argument reduction: cosh(3x) = cosh(x)(4cosh²(x) - 3)
//
// Key features:
//   - Handles cosh(0) = 1
//   - Uses cosh(-x) = cosh(x) for negative arguments (even function)
//   - Reduces argument by dividing by 3^k, then reverses using trisection identity

BigFloat.cosh = function(x) {
    BigFloatStat.cosh = (BigFloatStat.cosh ?? 0) + 1; 
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);

    // Handle special cases
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    if (x._special === SPECIAL_INF) return new BigFloat(Infinity);  // cosh(±∞) = +∞
    if (x._special === SPECIAL_ZERO) return new BigFloat(1n, x._precision, x._rounding);
    // cosh(0) = 1
    if (x._significand === 0n) 
        return new BigFloat(1n, x._precision, x._rounding);
    
    // Calculate optimal reduction factor
    // Automatically calculate optimal reduction factor as a power of two
    let k = 5 * Math.ceil(Math.log(2) * Math.log(x._precision));
    k += Math.ceil(x._exponent*0.63);  // adjust for smal/large numbers ln(2)/ln(3)
    k = Math.max(0, k);     // ensure it is positive or zero
     // Adjust precision for reductions as well
    let precision = x._precision + 5 + Math.ceil(Math.log10(x._precision)) + Math.floor(k);
    const targetPrec = x._precision;
     
    // Work with absolute value
    // cosh(-x) = cosh(x) - even function
    let v = new BigFloat(x);
    v._precision = precision;
    v._sign = 1;  // Work with positive value
    
    // Reduce argument: v = v / 3^k
    let divisor = new BigFloat(3n**BigInt(k));
    v = BigFloat.div(v, divisor);
    
    // Now v is small, use Taylor series
    // cosh(x) = 1 + x²/2! + x⁴/4! + x⁶/6! + ...
    const vsq = BigFloat.mul(v, v);  // v²
    const one = new BigFloat(1, precision);
    let r = new BigFloat(one);
    let coshx = new BigFloat(one);
    
    const targetBits = Math.ceil(precision * 3.32);
    
    // Taylor series iteration
    for (let i = 2; ; i += 2) {
        // r *= v² / (i * (i-1))
        r = BigFloat.mul(r, vsq);
        const denom = new BigFloat(i * (i - 1), precision);
        r = BigFloat.div(r, denom);
        // Check convergence
        const newCoshx = BigFloat.add(coshx, r);
        if (BigFloat.equal(newCoshx, coshx)) 
            break;
        // Alternative convergence check
        if (r._exponent < -targetBits) 
            break;        
        coshx = newCoshx;
    }
    
    // Reverse argument reduction using trisection identity
    // cosh(3x) = cosh(x)(4cosh²(x) - 3)
    // So if we computed cosh(x/3^k), we need to apply this k times
    const c3 = new BigFloat(3);
    const c4 = new BigFloat(4);
    
    for (let j = 0; j < k; j++) {
        // coshx = coshx * (4*coshx² - 3)
        const coshx_sq = BigFloat.mul(coshx, coshx);
        const term = BigFloat.mul(c4, coshx_sq);
        const factor = BigFloat.sub(term, c3);
        coshx = BigFloat.mul(coshx, factor);
    }
    
    // Round to target precision
    coshx._precision = targetPrec;
    coshx._rounding = x._rounding;
    return coshx._normalize();
};

BigFloat.prototype.cosh = function() {
    return BigFloat.cosh(this);
};

// ============================================================================
// Hyperbolic Tangent: tanh(x)
// ============================================================================
// Based on Henrik Vestermark's C++ implementation
//
// Algorithm:
//   tanh(x) = (exp(x) - exp(-x)) / (exp(x) + exp(-x))
//           = (e^(2x) - 1) / (e^(2x) + 1)
//
// Key features:
//   - Uses exponential function for numerical stability
//   - tanh(0) = 0
//   - tanh(±∞) = ±1

BigFloat.tanh = function(x) {
    BigFloatStat.tanh = (BigFloatStat.tanh ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    // Handle special cases
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    // Handle infinity: tanh(±∞) = ±1
    if (x._special === SPECIAL_INF) {
        const result = new BigFloat(1n, x._precision, x._rounding);
        result._sign = x._sign;
        return result;
    }
    if (x._special === SPECIAL_ZERO) return new BigFloat(0n, x._precision, x._rounding);
    // tanh(0) = 0
    if (x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    const workPrec = x._precision + 2; 
    // v = exp(x)
    let v = new BigFloat(x);
    v._precision = workPrec;
    v = BigFloat.exp(v);
    // vsq = v² = exp(2x)
    let vsq = BigFloat.mul(v, v);
    vsq._precision = workPrec;
    
    // tanh(x) = (vsq - 1) / (vsq + 1) = (e^(2x) - 1) / (e^(2x) + 1)
    const one = new BigFloat(1n);
    const numerator = BigFloat.sub(vsq, one);
    const denominator = BigFloat.add(vsq, one);
    let result = BigFloat.div(numerator, denominator);
    
    // Round to target precision
    result._precision = x._precision;
    result._rounding = x._rounding;
    return result._normalize();
};

BigFloat.prototype.tanh = function() {
    return BigFloat.tanh(this);
};

// Inverse Hyperbolic Sine: asinh(x) = ln(x + sqrt(x^2 + 1))
// Based on Henrik Vestermark's C++ implementation
//
// Special cases:
//   - asinh(0) = 0
//   - asinh(NaN) = NaN
//   - asinh(±Infinity) = ±Infinity
BigFloat.asinh = function(x) {
    BigFloatStat.asinh = (BigFloatStat.asinh ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);  
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    // Handle ±Infinity
    if (x._special === SPECIAL_INF) return new BigFloat(x._sign > 0 ? Infinity : -Infinity);
    // Handle zero: asinh(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) {
        return new BigFloat(0n, x._precision, x._rounding);
    }
    
    const workPrec = x._precision + 2;
    const c1 = new BigFloat(1n, workPrec, x._rounding);
    
    // Compute x + sqrt(x^2 + 1)
    let v = new BigFloat(x);
    v._precision = workPrec;
    // x^2
    let xSquared = BigFloat.mul(v, v);
    // x^2 + 1
    let sum = BigFloat.add(xSquared, c1);
    // sqrt(x^2 + 1)
    let sqrtVal = BigFloat.sqrt(sum);
    // x + sqrt(x^2 + 1)
    let arg = BigFloat.add(v, sqrtVal);
    // ln(x + sqrt(x^2 + 1))
    let result = BigFloat.log(arg);
    // Round to same precision as argument
    result._precision = x._precision;
    result._rounding = x._rounding;
    return result._normalize();
};

// Inverse Hyperbolic Cosine: acosh(x) = ln(x + sqrt(x^2 - 1))
// Based on Henrik Vestermark's C++ implementation
//
// Domain: x >= 1
// Special cases:
//   - acosh(x < 1) = NaN (domain error)
//   - acosh(NaN) = NaN
//   - acosh(Infinity) = Infinity
BigFloat.acosh = function(x) {
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    
    BigFloatStat.acosh = (BigFloatStat.acosh ?? 0) + 1;
    
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    
    // Handle Infinity
    if (x._special === SPECIAL_INF) {
        if (x._sign > 0) return new BigFloat(Infinity);
        return new BigFloat(NaN);  // acosh(-Infinity) = NaN
    }
    
    const c1 = new BigFloat(1n, x._precision, x._rounding);
    
    // Domain check: x must be >= 1
    if (BigFloat.less(x, c1)) {
        return new BigFloat(NaN);  // Or throw domain_error
    }
    
    const workPrec = x._precision + 1;
    
    // Compute x + sqrt(x^2 - 1)
    let v = new BigFloat(x);
    v._precision = workPrec;
    
    // x^2
    let xSquared = BigFloat.mul(v, v);
    
    // x^2 - 1
    let c1Work = new BigFloat(1n, workPrec, x._rounding);
    let diff = BigFloat.sub(xSquared, c1Work);
    
    // sqrt(x^2 - 1)
    let sqrtVal = BigFloat.sqrt(diff);
    
    // x + sqrt(x^2 - 1)
    let arg = BigFloat.add(v, sqrtVal);
    
    // ln(x + sqrt(x^2 - 1))
    let result = BigFloat.log(arg);
    
    // Round to same precision as argument
    result._precision = x._precision;
    result._rounding = x._rounding;
    return result._normalize();
};

// Inverse Hyperbolic Tangent: atanh(x) = 0.5 * ln((1+x)/(1-x))
// Based on Henrik Vestermark's C++ implementation
//
// Domain: -1 < x < 1
// Special cases:
//   - atanh(0) = 0
//   - atanh(|x| >= 1) = NaN (domain error)
//   - atanh(NaN) = NaN
//   - atanh(±Infinity) = NaN
BigFloat.atanh = function(x) {
        BigFloatStat.atanh = (BigFloatStat.atanh ?? 0) + 1;
    // Convert to BigFloat if needed
    if (!(x instanceof BigFloat)) x = new BigFloat(x);
    // Handle NaN
    if (x._special === SPECIAL_NAN) return new BigFloat(NaN);
    // Handle Infinity
    if (x._special === SPECIAL_INF) return new BigFloat(NaN);
    // Handle zero: atanh(0) = 0
    if (x._special === SPECIAL_ZERO || x._significand === 0n) 
        return new BigFloat(0n, x._precision, x._rounding);
    
    const c1 = new BigFloat(1n, x._precision, x._rounding);
    const cNeg1 = new BigFloat(-1n, x._precision, x._rounding);
    
    // Domain check: -1 < x < 1
    if (BigFloat.greaterequal(x, c1) || BigFloat.lessequal(x, cNeg1)) 
        return new BigFloat(NaN);  // Or throw domain_error

    const workPrec = x._precision + 2;
    let v = new BigFloat(x);
    v._precision = workPrec;
    
    const c1Work = new BigFloat(1n, workPrec, x._rounding);
    // (1 + x)
    let numerator = BigFloat.add(c1Work, v);
    // (1 - x)
    let denominator = BigFloat.sub(c1Work, v);
    // (1 + x) / (1 - x)
    let ratio = BigFloat.div(numerator, denominator);
    // ln((1 + x) / (1 - x))
    let result = BigFloat.log(ratio);
    // Multiply by 0.5 using adjustExponent(-1) which is equivalent to dividing by 2
    result._exponent -= 1;  // This is the adjustExponent(-1) operation
    // Round to same precision as argument
    result._precision = x._precision;
    result._rounding = x._rounding;
    return result._normalize();
};


////////////////////////////////////////////////////////////////
//
// END Hyperbolic functions,
//
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
//
// Polyfilla function for:
//  BigInt.factorial(n)
//
////////////////////////////////////////////////////////////////

(function installBigIntFactorial() {
  // Prefer feature detection
  if (typeof BigInt.factorial === "function") return;

  // Define safely, non-enumerable
  Object.defineProperty(BigInt, "factorial", {
    value: function factorial(n) {
      if (typeof n !== "bigint") n = BigInt(n);
      if (n < 0n) throw new RangeError("factorial: n must be >= 0");

      // iterative, exact
      let r = 1n;
      for (let k = 2n; k <= n; k++) r *= k;
      return r;
    },
    writable: true,
    configurable: true,
    enumerable: false
  });
})();


////////////////////////////////////////////////////////////////
//
// END Polyfilla functions,
//
////////////////////////////////////////////////////////////////